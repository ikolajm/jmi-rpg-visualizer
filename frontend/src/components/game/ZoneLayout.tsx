'use client';

import { useGame } from '@/components/providers/GameProvider';
import { ZoneToken } from '@/components/molecules';
import { zoneLabel } from '@/data/zones';
import type { Zone } from '@/data/game-types';
import type { GameCondition } from '@/data/status-effects';
import type { StatusEffect } from '@/components/molecules/StatusStack';
import { boundaryColors } from '@/data/game-colors';

export function ZoneLayout({ onSelectTarget }: {
  onSelectTarget: (id: string, type: 'character' | 'enemy') => void;
}) {
  const { state } = useGame();
  if (!state.combat) return null;

  /** Get display status effects by merging character statusEffects + combat activeEffects */
  function getDisplayEffects(entityId: string, baseEffects: StatusEffect[]): (StatusEffect | GameCondition)[] {
    const fromCombat = state.combat!.activeEffects
      .filter(e => e.targetId === entityId)
      .map(e => e.condition);
    const merged = new Set<StatusEffect | GameCondition>([...baseEffects, ...fromCombat]);
    return [...merged];
  }

  const currentEntity = state.combat.initiativeOrder[state.combat.currentTurnIndex];
  const zones: Zone[] = [1, 2, 3];

  return (
    <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] h-full p-6 pt-[88px] pb-[180px] gap-1">
      {zones.flatMap((zone, i) => {
        const zoneChars = state.party.filter(c => c.zone === zone).sort((a, b) => a.name.localeCompare(b.name));
        const zoneEnemies = state.combat!.enemies.filter(e => e.zone === zone).sort((a, b) => a.name.localeCompare(b.name));
        const hasBoth = zoneChars.length > 0 && zoneEnemies.length > 0;

        return [
          <div key={zone} className="flex flex-col gap-3 p-4 rounded-card bg-surface-1/50 backdrop-blur-sm border border-outline-subtle/50">
            <h3 className="text-label-sm uppercase tracking-[0.12em] font-semibold text-on-surface-variant text-center">
              {zoneLabel(zone)}
            </h3>

            {/* Allies */}
            <div className="flex flex-wrap justify-center gap-2 content-start">
              {zoneChars.map((char) => (
                <ZoneToken
                  key={char.id}
                  isCharacter
                  name={char.name}
                  iconCategory="class"
                  iconName={char.classIndex}
                  hp={char.hp}
                  maxHp={char.maxHp}
                  ac={char.ac}
                  statusEffects={getDisplayEffects(char.id, char.statusEffects)}
                  isActive={char.id === currentEntity?.id}
                  isDead={!char.isAlive}
                  onClick={() => onSelectTarget(char.id, 'character')}
                />
              ))}
            </div>

            {/* Divider */}
            {hasBoth && (
              <div className="flex items-center gap-2 px-2">
                <div className="flex-1 h-px bg-outline-subtle/50" />
                <span className="text-[8px] uppercase tracking-[0.1em] text-outline-subtle">vs</span>
                <div className="flex-1 h-px bg-outline-subtle/50" />
              </div>
            )}

            {/* Enemies */}
            <div className="flex flex-wrap justify-center gap-2 content-start">
              {zoneEnemies.map((enemy) => (
                <ZoneToken
                  key={enemy.id}
                  isCharacter={false}
                  name={enemy.name}
                  iconCategory="monster"
                  iconName={enemy.type}
                  hp={enemy.hp}
                  maxHp={enemy.maxHp}
                  ac={enemy.ac}
                  statusEffects={getDisplayEffects(enemy.id, enemy.statusEffects)}
                  isActive={enemy.id === currentEntity?.id}
                  isDead={!enemy.isAlive}
                  onClick={() => onSelectTarget(enemy.id, 'enemy')}
                />
              ))}
            </div>

            {zoneChars.length === 0 && zoneEnemies.length === 0 && (
              <div className="flex items-center justify-center flex-1 text-label-sm text-outline-subtle italic">
                Empty
              </div>
            )}
          </div>,
          // Boundary wall indicator between zones
          i < 2 && (() => {
            const bKey = `${zone}|${zone + 1}` as import('@/data/game-types').BoundaryKey;
            const b = state.combat!.boundaries[bKey];
            return (
              <div key={`wall-${bKey}`} className="flex items-center justify-center w-3">
                {b ? (
                  <div
                    className="w-1 h-3/4 rounded-full animate-pulse"
                    style={{ backgroundColor: boundaryColors[b.element] || '#ef4444', boxShadow: `0 0 8px ${boundaryColors[b.element] || '#ef4444'}` }}
                    title={`${b.name} — ${b.damage} ${b.damageType} on crossing`}
                  />
                ) : (
                  <div className="w-px h-1/3 bg-outline-subtle/30" />
                )}
              </div>
            );
          })(),
        ].filter(Boolean) as React.ReactNode[];
      })}
    </div>
  );
}
