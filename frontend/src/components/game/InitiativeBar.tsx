'use client';

import { useGame } from '@/components/providers/GameProvider';
import { GameIcon } from '@/components/atoms/GameIcon';

export function InitiativeBar() {
  const { state } = useGame();
  if (!state.combat) return null;

  return (
    <div className="flex items-center gap-[var(--space-1)] px-[var(--space-4)] py-[var(--space-2)] bg-[var(--surface-1)] border-b border-[var(--outline-subtle)] overflow-x-auto">
      <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--on-surface-variant)] shrink-0 mr-[var(--space-2)]">Turn Order</span>
      {state.combat.initiativeOrder.map((entity, i) => {
        const isActive = i === state.combat!.currentTurnIndex;
        const isChar = entity.type === 'character';
        const char = isChar ? state.party.find(c => c.id === entity.id) : null;
        const enemy = !isChar ? state.combat!.enemies.find(e => e.id === entity.id) : null;
        const isDead = isChar ? !char?.isAlive : !enemy?.isAlive;

        return (
          <div
            key={entity.id}
            className={`
              flex flex-col items-center gap-0.5 px-[var(--space-2)] py-[var(--space-1)] rounded-[var(--radius-component)] shrink-0 transition-all min-w-[48px]
              ${isActive ? 'bg-[var(--primary-container)] border border-[var(--primary)] scale-110' : 'bg-[var(--surface-2)] border border-transparent'}
              ${isDead ? 'opacity-20 line-through' : ''}
            `}
          >
            <GameIcon
              category={isChar ? 'class' : 'monster'}
              name={isChar ? (char?.classIndex || 'fighter') : (enemy?.type || 'humanoid')}
              size="md"
              className={isChar ? 'text-[var(--primary)]' : 'text-[var(--error)]'}
            />
            <span className="text-[9px] font-medium text-[var(--on-surface)] truncate max-w-[48px] text-center">
              {isChar ? char?.name : enemy?.name}
            </span>
          </div>
        );
      })}
      <span className="text-[10px] text-[var(--on-surface-variant)] ml-auto shrink-0">
        Round {state.combat.roundNumber}
      </span>
    </div>
  );
}
