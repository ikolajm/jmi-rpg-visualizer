'use client';

import { cn } from '@/components/atoms/cn';
import { resourceColors } from '@/data/game-colors';

type SpellSlotPipsProps = {
  total: number;
  used?: number;
  size?: 'sm' | 'md';
  className?: string;
};

const pipSize: Record<string, string> = {
  sm: 'size-2',
  md: 'size-3',
};

export function SpellSlotPips({ total, used = 0, size = 'md', className }: SpellSlotPipsProps) {
  const remaining = total - used;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            'rounded-full border transition-colors',
            pipSize[size],
            i >= remaining && 'bg-transparent border-[var(--outline-subtle)]',
          )}
          style={i < remaining ? { backgroundColor: resourceColors.spellSlot, borderColor: resourceColors.spellSlot } : undefined}
        />
      ))}
    </div>
  );
}
