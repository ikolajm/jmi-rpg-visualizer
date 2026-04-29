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
    <div className="grid grid-cols-3 gap-[var(--space-3)] h-full p-[var(--space-4)]">
      {zones.map((zone) => {
        const zoneChars = state.party.filter(c => c.zone === zone);
        const zoneEnemies = state.combat!.enemies.filter(e => e.zone === zone);

        return (
          <div key={zone} className="flex flex-col gap-[var(--space-3)] p-[var(--space-3)] rounded-[var(--radius-card)] bg-[var(--surface-1)] border border-[var(--outline-subtle)]">
            <h3 className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[var(--on-surface-variant)] text-center">
              {zoneLabel(zone)}
            </h3>

            <div className="flex flex-wrap justify-center gap-[var(--space-2)] flex-1 content-start">
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
              <div className="flex items-center justify-center flex-1 text-[10px] text-[var(--outline-subtle)] italic">
                Empty
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
