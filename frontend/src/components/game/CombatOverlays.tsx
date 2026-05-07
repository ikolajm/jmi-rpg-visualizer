'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck } from 'lucide-react';
import { onCombatFeedback, type CombatFeedbackEvent } from '@/data/combat-events';
import { damageColors, schoolColors } from '@/data/game-colors';

/** Find a token's center position on screen */
function getTokenPosition(targetId: string): { x: number; y: number } | null {
  const el = document.querySelector(`[data-entity-id="${targetId}"]`);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

// ─── Impact Slash ────────────────────────────────────────────

function ImpactSlash({ event }: { event: CombatFeedbackEvent }) {
  const pos = getTokenPosition(event.targetId);
  if (!pos) return null;
  const color = event.damageType ? (damageColors[event.damageType] || '#c4bdb8') : '#c4bdb8';
  const rotation = -15 + Math.random() * 30;

  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
      initial={{ scale: 0.5, opacity: 1 }}
      animate={{ scale: 1.2, opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: `rotate(${rotation}deg)` }}>
        <line x1="10" y1="8" x2="38" y2="40" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.9" />
        <line x1="16" y1="4" x2="32" y2="44" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <line x1="6" y1="14" x2="42" y2="34" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    </motion.div>
  );
}

// ─── Defend Shield ───────────────────────────────────────────

function DefendShield({ event }: { event: CombatFeedbackEvent }) {
  const pos = getTokenPosition(event.targetId);
  if (!pos) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: [0, 1.3, 1], opacity: [1, 1, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <ShieldCheck className="size-10 text-primary" />
    </motion.div>
  );
}

// ─── Spell Cast Glow ─────────────────────────────────────────

function SpellCastGlow({ event }: { event: CombatFeedbackEvent }) {
  const pos = getTokenPosition(event.targetId);
  if (!pos) return null;
  const color = event.spellSchool ? (schoolColors[event.spellSchool] || '#8b7fd4') : '#8b7fd4';

  return (
    <motion.div
      className="fixed pointer-events-none z-40 rounded-full"
      style={{
        left: pos.x,
        top: pos.y,
        transform: 'translate(-50%, -50%)',
        width: 80,
        height: 80,
        background: `radial-gradient(circle, ${color}60 0%, transparent 70%)`,
      }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: [0, 0.7, 0], scale: [0.6, 1.2, 1.4] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    />
  );
}

// ─── Kill Vignette ───────────────────────────────────────────

function KillVignette({ event }: { event: CombatFeedbackEvent }) {
  const intensity = event.isPartyMember ? '0.4' : '0.25';

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-40"
      style={{
        boxShadow: `inset 0 0 120px rgba(200, 0, 0, ${intensity})`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    />
  );
}

// ─── Main Component ──────────────────────────────────────────

const OVERLAY_DURATION: Record<string, number> = {
  impact: 300,
  defend: 450,
  'spell-cast': 350,
  kill: 450,
};

export function CombatOverlays() {
  const [events, setEvents] = useState<CombatFeedbackEvent[]>([]);

  useEffect(() => {
    return onCombatFeedback((event) => {
      const duration = OVERLAY_DURATION[event.type];
      if (!duration) return; // Only handle overlay event types

      setEvents(prev => [...prev, event]);
      setTimeout(() => {
        setEvents(prev => prev.filter(e => e.id !== event.id));
      }, duration);
    });
  }, []);

  return (
    <AnimatePresence>
      {events.map((event) => {
        switch (event.type) {
          case 'impact':
            return <ImpactSlash key={event.id} event={event} />;
          case 'defend':
            return <DefendShield key={event.id} event={event} />;
          case 'spell-cast':
            return <SpellCastGlow key={event.id} event={event} />;
          case 'kill':
            return <KillVignette key={event.id} event={event} />;
          default:
            return null;
        }
      })}
    </AnimatePresence>
  );
}
