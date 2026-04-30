'use client';

import { cn } from '@/components/atoms/cn';
import { GameIcon, type IconCategory } from '@/components/atoms/GameIcon';

type CreatureHeaderProps = {
  iconCategory: IconCategory;
  iconName: string;
  name: string;
  type?: string;
  level?: number;
  cr?: number;
  className?: string;
};

export function CreatureHeader({ iconCategory, iconName, name, type, level, cr, className }: CreatureHeaderProps) {
  const subtitle = [
    type && type.charAt(0).toUpperCase() + type.slice(1),
    level !== undefined && `Level ${level}`,
    cr !== undefined && `CR ${cr}`,
  ].filter(Boolean).join(' · ');

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <GameIcon category={iconCategory} name={iconName} size="xl" className="text-primary shrink-0" />
      <div className="flex flex-col min-w-0">
        <span className="text-title-md font-semibold text-on-surface truncate">{name}</span>
        {subtitle && (
          <span className="text-label-sm text-on-surface-variant">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
