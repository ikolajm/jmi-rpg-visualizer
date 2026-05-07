/**
 * Character Factory
 *
 * Creates a Character from a ClassBuild. Used by GameProvider (real game)
 * and Draft page (preview inspect). Shared so inspect sheets are identical.
 */

import type { Character, EquippedWeapon, EquippedArmor } from './game-types';
import type { ClassBuild } from './classes';

// ─── Starting Equipment Data ────────────────────────────────

const STARTING_WEAPONS: Record<string, EquippedWeapon> = {
  longsword: { index: 'longsword', name: 'Longsword', damage: '1d8', damageType: 'slashing', weaponRange: 'melee', properties: [] },
  shortsword: { index: 'shortsword', name: 'Shortsword', damage: '1d6', damageType: 'piercing', weaponRange: 'melee', properties: ['finesse', 'light'] },
  greataxe: { index: 'greataxe', name: 'Greataxe', damage: '1d12', damageType: 'slashing', weaponRange: 'melee', properties: ['heavy', 'two-handed'] },
  mace: { index: 'mace', name: 'Mace', damage: '1d6', damageType: 'bludgeoning', weaponRange: 'melee', properties: [] },
  longbow: { index: 'longbow', name: 'Longbow', damage: '1d8', damageType: 'piercing', weaponRange: 'ranged', properties: ['ammunition', 'heavy', 'two-handed'] },
  quarterstaff: { index: 'quarterstaff', name: 'Quarterstaff', damage: '1d6', damageType: 'bludgeoning', weaponRange: 'melee', properties: [] },
};

const STARTING_ARMOR: Record<string, EquippedArmor | null> = {
  'chain-mail': { index: 'chain-mail', name: 'Chain Mail', acBase: 16, acDexCap: 0 },
  'leather-armor': { index: 'leather-armor', name: 'Leather Armor', acBase: 11 },
  'scale-mail': { index: 'scale-mail', name: 'Scale Mail', acBase: 14, acDexCap: 2 },
  'none': null,
};

// ─── Feature Uses Factory ────────────────────────────────────

function buildFeatureUses(classIndex: string): Record<string, { used: number; max: number }> {
  const uses: Record<string, { used: number; max: number }> = {};
  switch (classIndex) {
    case 'fighter':
      uses['second-wind'] = { used: 0, max: 1 };
      break;
    case 'barbarian':
      uses['rage'] = { used: 0, max: 2 };
      break;
  }
  return uses;
}

// ─── Factory ─────────────────────────────────────────────────

export function createCharacter(build: ClassBuild, slotIndex: number): Character {
  const conMod = Math.floor((build.stats.con - 10) / 2);

  return {
    id: `char-${slotIndex}`,
    name: build.name,
    classIndex: build.index,
    level: 1,
    xp: 0,
    hp: build.hitDie + conMod,
    maxHp: build.hitDie + conMod,
    ac: build.ac,
    acSource: build.acSource,
    stats: { ...build.stats },
    savingThrows: [...build.savingThrows],
    equipment: {
      weapon: STARTING_WEAPONS[build.startingEquipment.weapon] || STARTING_WEAPONS.longsword,
      armor: STARTING_ARMOR[build.startingEquipment.armor] ?? null,
      shield: build.startingEquipment.shield,
    },
    consumables: [
      { id: 'health-potion', name: 'Health Potion', quantity: 2, effect: 'heal', value: 7 },
    ],
    spellcasting: build.spellcasting ? {
      ability: build.spellcasting.ability,
      spellSaveDC: build.spellcasting.spellSaveDC,
      spellAttackBonus: build.spellcasting.spellAttackBonus,
      cantrips: [...build.spellcasting.cantrips],
      preparedSpells: [...build.spellcasting.preparedSpells],
      slotsTotal: build.spellcasting.spellSlotsLevel1,
      slotsUsed: 0,
    } : null,
    features: [...build.features],
    featureUses: buildFeatureUses(build.index),
    trainingBuff: null,
    zone: 2,
    statusEffects: [],
    isAlive: true,
  };
}
