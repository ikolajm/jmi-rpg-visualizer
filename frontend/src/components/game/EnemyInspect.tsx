'use client';

import { SheetHeader, SheetTitle } from '@/components/atoms/Sheet';
import { GameIcon } from '@/components/atoms/GameIcon';
import {
  HealthBar, AcShield, StatRow, ResistanceRow, AttackLine,
} from '@/components/molecules';
import { DetailItem } from '@/components/molecules/DetailItem';
import { ConditionList } from '@/components/molecules/ConditionList';
import { useGame } from '@/components/providers/GameProvider';
import type { Enemy } from '@/data/game-types';

const BEHAVIOR_LABELS: Record<string, { label: string; color: string }> = {
  'melee-aggro': { label: 'Melee', color: '#ef4444' },
  'flexible': { label: 'Flexible', color: '#f59e0b' },
  'caster': { label: 'Caster', color: '#8b5cf6' },
  'passive': { label: 'Passive', color: '#6b7280' },
};

export function EnemyInspect({ enemy }: { enemy: Enemy }) {
  const behaviorInfo = BEHAVIOR_LABELS[enemy.behavior] || BEHAVIOR_LABELS['melee-aggro'];
  const { state } = useGame();
  const activeEffects = state.combat?.activeEffects.filter(e => e.targetId === enemy.id) || [];

  const attacks = enemy.actions.filter(a => a.toHit !== undefined).sort((a, b) => a.name.localeCompare(b.name));
  const abilities = enemy.actions.filter(a => a.toHit === undefined).sort((a, b) => a.name.localeCompare(b.name));
  const sortedTraits = [...enemy.specialAbilities].sort((a, b) => a.name.localeCompare(b.name));
  const typeName = enemy.type.charAt(0).toUpperCase() + enemy.type.slice(1);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="sr-only">{enemy.name}</SheetTitle>
        <div className="flex flex-col gap-2">
          {/* Name + behavior badge */}
          <div className="flex items-center gap-2">
            <span className="text-title-md font-semibold text-on-surface truncate">{enemy.name}</span>
          </div>

          {/* HP + AC row */}
          <div className="flex items-center gap-1.5">
            <HealthBar current={enemy.hp} max={enemy.maxHp} size="md" className="flex-1" />
            <AcShield value={enemy.ac} size="sm" />
          </div>

          {/* CR + XP inline */}
          <div className="flex items-center gap-3">
            <span className="text-label-sm text-on-surface-variant">CR {enemy.cr}</span>
            <span className="text-label-sm text-on-surface-variant">•</span>
            <span className="text-label-sm text-on-surface-variant">{enemy.xp} XP</span>
          </div>
        </div>
      </SheetHeader>

      <div className="flex flex-col gap-3 mt-4">
        {activeEffects.length > 0 && <ConditionList effects={activeEffects} />}

        {/* Stats */}
        <StatRow stats={enemy.stats} />

        {/* Defenses — species icon + type as section intro */}
        <div className="h-px bg-primary/30" />
        <div className="flex items-center gap-2">
          <GameIcon category="monster" name={enemy.type} size="lg" className="text-on-surface-variant shrink-0" />
          <h4 className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">{typeName} Information</h4>
        </div>
        <ResistanceRow resistances={enemy.damageResistances}
          immunities={enemy.damageImmunities} vulnerabilities={enemy.damageVulnerabilities} />

        {/* Attacks — behavior type in header */}
        {attacks.length > 0 && (
          <>
            <div className="h-px bg-primary/30" />
            <div className="flex items-center gap-2">
              <h4 className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">Attacks</h4>
              <span
                className="text-label-sm font-semibold px-1.5 py-0.5 rounded-full"
                style={{ color: behaviorInfo.color, backgroundColor: `${behaviorInfo.color}18` }}
              >
                {behaviorInfo.label}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {attacks.map((a) => (
                <AttackLine key={a.name} iconName="sword" label={a.name}
                  toHit={a.toHit || 0} damage={a.damage || ''} damageType={a.damageType} zone={a.reach}
                  conditionInfo={a.conditionDC ? `DC ${a.conditionDC} ${(a.conditionSave || '').toUpperCase()} → ${a.conditionApplied}` : undefined}
                  saveInfo={a.saveDC && !a.toHit ? `DC ${a.saveDC} ${(a.saveType || 'DEX').toUpperCase()}, ${a.saveSuccess || 'half'}` : undefined}
                />
              ))}
            </div>
          </>
        )}

        {/* Traits */}
        {sortedTraits.length > 0 && (
          <>
            <div className="h-px bg-primary/30" />
            <div className="flex flex-col gap-2">
              <h4 className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">Traits</h4>
              {sortedTraits.map((sa) => (
                <DetailItem
                  key={sa.name}
                  id={`trait-${sa.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  title={sa.name}
                  description={sa.description}
                />
              ))}
            </div>
          </>
        )}

        {/* Abilities */}
        {abilities.length > 0 && (
          <>
            <div className="h-px bg-primary/30" />
            <div className="flex flex-col gap-2">
              <h4 className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">Abilities</h4>
              {abilities.map((a) => (
                <DetailItem
                  key={a.name}
                  id={`ability-${a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  title={a.name}
                  description={a.description}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
