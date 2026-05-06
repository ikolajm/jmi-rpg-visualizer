/**
 * Loot Generator — v1 roster edition
 *
 * Generates loot from the curated v1 roster. Each item has real stats.
 * Uses tiered availability so early floors drop starting-tier gear
 * and later floors drop endgame gear.
 */

import { dropRates } from './loot-config';
import {
  V1_WEAPONS, V1_ARMOR, V1_CONSUMABLES, LOOT_TIERS,
  type RosterWeapon, type RosterArmor, type RosterConsumable,
} from './v1-roster';
import type { RoomType } from './game-types';

export type LootItem = {
  index: string;
  name: string;
  category: 'weapon' | 'armor' | 'consumable';
  rarity: string;
  // Weapons
  damage?: string;
  damageType?: string;
  weaponRange?: string;
  properties?: string[];
  onHit?: import('./game-types').WeaponOnHit;
  // Armor
  acBase?: number;
  acDexCap?: number;
  armorCategory?: string;
  // Consumables
  healDice?: string;
  buffDescription?: string;
  spellIndex?: string;
  // All
  description: string;
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getTierKey(floor: number): keyof typeof LOOT_TIERS {
  if (floor <= 5) return 'early';
  if (floor <= 10) return 'mid';
  if (floor <= 15) return 'late';
  return 'endgame';
}

/** Get available loot pool for the current floor, cumulative (later tiers include earlier) */
function getAvailablePool(floor: number) {
  const tierKey = getTierKey(floor);
  const tiers = ['early', 'mid', 'late', 'endgame'] as const;
  const tierIndex = tiers.indexOf(tierKey);

  const weaponIndices = new Set<string>();
  const armorIndices = new Set<string>();
  const consumableIndices = new Set<string>();

  for (let i = 0; i <= tierIndex; i++) {
    const tier = LOOT_TIERS[tiers[i]];
    tier.weapons.forEach(w => weaponIndices.add(w));
    tier.armor.forEach(a => armorIndices.add(a));
    tier.consumables.forEach(c => consumableIndices.add(c));
  }

  return {
    weapons: V1_WEAPONS.filter(w => weaponIndices.has(w.index)),
    armor: V1_ARMOR.filter(a => armorIndices.has(a.index)),
    consumables: V1_CONSUMABLES.filter(c => consumableIndices.has(c.index)),
  };
}

function weaponToLoot(w: RosterWeapon): LootItem {
  const onHitDesc = w.onHit ? ` ${w.onHit.description}` : '';
  return {
    index: w.index,
    name: w.name,
    category: 'weapon',
    rarity: w.rarity || 'Common',
    damage: w.damage,
    damageType: w.damageType,
    weaponRange: w.weaponRange,
    properties: w.properties,
    onHit: w.onHit,
    description: `${w.damage} ${w.damageType}${w.properties.length > 0 ? '. ' + w.properties.join(', ') : ''}.${onHitDesc}`,
  };
}

function armorToLoot(a: RosterArmor): LootItem {
  const dexNote = a.acDexCap === undefined ? ' + DEX' : a.acDexCap > 0 ? ` + DEX (max ${a.acDexCap})` : '';
  return {
    index: a.index,
    name: a.name,
    category: 'armor',
    rarity: 'Common',
    acBase: a.acBase,
    acDexCap: a.acDexCap,
    armorCategory: a.category,
    description: `${a.category} armor. AC ${a.acBase}${dexNote}.`,
  };
}

function consumableToLoot(c: RosterConsumable): LootItem {
  let description = '';
  if (c.effect === 'heal') description = `Restores ${c.healDice} HP.`;
  else if (c.effect === 'buff') description = c.buffDescription || '';
  else if (c.effect === 'spell') description = `Cast ${c.spellIndex?.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase())} (one use).`;

  return {
    index: c.index,
    name: c.name,
    category: 'consumable',
    rarity: c.rarity,
    healDice: c.healDice,
    buffDescription: c.buffDescription,
    spellIndex: c.spellIndex,
    description,
  };
}

/** Roll against drop rate for room type */
export function shouldDropLoot(roomType: RoomType): boolean {
  const rate = dropRates[roomType as keyof typeof dropRates] ?? 0;
  return Math.random() < rate;
}

/** Generate N distinct loot choices for the current floor */
export function generateLootChoices(floor: number, count = 3): LootItem[] {
  const pool = getAvailablePool(floor);
  const allItems: LootItem[] = [
    ...pool.weapons.map(weaponToLoot),
    ...pool.armor.map(armorToLoot),
    ...pool.consumables.map(consumableToLoot),
  ];

  if (allItems.length === 0) return [];

  const choices: LootItem[] = [];
  const usedIndices = new Set<string>();

  // Try to get variety: one from each category if possible
  const categories: ('weapon' | 'armor' | 'consumable')[] = ['weapon', 'armor', 'consumable'];
  for (const cat of categories) {
    if (choices.length >= count) break;
    const catItems = allItems.filter(i => i.category === cat && !usedIndices.has(i.index));
    if (catItems.length > 0) {
      const pick = pickRandom(catItems);
      choices.push(pick);
      usedIndices.add(pick.index);
    }
  }

  // Fill remaining slots randomly
  while (choices.length < count) {
    const remaining = allItems.filter(i => !usedIndices.has(i.index));
    if (remaining.length === 0) break;
    const pick = pickRandom(remaining);
    choices.push(pick);
    usedIndices.add(pick.index);
  }

  return choices;
}
