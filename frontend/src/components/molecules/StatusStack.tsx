'use client';

import { cn } from '@/components/atoms/cn';
import { GameIcon } from '@/components/atoms/GameIcon';
import { statusColors } from '@/data/game-colors';

/** The 8 game status effects */
export type StatusEffect = 'poisoned' | 'burning' | 'frozen' | 'cursed' | 'blessed' | 'stunned' | 'raging' | 'concentrating';

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
          style={{ color: statusColors[effect] }}
        >
          <GameIcon category="status" name={effect} size={size === 'sm' ? 'xs' : 'sm'} />
        </span>
      ))}
    </div>
  );
}
