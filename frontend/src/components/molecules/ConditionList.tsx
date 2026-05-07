'use client';

import { GameIcon } from '@/components/atoms/GameIcon';
import {
  ZapOff, Moon, Ghost, ArrowDownToLine, Gem, Brain, ShieldPlus, Crosshair, Orbit,
} from 'lucide-react';
import { DetailItem } from './DetailItem';
import { CONDITION_INFO, formatDuration } from '@/data/condition-descriptions';
import { statusColors } from '@/data/game-colors';
import type { ActiveEffect, GameCondition } from '@/data/status-effects';

/** Lucide icon lookup for conditions without PixArts icons */
const LUCIDE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  paralyzed: ZapOff,
  unconscious: Moon,
  frightened: Ghost,
  prone: ArrowDownToLine,
  petrified: Gem,
  commanded: Brain,
  shielded: ShieldPlus,
  hunterMarked: Crosshair,
  spiritGuarded: Orbit,
};

/** Condition → color */
const CONDITION_COLOR: Record<string, string> = {
  poisoned: statusColors.poisoned,
  burning: statusColors.burning,
  frozen: statusColors.frozen,
  blessed: statusColors.blessed,
  raging: statusColors.raging,
  concentrating: statusColors.concentrating,
  restrained: statusColors.cursed,
  paralyzed: statusColors.stunned,
  unconscious: statusColors.stunned,
  frightened: statusColors.cursed,
  prone: '#94a3b8',
  petrified: statusColors.frozen,
  commanded: '#a78bfa',
  shielded: statusColors.blessed,
  hunterMarked: '#f59e0b',
  spiritGuarded: statusColors.blessed,
};

function ConditionIcon({ condition, size = 'md' }: { condition: GameCondition; size?: 'md' | 'lg' }) {
  const info = CONDITION_INFO[condition];
  const color = CONDITION_COLOR[condition] || statusColors.cursed;

  if (info?.iconType === 'pixart') {
    return <GameIcon category="status" name={info.iconName} size={size} style={{ color }} />;
  }

  const LucideIcon = LUCIDE_ICONS[condition];
  if (LucideIcon) {
    return (
      <span style={{ color }}>
        <LucideIcon className={size === 'md' ? 'size-5' : 'size-6'} />
      </span>
    );
  }

  return <GameIcon category="status" name="cursed" size={size} style={{ color }} />;
}

type ConditionListProps = {
  effects: ActiveEffect[];
  className?: string;
};

export function ConditionList({ effects, className }: ConditionListProps) {
  if (effects.length === 0) return null;
  const sorted = [...effects].sort((a, b) => a.condition.localeCompare(b.condition));

  return (
    <div className={className}>
      <h4 className="text-label-md uppercase tracking-widest text-on-surface-variant mb-2">Active Conditions</h4>
      <div className="flex flex-col gap-2">
        {sorted.map(effect => {
          const info = CONDITION_INFO[effect.condition];
          if (!info) return null;
          const color = CONDITION_COLOR[effect.condition] || statusColors.cursed;
          const duration = formatDuration(effect.turnsRemaining);
          const extras: string[] = [];
          if (effect.damagePerTurn) extras.push(`${effect.damagePerTurn} ${effect.damageType || ''}/turn`);
          if (effect.value) extras.push(`+${effect.value} AC`);
          if (effect.saveDC && effect.saveAbility) extras.push(`Save: DC ${effect.saveDC} ${effect.saveAbility.toUpperCase()}`);

          return (
            <DetailItem
              key={effect.id}
              id={effect.id}
              icon={<ConditionIcon condition={effect.condition} />}
              title={info.label}
              meta={
                <span className="text-[10px] tabular-nums text-on-surface-variant">{duration}</span>
              }
              description={
                <div className="flex flex-col gap-1">
                  <p className="text-body-sm text-on-surface-variant leading-relaxed">{info.description}</p>
                  {extras.length > 0 && (
                    <p className="text-[10px] text-on-surface-variant">{extras.join(' · ')}</p>
                  )}
                </div>
              }
              borderColor={color}
            />
          );
        })}
      </div>
    </div>
  );
}
