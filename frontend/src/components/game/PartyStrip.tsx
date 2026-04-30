'use client';

import { GameIcon } from '@/components/atoms/GameIcon';
import { HealthBar, AcShield, SpellSlotPips, StatusStack } from '@/components/molecules';
import type { Character } from '@/data/game-types';

export function PartyToken({ char, isActive, onClick }: {
  char: Character;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2
        rounded-component transition-all cursor-pointer w-full text-left
        ${isActive ? 'bg-primary-container border border-primary' : 'bg-surface-2 border border-transparent hover:border-outline-subtle'}
        ${!char.isAlive ? 'opacity-40' : ''}`}>
      <GameIcon category="class" name={char.classIndex} size="lg" className="text-primary shrink-0" />
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-label-sm font-medium text-on-surface truncate">{char.name}</span>
          <AcShield value={char.ac} size="sm" />
        </div>
        <HealthBar current={char.hp} max={char.maxHp} size="sm" />
        <div className="flex items-center gap-2">
          {char.spellcasting && <SpellSlotPips total={char.spellcasting.slotsTotal} used={char.spellcasting.slotsUsed} size="sm" />}
          <StatusStack effects={char.statusEffects} size="sm" />
        </div>
      </div>
    </button>
  );
}
