/** Bonus action availability helpers */

import type { Character } from './game-types';

export function hasBonusActions(char: Character): boolean {
  // Fighter: Second Wind, Action Surge
  if (char.classIndex === 'fighter') return true;
  // Barbarian: Rage, Reckless Attack, Frenzy
  if (char.classIndex === 'barbarian') return true;
  // Cleric: Channel Divinity, Healing Word
  if (char.classIndex === 'cleric') return true;
  // Casters with healing word
  if (char.spellcasting?.preparedSpells.includes('healing-word')) return true;
  // Ranger with hunter's mark
  if (char.spellcasting?.preparedSpells.includes('hunters-mark')) return true;
  return false;
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

  // Fighter: Second Wind
  if (char.classIndex === 'fighter') {
    const uses = char.featureUses['second-wind'];
    if (uses) {
      actions.push({
        id: 'second-wind',
        name: 'Second Wind',
        description: `Heal 1d10+${char.level} HP`,
        available: uses.used < uses.max,
        reason: uses.used >= uses.max ? 'Expended — recharges on rest' : undefined,
      });
    }
  }

  // Fighter L2: Action Surge
  if (char.classIndex === 'fighter' && char.features.includes('Action Surge')) {
    const uses = char.featureUses['action-surge'];
    if (uses) {
      actions.push({
        id: 'action-surge',
        name: 'Action Surge',
        description: 'Take an extra action this turn',
        available: uses.used < uses.max,
        reason: uses.used >= uses.max ? 'Expended — recharges on rest' : undefined,
      });
    }
  }

  // Barbarian: Rage
  if (char.classIndex === 'barbarian') {
    const uses = char.featureUses['rage'];
    const isRaging = char.statusEffects.includes('raging');
    if (uses) {
      actions.push({
        id: 'rage',
        name: 'Rage',
        description: '+2 melee damage (+3 at L9), resist physical',
        available: !isRaging && uses.used < uses.max,
        reason: isRaging ? 'Already raging' : uses.used >= uses.max ? 'No rages remaining' : undefined,
      });
    }
  }

  // Barbarian L2: Reckless Attack
  if (char.classIndex === 'barbarian' && char.features.includes('Reckless Attack')) {
    const isReckless = char.statusEffects.includes('reckless');
    actions.push({
      id: 'reckless-attack',
      name: 'Reckless Attack',
      description: 'Advantage on attacks, enemies get advantage against you',
      available: !isReckless,
      reason: isReckless ? 'Already reckless this turn' : undefined,
    });
  }

  // Cleric L2: Channel Divinity: Preserve Life
  if (char.classIndex === 'cleric' && char.features.includes('Channel Divinity: Preserve Life')) {
    const uses = char.featureUses['channel-divinity'];
    if (uses) {
      actions.push({
        id: 'channel-divinity',
        name: 'Preserve Life',
        description: `Distribute ${char.level * 5} HP among wounded allies`,
        available: uses.used < uses.max,
        reason: uses.used >= uses.max ? 'Expended — recharges on rest' : undefined,
      });
    }
  }

  // Healing Word (Cleric bonus action spell)
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

  // Hunter's Mark (Ranger bonus action spell)
  if (char.spellcasting?.preparedSpells.includes('hunters-mark')) {
    const slotsRemaining = char.spellcasting.slotsTotal - char.spellcasting.slotsUsed;
    actions.push({
      id: 'hunters-mark',
      name: "Hunter's Mark",
      description: '+1d6 damage to marked target',
      available: slotsRemaining > 0,
      reason: slotsRemaining <= 0 ? 'No spell slots' : undefined,
    });
  }

  return actions;
}
