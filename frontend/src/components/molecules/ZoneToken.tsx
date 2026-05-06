'use client';

import { cn } from '@/components/atoms/cn';
import { GameIcon } from '@/components/atoms/GameIcon';
import { AcShield } from './AcShield';
import { StatusStack, type StatusEffect } from './StatusStack';
import type { GameCondition } from '@/data/status-effects';
import { Heart } from 'lucide-react';
import { resourceColors } from '@/data/game-colors';

type ZoneTokenProps = {
  isCharacter: boolean;
  name: string;
  iconCategory: 'class' | 'monster';
  iconName: string;
  hp: number;
  maxHp: number;
  ac: number;
  statusEffects?: (StatusEffect | GameCondition)[];
  isActive?: boolean;
  isDead?: boolean;
  onClick?: () => void;
};

export function ZoneToken({
  isCharacter, name, iconCategory, iconName,
  hp, maxHp, ac, statusEffects = [],
  isActive, isDead, onClick,
}: ZoneTokenProps) {
  const hpPct = maxHp > 0 ? hp / maxHp : 0;
  const hpColor = hpPct <= 0.1 ? resourceColors.hpCritical
    : hpPct <= 0.25 ? resourceColors.hpLow
    : resourceColors.hp;

  return (
    <button
      onClick={onClick}
      disabled={isDead}
      className={cn(
        'flex flex-col items-center gap-1 p-2 rounded-card transition-all cursor-pointer w-[110px]',
        isDead && 'grayscale opacity-30 cursor-not-allowed',
        isCharacter
          ? 'bg-surface-2 border-2 border-primary/20 hover:border-primary/60'
          : 'bg-surface-2 border-2 border-error/20 hover:border-error/60',
        isActive && isCharacter && 'scale-110 border-primary shadow-[0_0_20px_var(--primary)] ring-2 ring-primary/50 z-10',
        isActive && !isCharacter && 'scale-110 border-error shadow-[0_0_20px_var(--error)] ring-2 ring-error/50 z-10',
      )}
    >
      {/* Icon */}
      <GameIcon
        category={iconCategory}
        name={iconName}
        size="xl"
        className={isCharacter ? 'text-primary' : 'text-error'}
      />

      {/* Name */}
      <span className={cn(
        'text-label-sm font-semibold truncate w-full text-center leading-tight',
        isCharacter
          ? 'font-[family-name:var(--font-heading)] tracking-[0.06em] text-on-surface'
          : 'text-error',
      )}>
        {name}
      </span>

      {/* HP + AC row */}
      <div className="flex items-center justify-center gap-2 w-full">
        <span className="inline-flex items-center gap-0.5 text-[12px] font-bold tabular-nums" style={{ color: hpColor }}>
          <Heart className="size-3 fill-current" />
          {hp}/{maxHp}
        </span>
        <AcShield value={ac} size="sm" />
      </div>

      {/* Status effects tray */}
      {statusEffects.length > 0 && (
        <StatusStack effects={statusEffects} size="sm" />
      )}
    </button>
  );
}
