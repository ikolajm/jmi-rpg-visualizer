/**
 * Zone system — numeric positions with relative distance.
 *
 * Zones are positions 1, 2, 3 on a 1D field.
 * Distance between two entities determines attack reach:
 *   0 = melee (same zone)
 *   1 = ranged (adjacent zone)
 *   2 = far (opposite ends)
 */

import type { Zone } from './game-types';

export type Reach = 'melee' | 'adjacent' | 'any';

/** Distance between two zones (0, 1, or 2) */
export function zoneDistance(a: Zone, b: Zone): number {
  return Math.abs(a - b);
}

/** Can an attack with the given reach hit from attacker's zone to target's zone? */
export function canReach(attackerZone: Zone, targetZone: Zone, reach: Reach): boolean {
  const dist = zoneDistance(attackerZone, targetZone);
  if (reach === 'melee') return dist === 0;
  if (reach === 'adjacent') return dist <= 1;
  return true; // 'any' hits all zones
}

/** Zones an entity can move to (1 step in either direction) */
export function movableZones(current: Zone): Zone[] {
  const result: Zone[] = [];
  if (current > 1) result.push((current - 1) as Zone);
  if (current < 3) result.push((current + 1) as Zone);
  return result;
}

/** Derive the reach category of a weapon */
export function weaponReach(weapon: string): Reach {
  const ranged = ['longbow', 'shortbow', 'light-crossbow', 'hand-crossbow'];
  if (ranged.includes(weapon)) return 'any';
  return 'melee';
}

/** Derive reach from a spell's SRD range string */
export function spellReach(range: string): Reach {
  if (range === 'Self' || range === 'Touch' || range === '5 feet') return 'melee';
  const feetMatch = range.match(/^(\d+)\s*feet$/);
  if (feetMatch) {
    const feet = parseInt(feetMatch[1], 10);
    if (feet <= 30) return 'adjacent';
    return 'any';
  }
  return 'any';
}

/** Display label for reach type */
export const reachLabels: Record<Reach, string> = {
  melee: 'Melee',
  adjacent: 'Adjacent',
  any: 'Any Zone',
};

/** Display label for a zone position */
export function zoneLabel(zone: Zone): string {
  return `Zone ${zone}`;
}
