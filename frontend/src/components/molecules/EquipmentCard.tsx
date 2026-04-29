'use client';

import { cn } from '@/components/atoms/cn';
import { GameIcon } from '@/components/atoms/GameIcon';
import { AcShield } from './AcShield';
import { Shield, Swords, CircleDot } from 'lucide-react';

type EquipmentCardProps = {
  slot: 'weapon' | 'armor' | 'shield' | 'defense';
  iconName: string;
  label: string;
  stats?: string;
  note?: string;
  acValue?: number;
  className?: string;
};

const SLOT_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  weapon: { label: 'Main Hand', icon: <Swords className="size-3" /> },
  armor: { label: 'Body', icon: <Shield className="size-3" /> },
  shield: { label: 'Off Hand', icon: <Shield className="size-3" /> },
  defense: { label: 'Defense', icon: <CircleDot className="size-3" /> },
};

export function EquipmentCard({ slot, iconName, label, stats, note, acValue, className }: EquipmentCardProps) {
  const slotInfo = SLOT_LABELS[slot] || SLOT_LABELS.weapon;

  return (
    <div className={cn(
      'flex items-center gap-[var(--space-3)] p-[var(--space-3)] rounded-[var(--radius-component)] bg-[var(--surface-2)]',
      className,
    )}>
      <GameIcon category="item" name={iconName} size="lg" className="text-[var(--on-surface-variant)] shrink-0" />

      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-body-sm font-medium text-[var(--on-surface)] truncate">{label}</span>
        {stats && (
          <span className="text-[10px] text-[var(--on-surface-variant)]">{stats}</span>
        )}
        {note && (
          <span className="text-[10px] text-[var(--on-surface-variant)] italic">{note}</span>
        )}
      </div>

      <div className="flex items-center gap-[var(--space-2)] shrink-0">
        {acValue !== undefined && (
          <AcShield value={acValue} size="sm" />
        )}
        <span className="inline-flex items-center gap-1 text-[10px] text-[var(--on-surface-variant)]">
          {slotInfo.icon}
          {slotInfo.label}
        </span>
      </div>
    </div>
  );
}
