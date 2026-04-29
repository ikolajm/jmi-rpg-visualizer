'use client';

import {
  Sword, ArrowRight, Hammer, Flame, Snowflake, Zap, Waves,
  Droplet, Skull, Sun, Sparkles, Brain, Heart,
} from 'lucide-react';
import { damageColors } from '@/data/game-colors';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  slashing:    Sword,
  piercing:    ArrowRight,
  bludgeoning: Hammer,
  fire:        Flame,
  cold:        Snowflake,
  lightning:   Zap,
  thunder:     Waves,
  acid:        Droplet,
  poison:      Skull,
  necrotic:    Skull,
  radiant:     Sun,
  force:       Sparkles,
  psychic:     Brain,
  healing:     Heart,
};

type DamageIconProps = {
  type: string;
  size?: string;
};

export function DamageIcon({ type, size = 'size-3' }: DamageIconProps) {
  const Icon = ICON_MAP[type];
  const color = damageColors[type] || damageColors.slashing;

  if (!Icon) return null;

  return (
    <span className="inline-flex shrink-0" style={{ color }}>
      <Icon className={size} />
    </span>
  );
}

/** Inline damage expression: icon + dice + type name */
export function DamageInline({ type, damage, className }: { type: string; damage: string; className?: string }) {
  const color = damageColors[type] || damageColors.slashing;

  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${className || ''}`} style={{ color }}>
      <DamageIcon type={type} size="size-2.5" />
      {damage} {type}
    </span>
  );
}
