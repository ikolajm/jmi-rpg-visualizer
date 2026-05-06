'use client';

import { useGame } from '@/components/providers/GameProvider';
import { PRIMARY_STAT } from '@/data/progression';
import type { Character } from '@/data/game-types';

const TRAIN_AMOUNT = 3;

/** Reset all feature uses for a character */
function resetFeatureUses(char: Character): Record<string, { used: number; max: number }> {
  const reset: Record<string, { used: number; max: number }> = {};
  for (const [key, val] of Object.entries(char.featureUses)) {
    reset[key] = { ...val, used: 0 };
  }
  return reset;
}

interface UseRestOptions {
  onComplete?: () => void;
}

export function useRest({ onComplete }: UseRestOptions = {}) {
  const { state, updateCharacter, addLog } = useGame();

  function clearTrainingBuffs() {
    for (const char of state.party) {
      if (!char.isAlive || !char.trainingBuff) continue;
      const { stat, amount } = char.trainingBuff;
      updateCharacter(char.id, {
        stats: { ...char.stats, [stat]: char.stats[stat] - amount },
        trainingBuff: null,
      });
    }
  }

  function handleFullRest() {
    clearTrainingBuffs();
    for (const char of state.party) {
      if (!char.isAlive) continue;
      const updates: Partial<Character> = {
        hp: Math.min(char.maxHp, char.hp + Math.floor(char.maxHp * 0.5)),
        featureUses: resetFeatureUses(char),
      };
      if (char.spellcasting) {
        updates.spellcasting = { ...char.spellcasting, slotsUsed: 0 };
      }
      updateCharacter(char.id, updates);
    }
    addLog('The party takes a full rest. HP restored, all abilities refreshed.', 'system');
    onComplete?.();
  }

  function handleQuickRest() {
    clearTrainingBuffs();
    for (const char of state.party) {
      if (!char.isAlive) continue;
      const updates: Partial<Character> = {
        hp: Math.min(char.maxHp, char.hp + Math.floor(char.maxHp * 0.25)),
        featureUses: resetFeatureUses(char),
      };
      if (char.spellcasting && char.spellcasting.slotsUsed > 0) {
        updates.spellcasting = { ...char.spellcasting, slotsUsed: Math.max(0, char.spellcasting.slotsUsed - 1) };
      }
      updateCharacter(char.id, updates);
    }
    addLog('The party takes a quick rest. Some HP restored, abilities refreshed.', 'system');
    onComplete?.();
  }

  function handleTrain() {
    clearTrainingBuffs();
    for (const char of state.party) {
      if (!char.isAlive) continue;
      const stat = PRIMARY_STAT[char.classIndex] || 'str';
      updateCharacter(char.id, {
        stats: { ...char.stats, [stat]: char.stats[stat] + TRAIN_AMOUNT },
        trainingBuff: { stat, amount: TRAIN_AMOUNT },
      });
    }
    addLog('The party trains hard. +3 to primary stats until next rest!', 'system');
    onComplete?.();
  }

  return { handleFullRest, handleQuickRest, handleTrain };
}
