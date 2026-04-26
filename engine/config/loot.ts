/**
 * Loot Tables
 *
 * Maps floor tiers to item rarity pools. The full equipment + magic item datasets
 * are available — these tables control which rarities are eligible per tier.
 *
 * Loot presentation: pick 1 of 3. System generates 3 items from the current
 * floor's loot pool, player picks one, assigns to a character.
 *
 * Equipment slots per character: Weapon, Armor, 2 Consumable slots.
 * Loot categories for v1: base weapons/armor, magic weapons/armor, potions, scrolls.
 * Wondrous items, rings, wands, staves deferred to v2 (needs more equipment slots).
 */

export type LootCategory = 'weapon' | 'armor' | 'consumable';

export interface LootTier {
  floors: [number, number];
  rarityPool: string[];          // eligible magic item rarities
  rarityWeights: number[];       // relative weights (parallel to rarityPool)
  baseEquipmentWeight: number;   // weight for non-magic base weapons/armor
  categoryWeights: {
    weapon: number;
    armor: number;
    consumable: number;
  };
}

export const lootTiers: LootTier[] = [
  {
    floors: [1, 5],
    rarityPool: ['Common'],
    rarityWeights: [1],
    baseEquipmentWeight: 80,    // mostly base gear early on
    categoryWeights: { weapon: 35, armor: 30, consumable: 35 },
  },
  {
    floors: [6, 10],
    rarityPool: ['Common', 'Uncommon'],
    rarityWeights: [30, 70],
    baseEquipmentWeight: 40,
    categoryWeights: { weapon: 30, armor: 30, consumable: 40 },
  },
  {
    floors: [11, 15],
    rarityPool: ['Uncommon', 'Rare'],
    rarityWeights: [40, 60],
    baseEquipmentWeight: 10,
    categoryWeights: { weapon: 30, armor: 25, consumable: 45 },
  },
  {
    floors: [16, 20],
    rarityPool: ['Rare', 'Very Rare'],
    rarityWeights: [50, 50],
    baseEquipmentWeight: 0,
    categoryWeights: { weapon: 30, armor: 25, consumable: 45 },
  },
  {
    floors: [21, Infinity],
    rarityPool: ['Very Rare', 'Legendary'],
    rarityWeights: [60, 40],
    baseEquipmentWeight: 0,
    categoryWeights: { weapon: 30, armor: 20, consumable: 50 },
  },
];

/**
 * Magic item categories that map to our loot categories.
 */
export const magicItemCategoryMap: Record<string, LootCategory> = {
  'Weapon': 'weapon',
  'Armor': 'armor',
  'Ammunition': 'weapon',      // arrows, bolts — weapon-adjacent
  'Potion': 'consumable',
  'Scroll': 'consumable',
  // v2: Ring, Wand, Staff, Rod, Wondrous Items → needs accessory slot
};

/**
 * Drop rates by room type.
 */
export const dropRates = {
  combat: 0.4,          // 40% chance of loot after standard combat
  elite_combat: 0.8,    // 80% chance after elite combat
  boss: 1.0,            // guaranteed loot from boss
  treasure: 1.0,        // guaranteed — it's a treasure room
  rest: 0,
  trap: 0.2,            // small chance — reward for surviving
} as const;

/**
 * Get the loot tier for a given floor number.
 */
export function getLootTier(floor: number): LootTier {
  return lootTiers.find(t => floor >= t.floors[0] && floor <= t.floors[1])
    ?? lootTiers[lootTiers.length - 1];
}
