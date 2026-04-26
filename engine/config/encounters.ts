/**
 * Encounter Tables
 *
 * Maps floor tiers to CR pools, enemy counts, and room type weights.
 * The full monster dataset is available — these tables control selection, not subsetting.
 */

export interface FloorTier {
  floors: [number, number]; // inclusive range
  crPool: number[];         // challenge ratings eligible for this tier
  enemyCount: {
    combat: [number, number];       // min-max for standard combat rooms
    elite: [number, number];        // min-max for elite combat rooms
  };
  bossMinCR: number;                // minimum CR for boss encounters on this tier
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
    // Death march — floors 21+ scale into high CR
    floors: [21, Infinity],
    crPool: [10, 11, 12, 13, 14, 15, 16, 17],
    enemyCount: { combat: [1, 2], elite: [1, 1] },
    bossMinCR: 17,
  },
];

/**
 * Room type weights. Boss rooms are fixed (every 5th floor) and skip the weighted roll.
 * Weights are relative — they don't need to sum to 100.
 */
export const roomTypeWeights = {
  combat: 55,
  elite_combat: 15,
  rest: 12,
  treasure: 12,
  trap: 6,
} as const;

export type RoomType = keyof typeof roomTypeWeights | 'boss';

export const BOSS_INTERVAL = 5; // boss room every N floors

/**
 * Get the floor tier for a given floor number.
 */
export function getFloorTier(floor: number): FloorTier {
  return floorTiers.find(t => floor >= t.floors[0] && floor <= t.floors[1])
    ?? floorTiers[floorTiers.length - 1];
}
