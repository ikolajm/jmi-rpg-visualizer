'use client';

import { ConditionCard } from './ConditionCard';
import type { ActiveEffect } from '@/data/status-effects';

type ConditionListProps = {
  effects: ActiveEffect[];
  className?: string;
};

export function ConditionList({ effects, className }: ConditionListProps) {
  if (effects.length === 0) return null;
  const sorted = [...effects].sort((a, b) => a.condition.localeCompare(b.condition));

  return (
    <div className={className}>
      <h4 className="text-label-md uppercase tracking-widest text-on-surface-variant mb-2">Active Conditions</h4>
      <div className="flex flex-col gap-2">
        {sorted.map(effect => (
          <ConditionCard key={effect.id} effect={effect} />
        ))}
      </div>
    </div>
  );
}
