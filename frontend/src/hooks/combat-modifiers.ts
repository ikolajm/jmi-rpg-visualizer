/**
 * Floor Modifier Helpers
 *
 * Pure functions that check active floor modifiers and apply their
 * combat effects. Used by combat resolvers and the enemy turn logic.
 */

import type { FloorModifier } from '@/data/game-types';

export interface CombatModifiers {
  darkness: boolean;
  hallowedGround: boolean;
  bloodMoon: boolean;
  ironhide: boolean;
  thinVeil: boolean;
  unstableGround: boolean;
  blessedWinds: boolean;
  echoingHalls: boolean;
}

/** Derive all modifier flags from the active floor modifier */
export function getModifiers(floorModifier: FloorModifier | null): CombatModifiers {
  const id = floorModifier?.id;
  return {
    darkness: id === 'darkness',
    hallowedGround: id === 'hallowed-ground',
    bloodMoon: id === 'blood-moon',
    ironhide: id === 'ironhide',
    thinVeil: id === 'thin-veil',
    unstableGround: id === 'unstable-ground',
    blessedWinds: id === 'blessed-winds',
    echoingHalls: id === 'echoing-halls',
  };
}

/** Apply Blood Moon +25% damage bonus */
export function bloodMoonDamage(dmg: number, mods: CombatModifiers): number {
  return mods.bloodMoon ? Math.floor(dmg * 1.25) : dmg;
}

/** Apply Hallowed Ground +50% healing bonus */
export function hallowedHeal(heal: number, mods: CombatModifiers): number {
  return mods.hallowedGround ? Math.floor(heal * 1.5) : heal;
}
