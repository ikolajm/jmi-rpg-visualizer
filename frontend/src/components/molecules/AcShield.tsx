'use client';

import { cn } from '@/components/atoms/cn';

type AcShieldProps = {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeConfig: Record<string, { shield: string; text: string }> = {
  sm: { shield: 'size-8', text: 'text-label-sm' },
  md: { shield: 'size-10', text: 'text-body-md' },
  lg: { shield: 'size-14', text: 'text-title-md' },
};

export function AcShield({ value, size = 'md', className }: AcShieldProps) {
  const s = sizeConfig[size];

  return (
    <div className={cn('relative inline-flex items-center justify-center', s.shield, className)}>
      {/* Shield shape */}
      <svg viewBox="0 0 24 28" fill="none" className="absolute inset-0 size-full">
        <path
          d="M12 1L2 5.5V12.5C2 19.5 6.5 25.5 12 27C17.5 25.5 22 19.5 22 12.5V5.5L12 1Z"
          fill="var(--surface-2)"
          stroke="var(--primary)"
          strokeWidth="1.5"
        />
      </svg>
      <span className={cn('relative z-10 font-bold tabular-nums text-[var(--primary)]', s.text)}>
        {value}
      </span>
    </div>
  );
}
