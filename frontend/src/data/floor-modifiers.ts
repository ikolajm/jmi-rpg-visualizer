/**
 * Floor Modifiers
 *
 * Random twist per floor that changes combat rules. One modifier per floor,
 * floor 1 is always modifier-free. Adds strategic variety.
 */

import type { FloorModifier } from './game-types';

export const FLOOR_MODIFIERS: FloorModifier[] = [
  {
    id: 'darkness',
    name: 'Darkness',
    description: 'Shadows swallow the halls. Ranged attacks have disadvantage.',
  },
  {
    id: 'hallowed-ground',
    name: 'Hallowed Ground',
    description: 'Divine energy lingers here. All healing is 50% more effective.',
  },
  {
    id: 'blood-moon',
    name: 'Blood Moon',
    description: 'Violence begets violence. All damage dealt is increased by 25%.',
  },
  {
    id: 'ironhide',
    name: 'Ironhide',
    description: 'Enemies are unnaturally tough. All enemies gain +2 AC.',
  },
  {
    id: 'thin-veil',
    name: 'Thin Veil',
    description: 'Magic frays at the edges. All spell save DCs are reduced by 2.',
  },
  {
    id: 'echoing-halls',
    name: 'Echoing Halls',
    description: 'Every footstep echoes. Enemies gain +5 to initiative.',
  },
  {
    id: 'blessed-winds',
    name: 'Blessed Winds',
    description: 'A gentle warmth suffuses the air. Party members heal 2 HP at the start of each turn.',
  },
  {
    id: 'unstable-ground',
    name: 'Unstable Ground',
    description: 'The floor shifts and cracks. Zone movement is blocked for all entities.',
  },
];

/** Pick a random floor modifier. Floor 1 returns null. */
export function pickFloorModifier(floor: number): FloorModifier | null {
  if (floor <= 1) return null;
  return FLOOR_MODIFIERS[Math.floor(Math.random() * FLOOR_MODIFIERS.length)];
}
