'use client';

import { cn } from '@/components/atoms/cn';
import { GameIcon } from '@/components/atoms/GameIcon';
import { HealthBar } from './HealthBar';
import { AcShield } from './AcShield';
import { StatusStack, type StatusEffect } from './StatusStack';
type ZoneTokenProps = {
  isCharacter: boolean;
  name: string;
  iconCategory: 'class' | 'monster';
  iconName: string;
  hp: number;
  maxHp: number;
  ac: number;
  statusEffects?: StatusEffect[];
  isActive?: boolean;
  isDead?: boolean;
  onClick?: () => void;
};

export function ZoneToken({
  isCharacter, name, iconCategory, iconName,
  hp, maxHp, ac, statusEffects = [],
  isActive, isDead, onClick,
}: ZoneTokenProps) {
  return (
    <button
      onClick={onClick}
      disabled={isDead}
      className={cn(
        'flex flex-col items-center gap-[var(--space-1)] p-[var(--space-2)] rounded-[var(--radius-card)] transition-all cursor-pointer w-[100px]',
        isDead && 'grayscale opacity-30 cursor-not-allowed',
        isCharacter
          ? 'bg-[var(--surface-2)] border-2 border-[var(--primary)]/30 hover:border-[var(--primary)]'
          : 'bg-[var(--error)]/5 border-2 border-[var(--error)]/30 hover:border-[var(--error)]',
        isActive && isCharacter && 'scale-105 border-[var(--primary)] shadow-[0_0_16px_var(--primary)]',
        isActive && !isCharacter && 'scale-105 border-[var(--error)] shadow-[0_0_16px_var(--error)]',
      )}
    >
      {/* Class/Monster icon — large */}
      <GameIcon
        category={iconCategory}
        name={iconName}
        size="xl"
        className={isCharacter ? 'text-[var(--primary)]' : 'text-[var(--error)]'}
      />

      {/* Name */}
      <span className={cn(
        'text-[10px] font-semibold truncate w-full text-center',
        isCharacter
          ? 'font-[family-name:var(--font-heading)] tracking-[0.06em] text-[var(--on-surface)]'
          : 'text-[var(--error)]',
      )}>
        {name}
      </span>

      {/* HP bar — prominent */}
      <HealthBar current={hp} max={maxHp} size="sm" className="w-full" />

      {/* AC + Status effects */}
      <div className="flex items-center gap-[var(--space-1)]">
        <AcShield value={ac} size="sm" />
        {statusEffects.length > 0 && (
          <StatusStack effects={statusEffects} size="sm" />
        )}
      </div>
    </button>
  );
}
