'use client';

import { cn } from '@/components/atoms/cn';
import { GameIcon } from '@/components/atoms/GameIcon';
import { MoveDiagonal } from 'lucide-react';
import { DAMAGE_VISUALS } from '@/data/damage-visuals';
import { DamageInline } from './DamageIcon';

type AttackLineProps = {
  iconName: string;
  label: string;
  toHit: number;
  damage: string;
  damageType?: string;
  zone?: string;
  conditionInfo?: string; // e.g. "DC 10 CON → paralyzed"
  saveInfo?: string;      // e.g. "DC 12 DEX, half"
  className?: string;
};

const zoneLabels: Record<string, string> = {
  melee: 'Melee',
  adjacent: 'Adjacent',
  any: 'Any Zone',
  'melee+adjacent': 'Melee / Thrown',
};

export function AttackLine({ iconName, label, toHit, damage, damageType, zone, conditionInfo, saveInfo, className }: AttackLineProps) {
  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-component bg-surface-2', className)}>
      <GameIcon category="item" name={iconName} size="lg" className="text-on-surface-variant shrink-0" />
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="text-body-sm font-medium text-on-surface truncate">{label}</span>
        <div className="flex items-center gap-3 flex-wrap">
          {/* To hit */}
          <span className="inline-flex items-center gap-0.5 text-label-sm tabular-nums text-on-surface-variant">
            <span className="font-semibold" style={{ color: DAMAGE_VISUALS.radiant.color }}>+{toHit}</span> to hit
          </span>

          {/* Damage with type icon */}
          {damageType ? (
            <DamageInline type={damageType} damage={damage} />
          ) : (
            <span className="text-label-sm tabular-nums font-semibold text-on-surface-variant">
              {damage}
            </span>
          )}

          {/* Zone range */}
          {zone && (
            <span className="inline-flex items-center gap-0.5 text-label-sm text-on-surface-variant">
              <MoveDiagonal className="size-2.5" />
              {zoneLabels[zone] || zone}
            </span>
          )}

          {/* Save-based damage */}
          {saveInfo && (
            <span className="text-label-sm font-medium text-warning">{saveInfo}</span>
          )}

          {/* Condition on hit */}
          {conditionInfo && (
            <span className="text-label-sm font-medium text-error">{conditionInfo}</span>
          )}
        </div>
      </div>
    </div>
  );
}
