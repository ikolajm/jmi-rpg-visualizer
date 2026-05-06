'use client';

import { cn } from '@/components/atoms/cn';
import { GameIcon, type IconCategory } from '@/components/atoms/GameIcon';

type CreatureHeaderProps = {
  iconCategory?: IconCategory;
  iconName?: string;
  name: string;
  type?: string;
  level?: number;
  cr?: number;
  xp?: number;
  badge?: React.ReactNode;
  className?: string;
};

export function CreatureHeader({ iconCategory, iconName, name, type, level, cr, xp, badge, className }: CreatureHeaderProps) {
  const subtitle = [
    type && type.charAt(0).toUpperCase() + type.slice(1),
    level !== undefined && `Level ${level}`,
    cr !== undefined && `CR ${cr}`,
    xp !== undefined && `${xp} XP`,
  ].filter(Boolean).join(' · ');

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {iconCategory && iconName && (
        <GameIcon category={iconCategory} name={iconName} size="xl" className="text-primary shrink-0" />
      )}
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-title-md font-semibold text-on-surface truncate">{name}</span>
          {badge}
        </div>
        {subtitle && (
          <span className="text-label-sm text-on-surface-variant">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
