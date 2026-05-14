'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/components/atoms/cn';
import { motion } from 'motion/react';
import { GameIcon } from '@/components/atoms/GameIcon';
import { onCombatFeedback } from '@/data/combat-events';
import { AcShield } from './AcShield';
import { StatusStack, type StatusEffect } from './StatusStack';
import type { GameCondition } from '@/data/status-effects';
import type { IntentType } from '@/data/game-types';
import { Heart, Sword, Crosshair, Flame, Zap, Moon } from 'lucide-react';
import { resourceColors, statusColors } from '@/data/game-colors';

/** Priority-ordered condition tints for token background */
const CONDITION_TINTS: Record<string, string> = {
  burning: statusColors.burning,
  frozen: statusColors.frozen,
  poisoned: statusColors.poisoned,
  paralyzed: statusColors.stunned,
  unconscious: statusColors.stunned,
  petrified: statusColors.frozen,
  staggered: '#f97316',
  restrained: statusColors.cursed,
  blessed: statusColors.blessed,
  raging: statusColors.raging,
};

const INTENT_ICON: Record<IntentType, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  melee:     { icon: Sword,     color: '#ef4444', label: 'Melee Attack' },
  ranged:    { icon: Crosshair, color: '#f59e0b', label: 'Ranged Attack' },
  breath:    { icon: Flame,     color: '#f97316', label: 'Breath / AoE' },
  condition: { icon: Zap,       color: '#a78bfa', label: 'Status Effect' },
  skip:      { icon: Moon,      color: '#64748b', label: 'Disabled' },
};

/** Compute swing direction based on zone relationship */
function getSwingMotion(attackerZone: number, targetZone: number): { x: number[]; y: number[] } {
  const zoneDiff = targetZone - attackerZone;
  if (zoneDiff === 0) {
    // Same zone — short downward chop
    return { x: [0, 0, 0], y: [0, 8, 0] };
  } else if (Math.abs(zoneDiff) === 1) {
    // Adjacent zone — diagonal swing
    const xDir = zoneDiff > 0 ? 1 : -1;
    return { x: [0, 12 * xDir, 0], y: [0, 6, 0] };
  } else {
    // Far zone — steep diagonal arc
    const xDir = zoneDiff > 0 ? 1 : -1;
    return { x: [0, 20 * xDir, 0], y: [0, 4, 0] };
  }
}

type ZoneTokenProps = {
  entityId: string;
  isCharacter: boolean;
  name: string;
  iconCategory: 'class' | 'monster';
  iconName: string;
  hp: number;
  maxHp: number;
  ac: number;
  statusEffects?: (StatusEffect | GameCondition)[];
  intent?: IntentType;
  isActive?: boolean;
  isDead?: boolean;
  onClick?: () => void;
};

export function ZoneToken({
  entityId, isCharacter, name, iconCategory, iconName,
  hp, maxHp, ac, statusEffects = [], intent,
  isActive, isDead, onClick,
}: ZoneTokenProps) {
  const hpPct = maxHp > 0 ? hp / maxHp : 0;
  const hpColor = hpPct <= 0.1 ? resourceColors.hpCritical
    : hpPct <= 0.25 ? resourceColors.hpLow
    : resourceColors.hp;

  const [shaking, setShaking] = useState(false);
  const [swingAnim, setSwingAnim] = useState<{ x: number[]; y: number[] } | null>(null);
  const [pulseKey, setPulseKey] = useState(0);

  // Compute condition tint (first matching condition wins)
  const conditionTint = statusEffects.reduce<string | null>((tint, effect) => {
    if (tint) return tint;
    return CONDITION_TINTS[effect as string] || null;
  }, null);

  // Pulse on becoming active
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: re-keys the token to replay its activation pulse
    if (isActive && !isDead) setPulseKey(k => k + 1);
  }, [isActive, isDead]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const unsub = onCombatFeedback((event) => {
      // Crit shake (on target)
      if (event.targetId === entityId && event.type === 'crit') {
        setShaking(true);
        timers.push(setTimeout(() => setShaking(false), 300));
      }
      // Attack swing (on attacker)
      if (event.attackerId === entityId && event.type === 'attack-swing') {
        const aZone = event.attackerZone ?? 2;
        const tZone = event.targetZone ?? 2;
        setSwingAnim(getSwingMotion(aZone, tZone));
        timers.push(setTimeout(() => setSwingAnim(null), 250));
      }
    });
    return () => { unsub(); timers.forEach(clearTimeout); };
  }, [entityId]);

  return (
    <motion.div
      data-entity-id={entityId}
      layoutId={entityId}
      initial={false}
      key={`${entityId}-${pulseKey}`}
      animate={isDead
        ? { scale: 0.8, opacity: 0.2, filter: 'grayscale(1)', x: 0 }
        : isActive
          ? { scale: [1.08, 1], opacity: 1, filter: 'grayscale(0)', x: shaking ? [0, -5, 5, -5, 3, 0] : 0 }
          : { scale: 1, opacity: 1, filter: 'grayscale(0)', x: shaking ? [0, -5, 5, -5, 3, 0] : 0 }
      }
      transition={{ duration: shaking ? 0.3 : 0.4, layout: { duration: 0.3, ease: 'easeInOut' as const } }}
    >
    {/* Inner motion.div for attack swing — independent from layoutId */}
    <motion.div
      animate={swingAnim
        ? { x: swingAnim.x, y: swingAnim.y }
        : { x: 0, y: 0 }
      }
      transition={{ duration: 0.2, ease: 'easeInOut' as const }}
    >
    <button
      onClick={onClick}
      disabled={isDead}
      className={cn(
        'flex flex-col items-center gap-1 p-2 rounded-card transition-all cursor-pointer w-[110px]',
        isDead && 'cursor-not-allowed',
        isCharacter
          ? 'bg-surface-2 border-2 border-primary/20 hover:border-primary/60'
          : 'bg-surface-2 border-2 border-error/20 hover:border-error/60',
        isActive && isCharacter && 'scale-110 border-primary shadow-[0_0_20px_var(--primary)] ring-2 ring-primary/50 z-10',
        isActive && !isCharacter && 'scale-110 border-error shadow-[0_0_20px_var(--error)] ring-2 ring-error/50 z-10',
      )}
      style={conditionTint && !isDead ? { boxShadow: `inset 0 0 20px ${conditionTint}25` } : undefined}
    >
      {/* Intent badge (enemies only) */}
      {intent && !isDead && (() => {
        const cfg = INTENT_ICON[intent];
        const IntentIcon = cfg.icon;
        return (
          <span
            title={cfg.label}
            className="flex items-center justify-center size-5 rounded-full bg-surface-1 border border-outline-subtle/50 animate-pulse"
            style={{ color: cfg.color }}
          >
            <IntentIcon className="size-3" />
          </span>
        );
      })()}

      {/* Icon */}
      <GameIcon
        category={iconCategory}
        name={iconName}
        size="xl"
        className={isCharacter ? 'text-primary' : 'text-error'}
      />

      {/* Name */}
      <span className={cn(
        'text-label-sm font-semibold truncate w-full text-center leading-tight',
        isCharacter
          ? 'font-heading tracking-wider text-on-surface'
          : 'text-error',
      )}>
        {name}
      </span>

      {/* HP + AC row */}
      <div className="flex items-center justify-center gap-2 w-full">
        <span className="inline-flex items-center gap-0.5 text-label-sm font-bold tabular-nums" style={{ color: hpColor }}>
          <Heart className="size-3 fill-current" />
          {hp}/{maxHp}
        </span>
        <AcShield value={ac} size="sm" />
      </div>

      {/* Status effects tray */}
      {statusEffects.length > 0 && (
        <StatusStack effects={statusEffects} size="sm" />
      )}
    </button>
    </motion.div>
    </motion.div>
  );
}
