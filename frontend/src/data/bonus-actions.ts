/** Bonus action availability helpers */

import type { Character } from './game-types';
import { spellMeta } from './spell-meta';

export function hasBonusActions(char: Character): boolean {
  return char.classIndex === 'fighter' || char.classIndex === 'barbarian'
    || (char.spellcasting?.preparedSpells.includes('healing-word') ?? false);
}

export interface BonusActionOption {
  id: string;
  name: string;
  description: string;
  available: boolean;
  reason?: string;
}

export function getBonusActions(char: Character): BonusActionOption[] {
  const actions: BonusActionOption[] = [];

  if (char.classIndex === 'fighter') {
    const uses = char.featureUses['second-wind'];
    actions.push({
      id: 'second-wind',
      name: 'Second Wind',
      description: `Heal 1d10+${char.level} HP`,
      available: uses ? uses.used < uses.max : false,
      reason: uses && uses.used >= uses.max ? 'Expended — recharges on rest' : undefined,
    });
  }

  if (char.classIndex === 'barbarian') {
    const uses = char.featureUses['rage'];
    actions.push({
      id: 'rage',
      name: 'Rage',
      description: '+2 melee damage, resist physical',
      available: uses ? uses.used < uses.max : false,
      reason: uses && uses.used >= uses.max ? 'No rages remaining' : undefined,
    });
  }

  if (char.spellcasting?.preparedSpells.includes('healing-word')) {
    const slotsRemaining = char.spellcasting.slotsTotal - char.spellcasting.slotsUsed;
    actions.push({
      id: 'healing-word',
      name: 'Healing Word',
      description: 'Heal 1d4+mod at range (bonus action spell)',
      available: slotsRemaining > 0,
      reason: slotsRemaining <= 0 ? 'No spell slots' : undefined,
    });
  }

  return actions;
}
