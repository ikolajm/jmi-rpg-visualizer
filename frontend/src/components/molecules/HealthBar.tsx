'use client';

import { ResourceBar } from './ResourceBar';
import { resourceColors } from '@/data/game-colors';

type HealthBarProps = {
  current: number;
  max: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function HealthBar({ current, max, size = 'md', className }: HealthBarProps) {
  return (
    <ResourceBar
      current={current}
      max={max}
      color={resourceColors.hp}
      colorLow={resourceColors.hpLow}
      colorCritical={resourceColors.hpCritical}
      size={size}
      className={className}
    />
  );
}
