/**
 * Zone Synergies
 *
 * Positioning rewards that make zone placement tactically meaningful.
 * Pure functions — no side effects.
 */

import type { Character, Enemy, Zone } from './game-types';

/**
 * Flanking: if 2+ alive allies share a zone with the target enemy, melee attacks get +2 to hit.
 */
export function getFlankingBonus(
  attacker: Character,
  targetZone: Zone,
  party: Character[],
): number {
  const alliesInZone = party.filter(c => c.isAlive && c.zone === targetZone);
  return alliesInZone.length >= 2 ? 2 : 0;
}

/**
 * Cleric Aura: if an alive cleric is in the same zone as the character, +1 to saves.
 * The cleric doesn't benefit from their own aura.
 */
export function getClericAuraBonus(
  characterId: string,
  characterZone: Zone,
  party: Character[],
): number {
  const clericInZone = party.some(c =>
    c.isAlive && c.id !== characterId && c.classIndex === 'cleric' && c.zone === characterZone
  );
  return clericInZone ? 1 : 0;
}

/**
 * Ranger Overwatch: if the ranger is alone in their zone (no enemies present),
 * ranged attacks and spells get +2 damage.
 */
export function getRangerOverwatchBonus(
  attacker: Character,
  enemies: Enemy[],
): number {
  if (attacker.classIndex !== 'ranger') return 0;
  const enemiesInZone = enemies.some(e => e.isAlive && e.zone === attacker.zone);
  return enemiesInZone ? 0 : 2;
}
