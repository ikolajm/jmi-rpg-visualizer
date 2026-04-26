/**
 * Monster AI Classifier
 *
 * Derives a tactical behavior pattern from a monster's capabilities.
 * Used by the encounter AI to determine positioning and action priority.
 *
 * Classifications:
 *   melee-aggro  — move to melee zone, attack nearest (220 monsters)
 *   flexible     — has both melee and ranged, adapts to situation (49)
 *   caster       — prioritizes spells, positions at range (30)
 *   boss         — legendary actions, high-threat physical (26)
 *   boss-caster  — legendary actions + spellcasting (6)
 *   passive      — no combat actions (3: Frog, Sea Horse, Shrieker)
 *
 * AI behavior notes:
 *   - All classifications check for DC abilities (breath weapons, gaze)
 *     as a priority action each turn regardless of base pattern.
 *     If off cooldown → use it. Otherwise → follow classification behavior.
 *   - Boss/boss-caster use legendary actions at end of other turns.
 *   - Casters use highest-value available spell, fall back to cantrips.
 */

export type MonsterBehavior =
  | 'melee-aggro'
  | 'flexible'
  | 'caster'
  | 'boss'
  | 'boss-caster'
  | 'passive';

interface MonsterLike {
  actions: { name: string; description: string; dc?: unknown }[];
  legendary_actions: unknown[];
  special_abilities: { spellcasting?: unknown }[];
}

export function classifyMonster(monster: MonsterLike): MonsterBehavior {
  const hasLegendary = monster.legendary_actions.length > 0;
  const hasSpellcasting = monster.special_abilities.some(sa => sa.spellcasting);

  if (!monster.actions.length) return 'passive';

  let hasMelee = false;
  let hasRanged = false;

  for (const action of monster.actions) {
    if (action.name === 'Multiattack') continue;

    const desc = action.description;
    if (desc.includes('Melee Weapon Attack') || desc.includes('Melee Spell Attack')) {
      hasMelee = true;
    }
    if (desc.includes('Ranged Weapon Attack') || desc.includes('Ranged Spell Attack')) {
      hasRanged = true;
    }
    if (desc.includes('Melee or Ranged')) {
      hasMelee = true;
      hasRanged = true;
    }
  }

  // Priority: boss > caster > ranged/flexible > melee-aggro
  if (hasLegendary) {
    return hasSpellcasting ? 'boss-caster' : 'boss';
  }

  if (hasSpellcasting) return 'caster';

  if (hasRanged && !hasMelee) return 'flexible'; // ranged-only is rare, treat as flexible
  if (hasMelee && hasRanged) return 'flexible';

  return 'melee-aggro';
}
