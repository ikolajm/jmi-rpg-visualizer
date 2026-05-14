/**
 * Character Factory
 *
 * Creates a Character from a ClassBuild. Used by GameProvider (real game)
 * and Draft page (preview inspect). Shared so inspect sheets are identical.
 */

import type { Character, EquippedWeapon, EquippedArmor } from './game-types';
import type { ClassBuild } from './classes';
import { V1_WEAPONS, V1_ARMOR } from './v1-roster';

// ─── Starting Equipment Resolvers ───────────────────────────
// Starting gear is resolved from the curated roster by index — single
// source of truth, no duplicated weapon/armor stat tables.

function resolveWeapon(index: string): EquippedWeapon {
  const w = V1_WEAPONS.find(x => x.index === index)
    ?? V1_WEAPONS.find(x => x.index === 'longsword')!;
  return {
    index: w.index,
    name: w.name,
    damage: w.damage,
    damageType: w.damageType,
    weaponRange: w.weaponRange,
    properties: [...w.properties],
    ...(w.onHit ? { onHit: w.onHit } : {}),
  };
}

function resolveArmor(index: string): EquippedArmor | null {
  if (index === 'none') return null;
  const a = V1_ARMOR.find(x => x.index === index);
  if (!a) return null;
  return {
    index: a.index,
    name: a.name,
    acBase: a.acBase,
    ...(a.acDexCap !== undefined ? { acDexCap: a.acDexCap } : {}),
  };
}

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
      weapon: resolveWeapon(build.startingEquipment.weapon),
      armor: resolveArmor(build.startingEquipment.armor),
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
