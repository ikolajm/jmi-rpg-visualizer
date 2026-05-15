'use client';

/**
 * TokenFeedbackOverlay
 *
 * Per-card overlay that consolidates all per-target combat feedback:
 * damage / heal / miss / immune / defend (on the target card) and
 * spell-cast charge-up (on the caster card).
 *
 * Three layers, stacked on the card:
 *   1. Scrim    — dims the card content behind the result
 *   2. Flourish — themed animation (family-color radial pulse for now;
 *                 bespoke per-family treatments layer on later)
 *   3. Result   — qualifier ribbon + number-in-glyph (or label for miss/immune)
 *
 * Spell-cast charge-up is a special case: no scrim (caster stays visible),
 * no result (no number) — just a school-colored build-up flourish.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck } from 'lucide-react';
import { onCombatFeedback, type CombatFeedbackEvent, type DamageQualifier, CAST_CHARGE_MS } from '@/data/combat-events';
import { DAMAGE_VISUALS, damageColor, damageFamily, type DamageType } from '@/data/damage-visuals';
import { HIT_EVENT_VISUALS } from '@/data/hit-event-visuals';
import { schoolColors } from '@/data/game-colors';
import { tint } from '@/data/color-utils';
import {
  FireEmbers, NecroticWisps, HealingMotes, AcidSplash, PhysicalImpact,
  ThunderShockwave, ForcePulse, RadiantBeam,
  ColdShards, LightningForks,
} from './flourishes';

const HIT_DURATION_MS = 1200;   // damage / heal full overlay lifetime
const LABEL_DURATION_MS = 900;  // miss / immune
const DEFEND_DURATION_MS = 450;

/** Qualifier ribbon colors — each modifier reads as its own thing regardless of damage family */
const QUALIFIER_COLOR: Record<DamageQualifier, string> = {
  crit:       'var(--qualifier-crit)',
  vulnerable: 'var(--qualifier-vulnerable)',
  resisted:   'var(--qualifier-resisted)',
};

type TokenOverlayKind = 'damage' | 'heal' | 'miss' | 'immune' | 'spell-cast' | 'defend';

interface ActiveOverlay {
  id: string;
  kind: TokenOverlayKind;
  value?: number;
  damageType?: string;
  qualifier?: DamageQualifier;
  spellSchool?: string;
}

const KIND_DURATION_MS: Record<TokenOverlayKind, number> = {
  damage: HIT_DURATION_MS,
  heal:   HIT_DURATION_MS,
  miss:   LABEL_DURATION_MS,
  immune: LABEL_DURATION_MS,
  defend: DEFEND_DURATION_MS,
  'spell-cast': CAST_CHARGE_MS,
};

function fromEvent(event: CombatFeedbackEvent): ActiveOverlay | null {
  switch (event.type) {
    case 'damage': case 'heal':
      return { id: event.id, kind: event.type, value: event.value, damageType: event.damageType, qualifier: event.qualifier };
    case 'miss': case 'immune': case 'defend':
      return { id: event.id, kind: event.type };
    case 'spell-cast':
      return { id: event.id, kind: 'spell-cast', spellSchool: event.spellSchool };
    default:
      return null;
  }
}

export function TokenFeedbackOverlay({ entityId }: { entityId: string }) {
  const [active, setActive] = useState<ActiveOverlay | null>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const unsub = onCombatFeedback((event) => {
      if (event.targetId !== entityId) return;
      const overlay = fromEvent(event);
      if (!overlay) return;
      setActive(overlay);
      timers.push(setTimeout(
        () => setActive(prev => prev?.id === overlay.id ? null : prev),
        KIND_DURATION_MS[overlay.kind],
      ));
    });
    return () => { unsub(); timers.forEach(clearTimeout); };
  }, [entityId]);

  return (
    // mode='wait' — new overlay waits for the current one's exit to complete
    // before mounting, so back-to-back events on the same card (e.g. self-heal
    // after a self-cast) play sequentially instead of overlapping ("stacked").
    <AnimatePresence mode="wait">
      {active && <OverlayContent key={active.id} overlay={active} />}
    </AnimatePresence>
  );
}

// ─── Layered overlay content ──────────────────────────────────────────────

function OverlayContent({ overlay }: { overlay: ActiveOverlay }) {
  const showScrim = overlay.kind !== 'spell-cast' && overlay.kind !== 'defend';
  const flourishColor = resolveFlourishColor(overlay);

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden rounded-card z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.08 }}
    >
      {showScrim && <Scrim />}
      <Flourish color={flourishColor} kind={overlay.kind} />
      <FamilyFlourish overlay={overlay} color={flourishColor} />
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <ResultLayer overlay={overlay} />
      </div>
    </motion.div>
  );
}

function resolveFlourishColor(overlay: ActiveOverlay): string {
  if (overlay.kind === 'heal') return DAMAGE_VISUALS.healing.color;
  if (overlay.kind === 'damage') return damageColor(overlay.damageType);
  if (overlay.kind === 'spell-cast') return schoolColors[overlay.spellSchool ?? 'evocation'] || 'var(--school-evocation)';
  if (overlay.kind === 'miss' || overlay.kind === 'immune') return HIT_EVENT_VISUALS[overlay.kind]?.color ?? 'var(--hit-miss)';
  return 'var(--hit-miss)'; // defend — uses ShieldCheck primary tone instead, color unused
}

function Scrim() {
  return (
    <motion.div
      className="absolute inset-0 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    />
  );
}

function Flourish({ color, kind }: { color: string; kind: TokenOverlayKind }) {
  // Spell-cast: slow build + release flare at the end (the spell launching).
  if (kind === 'spell-cast') {
    return (
      <motion.div
        className="absolute inset-0"
        style={{ background: `radial-gradient(circle, ${tint(color, 87)} 0%, ${tint(color, 33)} 45%, transparent 80%)` }}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: [0, 0.55, 0.9, 1, 0], scale: [0.3, 0.7, 1, 1.25, 1.5] }}
        transition={{ duration: CAST_CHARGE_MS / 1000, ease: 'easeIn', times: [0, 0.3, 0.7, 0.9, 1] }}
      />
    );
  }
  // Defend: shield icon flash, no color wash.
  if (kind === 'defend') {
    return (
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 1.3, 1], opacity: [1, 1, 0] }}
        transition={{ duration: DEFEND_DURATION_MS / 1000 }}
      >
        <ShieldCheck className="size-12 text-primary" />
      </motion.div>
    );
  }
  // Miss / immune: no flourish — let the result label carry the moment.
  if (kind === 'miss' || kind === 'immune') return null;
  // Damage / heal: fast colored radial pulse.
  return (
    <motion.div
      className="absolute inset-0"
      style={{ background: `radial-gradient(circle, ${tint(color, 80)} 0%, ${tint(color, 33)} 45%, transparent 85%)` }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: [0, 0.95, 0], scale: [0.5, 1.15, 1.35] }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    />
  );
}

// ─── Bespoke family flourish (Umbrella B) ────────────────────────────────
// Renders damage-family-specific texture on top of the generic radial
// pulse. Unimplemented families fall through to no-op — the pulse alone
// carries the moment until a bespoke component is added.

function FamilyFlourish({ overlay, color }: { overlay: ActiveOverlay; color: string }) {
  if (overlay.kind !== 'damage' && overlay.kind !== 'heal') return null;
  const family = overlay.kind === 'heal' ? 'healing' : damageFamily(overlay.damageType);
  switch (family) {
    case 'fire':      return <FireEmbers       color={color} />;
    case 'cold':      return <ColdShards       color={color} />;
    case 'lightning': return <LightningForks   color={color} />;
    case 'thunder':   return <ThunderShockwave color={color} />;
    case 'radiant':   return <RadiantBeam      color={color} />;
    case 'necrotic':  return <NecroticWisps    color={color} />;
    case 'acid':      return <AcidSplash       color={color} />;
    case 'force':     return <ForcePulse       color={color} />;
    case 'physical':  return <PhysicalImpact   color={color} />;
    case 'healing':   return <HealingMotes     color={color} />;
  }
}

// ─── Result layer ─────────────────────────────────────────────────────────

function ResultLayer({ overlay }: { overlay: ActiveOverlay }) {
  if (overlay.kind === 'miss' || overlay.kind === 'immune') {
    return <LabelResult kind={overlay.kind} />;
  }
  if (overlay.kind === 'damage' || overlay.kind === 'heal') {
    return <ValueResult overlay={overlay} />;
  }
  // spell-cast / defend: no result layer
  return null;
}

function LabelResult({ kind }: { kind: 'miss' | 'immune' }) {
  const visual = HIT_EVENT_VISUALS[kind]!;
  return (
    <motion.span
      className="font-black uppercase tracking-widest text-body-lg"
      style={{ color: visual.color, textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 0 10px currentColor' }}
      initial={{ opacity: 0, scale: 0.7, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {visual.label}
    </motion.span>
  );
}

function ValueResult({ overlay }: { overlay: ActiveOverlay }) {
  if (overlay.value == null) return null;
  const isHeal = overlay.kind === 'heal';
  const type: DamageType = isHeal ? 'healing' : (overlay.damageType as DamageType);
  const visual = DAMAGE_VISUALS[type];
  const color = visual?.color ?? damageColor(overlay.damageType);
  const Icon = visual?.icon;
  const text = isHeal ? `+${overlay.value}` : `${overlay.value}`;
  const ribbonText = overlay.qualifier?.toUpperCase();
  const isCrit = overlay.qualifier === 'crit';

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-0.5"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25, delay: 0.1, ease: 'easeOut' }}
    >
      {ribbonText && overlay.qualifier && (
        <span
          className="text-label-sm font-black uppercase tracking-widest"
          style={{ color: QUALIFIER_COLOR[overlay.qualifier], textShadow: '0 1px 2px rgba(0,0,0,0.95), 0 0 6px currentColor' }}
        >
          {ribbonText}
        </span>
      )}
      <div className={`relative inline-flex items-center justify-center ${isCrit ? 'size-16' : 'size-14'}`}>
        {Icon && (
          <Icon
            className={`absolute inset-0 ${isCrit ? 'size-16' : 'size-14'}`}
            style={{ color, opacity: 0.4, filter: `drop-shadow(0 0 6px ${color})` }}
          />
        )}
        <span
          className={`relative font-black tabular-nums ${isCrit ? 'text-title-md' : 'text-title-sm'}`}
          style={{ color, textShadow: `0 1px 3px rgba(0,0,0,0.95), 0 0 10px ${color}` }}
        >
          {text}
        </span>
      </div>
    </motion.div>
  );
}
