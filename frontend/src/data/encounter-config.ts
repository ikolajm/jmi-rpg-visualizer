/**
 * Encounter Config — copied from engine/config/encounters.ts
 * Maps floor tiers to CR pools, enemy counts, and room type weights.
 */

export interface FloorTier {
  floors: [number, number];
  crPool: number[];
  enemyCount: {
    combat: [number, number];
    elite: [number, number];
  };
  bossMinCR: number;
}

export const floorTiers: FloorTier[] = [
  {
    floors: [1, 5],
    crPool: [0.125, 0.25, 0.5, 1],
    enemyCount: { combat: [2, 4], elite: [1, 3] },
    bossMinCR: 2,
  },
  {
    floors: [6, 10],
    crPool: [2, 3, 4, 5],
    enemyCount: { combat: [2, 3], elite: [1, 2] },
    bossMinCR: 6,
  },
  {
    floors: [11, 15],
    crPool: [5, 6, 7, 8],
    enemyCount: { combat: [1, 3], elite: [1, 2] },
    bossMinCR: 9,
  },
  {
    floors: [16, 20],
    crPool: [8, 9, 10],
    enemyCount: { combat: [1, 2], elite: [1, 2] },
    bossMinCR: 11,
  },
  {
    floors: [21, Infinity],
    crPool: [10, 11, 12, 13, 14, 15, 16, 17],
    enemyCount: { combat: [1, 2], elite: [1, 1] },
    bossMinCR: 17,
  },
];

export const roomTypeWeights = {
  combat: 55,
  elite_combat: 15,
  rest: 15,
  treasure: 15,
  trap: 0, // disabled for v1
} as const;

export type RoomType = keyof typeof roomTypeWeights | 'boss';

export const BOSS_INTERVAL = 5;

export function getFloorTier(floor: number): FloorTier {
  return floorTiers.find(t => floor >= t.floors[0] && floor <= t.floors[1])
    ?? floorTiers[floorTiers.length - 1];
}
