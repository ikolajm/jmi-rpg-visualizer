/**
 * Zone Range Parser
 *
 * Derives zone reach from SRD range data. Three zones: melee, ranged, far.
 * A zone value describes how far the spell/weapon/action can reach:
 *
 *   self     — caster only (Shield, Blur)
 *   melee    — same zone (Touch spells, melee weapons, Melee Weapon Attacks)
 *   adjacent — your zone + one zone over (10-30ft spells, thrown weapons, short-range)
 *   any      — hits any zone (60ft+ spells, longbows, breath weapons)
 */

export type Zone = 'self' | 'melee' | 'adjacent' | 'any';

// For weapons that can operate in multiple zones (thrown)
export type WeaponZone = Zone | 'melee+adjacent';

interface SpellLike {
  range: string;
  area_of_effect?: { type: string; size: number };
}

interface WeaponLike {
  weapon_range?: string;
  range?: Record<string, number>;
  throw_range?: Record<string, number>;
  properties?: { name: string; index: string; url: string }[];
}

interface MonsterActionLike {
  name: string;
  description: string;
  dc?: unknown;
}

/**
 * Parse zone reach from a spell's range + area_of_effect.
 */
export function spellZone(spell: SpellLike): Zone {
  const r = spell.range;

  // Self-targeted: AoE emanates outward (any zone), no AoE = caster only
  if (r === 'Self') {
    return spell.area_of_effect ? 'any' : 'self';
  }

  // Touch / point blank
  if (r === 'Touch' || r === '5 feet') {
    return 'melee';
  }

  // Numeric feet — parse the number
  const feetMatch = r.match(/^(\d+)\s*feet$/);
  if (feetMatch) {
    const feet = parseInt(feetMatch[1], 10);
    if (feet <= 30) return 'adjacent';
    return 'any';
  }

  // Sight, Special, miles, Unlimited — all reach any zone
  return 'any';
}

/**
 * Parse zone reach from a weapon's properties.
 * Returns 'melee+adjacent' for thrown weapons (melee normally, adjacent when thrown).
 */
export function weaponZone(weapon: WeaponLike): WeaponZone {
  const props = weapon.properties?.map(p => p.name) ?? [];

  if (weapon.weapon_range === 'Melee') {
    return props.includes('Thrown') ? 'melee+adjacent' : 'melee';
  }

  if (weapon.weapon_range === 'Ranged') {
    const normal = weapon.range?.normal ?? 0;
    return normal <= 30 ? 'adjacent' : 'any';
  }

  return 'melee';
}

/**
 * Parse zone reach from a monster action's description prefix.
 */
export function monsterActionZone(action: MonsterActionLike): Zone | 'special' {
  const desc = action.description;

  if (action.name === 'Multiattack') return 'special';

  if (desc.includes('Melee or Ranged Weapon Attack')) return 'any';
  if (desc.includes('Melee Weapon Attack') || desc.includes('Melee Spell Attack')) return 'melee';
  if (desc.includes('Ranged Weapon Attack') || desc.includes('Ranged Spell Attack')) return 'any';

  // DC-based abilities (breath weapons, gaze attacks) — generally AoE
  if (action.dc) return 'any';

  // Shape-change, teleport, swallow, etc.
  return 'special';
}
