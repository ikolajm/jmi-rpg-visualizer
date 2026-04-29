'use client';

import { cn } from '@/components/atoms/cn';

type Stats = {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
};

type StatRowProps = {
  stats: Stats;
  proficientSaves?: string[];
  className?: string;
};

function mod(value: number) {
  const m = Math.floor((value - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

const STAT_ORDER: (keyof Stats)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export function StatRow({ stats, proficientSaves = [], className }: StatRowProps) {
  const profSet = new Set(proficientSaves.map(s => s.toLowerCase()));

  return (
    <div className={cn('flex items-center gap-[var(--space-1)]', className)}>
      {STAT_ORDER.map((key) => {
        const isProficient = profSet.has(key);
        return (
          <div
            key={key}
            className={cn(
              'flex flex-col items-center gap-0.5 px-[var(--space-2)] py-[var(--space-2)] rounded-[var(--radius-component)] min-w-[48px] transition-colors',
              isProficient ? 'bg-[var(--primary-container)]' : 'bg-[var(--surface-2)]',
            )}
          >
            <span className={cn(
              'text-[10px] uppercase tracking-[0.1em]',
              isProficient ? 'text-[var(--on-primary-container)] font-semibold' : 'text-[var(--on-surface-variant)]',
            )}>
              {key}
            </span>
            <div className="flex items-baseline gap-0.5">
              <span className={cn(
                'text-title-lg font-bold tabular-nums leading-none',
                isProficient ? 'text-[var(--on-primary-container)]' : 'text-[var(--on-surface)]',
              )}>
                {stats[key]}
              </span>
              <span className={cn(
                'text-[10px] font-medium tabular-nums',
                isProficient ? 'text-[var(--primary)]' : 'text-[var(--on-surface-variant)]',
              )}>
                {mod(stats[key])}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
