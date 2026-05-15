'use client';

import { useGame } from '@/components/providers/GameProvider';
import { GameIcon } from '@/components/atoms/GameIcon';
import { resourceColors } from '@/data/game-colors';

export function InitiativeBar() {
  const { state } = useGame();
  if (!state.combat) return null;

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-2 rounded-card bg-black/60 backdrop-blur-md border border-outline-subtle">
      {state.combat.initiativeOrder.map((entity, i) => {
        const isActive = i === state.combat!.currentTurnIndex;
        const isChar = entity.type === 'character';
        const char = isChar ? state.party.find(c => c.id === entity.id) : null;
        const enemy = !isChar ? state.combat!.enemies.find(e => e.id === entity.id) : null;
        const isDead = isChar ? !char?.isAlive : !enemy?.isAlive;
        const hp = isChar ? char?.hp || 0 : enemy?.hp || 0;
        const maxHp = isChar ? char?.maxHp || 1 : enemy?.maxHp || 1;
        const hpPct = maxHp > 0 ? hp / maxHp : 0;
        const hpColor = isDead ? resourceColors.hpDead : hpPct <= 0.1 ? resourceColors.hpCritical : hpPct <= 0.25 ? resourceColors.hpLow : resourceColors.hp;

        return (
          <div
            key={entity.id}
            className={`
              flex flex-col items-center gap-0.5 px-2 py-1 rounded-component shrink-0 transition-all min-w-[44px]
              ${isActive ? 'bg-white/15 ring-1 ring-primary scale-110' : 'bg-transparent'}
              ${isDead ? 'opacity-20' : ''}
            `}
          >
            <GameIcon
              category={isChar ? 'class' : 'monster'}
              name={isChar ? (char?.classIndex || 'fighter') : (enemy?.type || 'humanoid')}
              size="md"
              className={isChar ? 'text-primary' : 'text-error'}
            />
            {/* HP indicator bar */}
            <div className="w-6 h-0.5 rounded-full bg-surface-3 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${hpPct * 100}%`, backgroundColor: hpColor }} />
            </div>
            <span className="text-label-sm font-medium text-on-surface truncate max-w-[44px] text-center">
              {isChar ? char?.name : enemy?.name}
            </span>
          </div>
        );
      })}
      <div className="w-px h-6 bg-outline-subtle mx-1" />
      <span className="text-label-sm text-on-surface-variant whitespace-nowrap">
        R{state.combat.roundNumber}
      </span>
    </div>
  );
}
