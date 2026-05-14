/**
 * Encounter Config
 * Maps floor tiers to CR pools, enemy counts, and room type weights.
 */

export interface FloorTier {
  floors: [number, number];
  crPool: number[];
  enemyCount: {
    combat: [number, number];
    elite: [number, number];
  };
}

// Compressed 5-floor cadence — CR climbs fast so a ~10-room run spans
// floors 1-2 (two bosses); good runs reach floors 3-5. Which monsters
// live at each CR is curated in v1-roster.ts.
export const floorTiers: FloorTier[] = [
  {
    floors: [1, 1],
    crPool: [0.125, 0.25],
    enemyCount: { combat: [2, 3], elite: [1, 2] },
  },
  {
    floors: [2, 2],
    crPool: [0.5, 1],
    enemyCount: { combat: [2, 3], elite: [1, 2] },
  },
  {
    floors: [3, 3],
    crPool: [2],
    enemyCount: { combat: [2, 3], elite: [1, 2] },
  },
  {
    floors: [4, 4],
    crPool: [3],
    enemyCount: { combat: [1, 3], elite: [1, 2] },
  },
  {
    floors: [5, Infinity],
    crPool: [3, 5],
    enemyCount: { combat: [1, 3], elite: [1, 2] },
  },
];

export const roomTypeWeights = {
  combat: 55,
  elite_combat: 15,
  rest: 15,
  treasure: 15,
} as const;

export const BOSS_INTERVAL = 5;

export function getFloorTier(floor: number): FloorTier {
  return floorTiers.find(t => floor >= t.floors[0] && floor <= t.floors[1])
    ?? floorTiers[floorTiers.length - 1];
}
