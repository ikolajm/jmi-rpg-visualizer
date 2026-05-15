'use client';

import { DAMAGE_VISUALS, damageColor, type DamageType } from '@/data/damage-visuals';

type DamageIconProps = {
  type: string;
  size?: string;
};

export function DamageIcon({ type, size = 'size-3' }: DamageIconProps) {
  const visual = DAMAGE_VISUALS[type as DamageType];
  if (!visual) return null;
  const Icon = visual.icon;

  return (
    <span className="inline-flex shrink-0" style={{ color: visual.color }}>
      <Icon className={size} />
    </span>
  );
}

/** Inline damage expression: icon + dice + type name */
export function DamageInline({ type, damage, className }: { type: string; damage: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-label-sm font-semibold ${className || ''}`} style={{ color: damageColor(type) }}>
      <DamageIcon type={type} size="size-2.5" />
      {damage} {type}
    </span>
  );
}
