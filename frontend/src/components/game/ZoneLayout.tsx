'use client';

import { useGame } from '@/components/providers/GameProvider';
import { ZoneToken } from '@/components/molecules';
import { zoneLabel } from '@/data/zones';
import type { Zone } from '@/data/game-types';
import type { StatusFlag, VisualState } from '@/data/condition-visuals';
import { BOUNDARY_VISUALS, type BoundaryElement } from '@/data/boundary-visuals';

export function ZoneLayout({ onSelectTarget }: {
  onSelectTarget: (id: string, type: 'character' | 'enemy') => void;
}) {
  const { state } = useGame();
  if (!state.combat) return null;

  /** Get display status effects by merging character statusEffects + combat activeEffects */
  function getDisplayEffects(entityId: string, baseEffects: StatusFlag[]): VisualState[] {
    const fromCombat = state.combat!.activeEffects
      .filter(e => e.targetId === entityId)
      .map(e => e.condition);
    const merged = new Set<VisualState>([...baseEffects, ...fromCombat]);
    return [...merged];
  }

  const currentEntity = state.combat.initiativeOrder[state.combat.currentTurnIndex];
  const zones: Zone[] = [1, 2, 3];

  const ZONE_BG = [
    'bg-gradient-to-b from-surface-1/60 to-surface-1/30',  // Zone 1 — frontline
    'bg-gradient-to-b from-surface-1/40 to-surface-1/20',  // Zone 2 — midfield
    'bg-gradient-to-b from-surface-1/60 to-surface-1/30',  // Zone 3 — backline
  ];

  return (
    <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] h-full p-6 pt-[88px] pb-[180px] gap-1">
      {zones.flatMap((zone, i) => {
        const zoneChars = state.party.filter(c => c.zone === zone).sort((a, b) => a.name.localeCompare(b.name));
        const zoneEnemies = state.combat!.enemies.filter(e => e.zone === zone).sort((a, b) => a.name.localeCompare(b.name));
        const hasBoth = zoneChars.length > 0 && zoneEnemies.length > 0;

        return [
          <div key={zone} className={`flex flex-col gap-3 p-4 rounded-card ${ZONE_BG[i]} backdrop-blur-sm border border-outline-subtle/30 overflow-hidden`}>
            <h3 className="text-label-sm uppercase tracking-widest font-semibold text-on-surface-variant text-center">
              {zoneLabel(zone)}
            </h3>

            {/* Allies */}
            <div className="flex flex-wrap justify-center gap-2 content-start">
              {zoneChars.map((char) => (
                <ZoneToken
                  key={char.id}
                  entityId={char.id}
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
                <span className="text-label-sm uppercase tracking-widest text-outline-subtle">vs</span>
                <div className="flex-1 h-px bg-outline-subtle/50" />
              </div>
            )}

            {/* Enemies */}
            <div className="flex flex-wrap justify-center gap-2 content-start">
              {zoneEnemies.map((enemy) => (
                <ZoneToken
                  key={enemy.id}
                  entityId={enemy.id}
                  isCharacter={false}
                  name={enemy.name}
                  iconCategory="monster"
                  iconName={enemy.type}
                  hp={enemy.hp}
                  maxHp={enemy.maxHp}
                  ac={enemy.ac}
                  statusEffects={getDisplayEffects(enemy.id, enemy.statusEffects)}
                  intent={state.combat!.enemyIntents[enemy.id]?.type}
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
            const bv = b ? BOUNDARY_VISUALS[b.element as BoundaryElement] : null;
            const BoundaryIcon = bv?.icon;
            return (
              <div key={`wall-${bKey}`} className="flex items-center justify-center w-3">
                {b && bv ? (
                  <div
                    className="relative w-2 h-3/4 rounded-full animate-pulse flex items-center justify-center"
                    style={{ backgroundColor: bv.color, boxShadow: `0 0 8px ${bv.color}` }}
                    title={`${b.name} — ${b.damage} ${b.damageType} on crossing`}
                  >
                    {BoundaryIcon && (
                      <span style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.6))' }}>
                        <BoundaryIcon className="size-2.5 text-white/95" />
                      </span>
                    )}
                  </div>
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
