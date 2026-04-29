'use client';

import { cn } from '@/components/atoms/cn';
import { GameIcon } from '@/components/atoms/GameIcon';

/** The 8 game status effects */
export type StatusEffect = 'poisoned' | 'burning' | 'frozen' | 'cursed' | 'blessed' | 'stunned' | 'raging' | 'concentrating';

const STATUS_COLORS: Record<StatusEffect, string> = {
  poisoned: '#5bad5a',
  burning: '#e8723a',
  frozen: '#5b9bd5',
  cursed: '#9b7fd4',
  blessed: '#e8c263',
  stunned: '#9a9590',
  raging: '#c43c3c',
  concentrating: '#4a7fd4',
};

type StatusStackProps = {
  effects: StatusEffect[];
  size?: 'sm' | 'md';
  className?: string;
};

export function StatusStack({ effects, size = 'sm', className }: StatusStackProps) {
  if (effects.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {effects.map((effect) => (
        <span
          key={effect}
          title={effect.charAt(0).toUpperCase() + effect.slice(1)}
          style={{ color: STATUS_COLORS[effect] }}
        >
          <GameIcon category="status" name={effect} size={size === 'sm' ? 'xs' : 'sm'} />
        </span>
      ))}
    </div>
  );
}
