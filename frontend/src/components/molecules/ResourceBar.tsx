'use client';

import { cn } from '@/components/atoms/cn';

type ResourceBarProps = {
  current: number;
  max: number;
  color: string;
  colorLow?: string;
  colorCritical?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const trackSize: Record<string, string> = {
  sm: 'h-3 text-[10px]',
  md: 'h-5 text-label-sm',
  lg: 'h-7 text-label-md',
};

export function ResourceBar({
  current, max, color, colorLow, colorCritical,
  label, size = 'md', className,
}: ResourceBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const isLow = pct <= 25;
  const isCritical = pct <= 10;

  const barColor = isCritical && colorCritical ? colorCritical
    : isLow && colorLow ? colorLow
    : color;

  return (
    <div
      className={cn(
        'relative w-full rounded-component bg-surface-3 overflow-hidden',
        trackSize[size],
        className,
      )}
    >
      <div
        className="absolute inset-y-0 left-0 transition-all duration-300 rounded-component"
        style={{ width: `${pct}%`, backgroundColor: barColor }}
      />
      <span className="relative z-10 flex items-center justify-center h-full font-semibold text-white tabular-nums">
        {label ?? `${current}/${max}`}
      </span>
    </div>
  );
}
