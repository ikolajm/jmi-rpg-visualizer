/**
 * Loot Config
 * Maps floor tiers to item rarity pools, drop rates, and category weights.
 */

export type LootCategory = 'weapon' | 'armor' | 'consumable';

export interface LootTier {
  floors: [number, number];
  rarityPool: string[];
  rarityWeights: number[];
  baseEquipmentWeight: number;
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
    baseEquipmentWeight: 80,
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

export const dropRates = {
  combat: 0.4,
  elite_combat: 0.8,
  boss: 1.0,
  treasure: 1.0,
  rest: 0,
} as const;

export function getLootTier(floor: number): LootTier {
  return lootTiers.find(t => floor >= t.floors[0] && floor <= t.floors[1])
    ?? lootTiers[lootTiers.length - 1];
}
