'use client';

import { useGame } from '@/components/providers/GameProvider';
import { ZoneToken } from '@/components/molecules';
import { zoneLabel } from '@/data/zones';
import type { Zone } from '@/data/game-types';

export function ZoneLayout({ onSelectTarget }: {
  onSelectTarget: (id: string, type: 'character' | 'enemy') => void;
}) {
  const { state } = useGame();
  if (!state.combat) return null;

  const currentEntity = state.combat.initiativeOrder[state.combat.currentTurnIndex];
  const zones: Zone[] = [1, 2, 3];

  return (
    <div className="grid grid-cols-3 gap-4 h-full p-6 pt-[88px] pb-[180px]">
      {zones.map((zone) => {
        const zoneChars = state.party.filter(c => c.zone === zone).sort((a, b) => a.name.localeCompare(b.name));
        const zoneEnemies = state.combat!.enemies.filter(e => e.zone === zone).sort((a, b) => a.name.localeCompare(b.name));
        const hasBoth = zoneChars.length > 0 && zoneEnemies.length > 0;

        return (
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
                  statusEffects={char.statusEffects}
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
                  statusEffects={enemy.statusEffects}
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
          </div>
        );
      })}
    </div>
  );
}
