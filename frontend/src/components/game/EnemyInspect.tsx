'use client';

import { SheetHeader } from '@/components/atoms/Sheet';
import {
  HealthBar, AcShield, StatRow, ResistanceRow, AttackLine, CreatureHeader,
} from '@/components/molecules';
import { DetailItem } from '@/components/molecules/DetailItem';
import { ConditionList } from '@/components/molecules/ConditionList';
import { useGame } from '@/components/providers/GameProvider';
import type { Enemy } from '@/data/game-types';

const BEHAVIOR_LABELS: Record<string, { label: string; color: string }> = {
  'melee-aggro': { label: 'Melee', color: '#ef4444' },
  'flexible': { label: 'Flexible', color: '#f59e0b' },
  'caster': { label: 'Caster', color: '#8b5cf6' },
  'boss': { label: 'Boss', color: '#ef4444' },
  'boss-caster': { label: 'Boss Caster', color: '#8b5cf6' },
  'passive': { label: 'Passive', color: '#6b7280' },
};

export function EnemyInspect({ enemy }: { enemy: Enemy }) {
  const behaviorInfo = BEHAVIOR_LABELS[enemy.behavior] || BEHAVIOR_LABELS['melee-aggro'];
  const { state } = useGame();
  const activeEffects = state.combat?.activeEffects.filter(e => e.targetId === enemy.id) || [];

  const attacks = enemy.actions.filter(a => a.toHit !== undefined).sort((a, b) => a.name.localeCompare(b.name));
  const abilities = enemy.actions.filter(a => a.toHit === undefined).sort((a, b) => a.name.localeCompare(b.name));
  const sortedTraits = [...enemy.specialAbilities].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <SheetHeader>
        <CreatureHeader
          iconCategory="monster"
          iconName={enemy.type}
          name={enemy.name}
          type={enemy.type}
          cr={enemy.cr}
          xp={enemy.xp}
          badge={
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
              style={{ color: behaviorInfo.color, backgroundColor: `${behaviorInfo.color}18` }}
            >
              {behaviorInfo.label}
            </span>
          }
        />
      </SheetHeader>
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-3">
          <AcShield value={enemy.ac} size="md" />
          <HealthBar current={enemy.hp} max={enemy.maxHp} size="md" className="flex-1" />
        </div>
        {activeEffects.length > 0 && <ConditionList effects={activeEffects} />}
        <StatRow stats={enemy.stats} />
        <ResistanceRow resistances={enemy.damageResistances}
          immunities={enemy.damageImmunities} vulnerabilities={enemy.damageVulnerabilities} />

        {sortedTraits.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant">Traits</h4>
            {sortedTraits.map((sa) => (
              <DetailItem
                key={sa.name}
                id={`trait-${sa.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                title={sa.name}
                description={sa.description}
              />
            ))}
          </div>
        )}

        {attacks.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant">Attacks</h4>
            {attacks.map((a) => (
              <AttackLine key={a.name} iconName="sword" label={a.name}
                toHit={a.toHit || 0} damage={a.damage || ''} damageType={a.damageType} zone={a.reach}
                conditionInfo={a.conditionDC ? `DC ${a.conditionDC} ${(a.conditionSave || '').toUpperCase()} → ${a.conditionApplied}` : undefined}
                saveInfo={a.saveDC && !a.toHit ? `DC ${a.saveDC} ${(a.saveType || 'DEX').toUpperCase()}, ${a.saveSuccess || 'half'}` : undefined}
              />
            ))}
          </div>
        )}

        {abilities.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant">Abilities</h4>
            {abilities.map((a) => (
              <DetailItem
                key={a.name}
                id={`ability-${a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                title={a.name}
                description={a.description}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
