/**
 * Spell Engine Support
 *
 * Classifies every class spell by how our combat engine handles it.
 * ActionBar filters out 'utility' spells. InspectSheet shows all.
 * Update a spell's tag here when adding engine support for it.
 */

export type SpellCastType = 'damage' | 'healing' | 'condition' | 'buff' | 'boundary' | 'utility';

export const SPELL_CAST_TYPE: Record<string, SpellCastType> = {
  // ─── Damage (target enemy, roll to hit or auto-hit) ───────
  'fire-bolt': 'damage',
  'ray-of-frost': 'damage',
  'shocking-grasp': 'damage',
  'sacred-flame': 'damage',
  'magic-missile': 'damage',
  'burning-hands': 'damage',
  'guiding-bolt': 'damage',
  'inflict-wounds': 'damage',
  'thunderwave': 'damage',
  'scorching-ray': 'damage',
  'spiritual-weapon': 'damage',
  'fireball': 'damage',
  'wall-of-fire': 'boundary',
  'flame-strike': 'damage',
  'cone-of-cold': 'damage',

  // ─── Healing (target ally) ────────────────────────────────
  'cure-wounds': 'healing',
  'healing-word': 'healing',
  'aid': 'healing',
  'heal': 'healing',

  // ─── Conditions (save-or-suck, apply status effect) ───────
  'hold-person': 'condition',    // WIS save → paralyzed
  'sleep': 'condition',          // HP pool → unconscious
  'web': 'condition',            // DEX save → restrained
  'spirit-guardians': 'condition', // zone AoE aura → radiant/necrotic damage per turn
  'command': 'condition',        // WIS save → skip next turn (simplified)
  'spike-growth': 'condition',   // zone hazard → damage on movement

  // ─── Buffs (target ally, apply beneficial effect) ─────────
  'bless': 'buff',              // +1d4 on attacks for up to 3 allies
  'hunters-mark': 'buff',       // +1d6 damage to marked target
  'shield-of-faith': 'buff',   // +2 AC to one ally
  'shield': 'buff',            // +5 AC for one turn (self)

  // ─── Utility (no combat engine support — hidden from cast menu) ──
  'spare-the-dying': 'utility',
  'resistance': 'utility',
  'mage-armor': 'utility',
  'fog-cloud': 'utility',
  'color-spray': 'utility',
  'misty-step': 'utility',
  'sanctuary': 'utility',
  'goodberry': 'utility',
  'pass-without-trace': 'utility',
  'barkskin': 'utility',
  'silence': 'utility',
  'lesser-restoration': 'utility',
  'dispel-magic': 'utility',
  'death-ward': 'utility',
  'counterspell': 'utility',
  'protection-from-energy': 'utility',
  'greater-restoration': 'utility',
  'conjure-animals': 'utility',
  'haste': 'utility',          // complex — defer
  'polymorph': 'utility',      // complex — defer
  'banishment': 'utility',     // complex — defer
  'wall-of-force': 'utility',  // complex — defer
};

/** Check if a spell is castable in our engine */
export function isSpellCastable(spellIndex: string): boolean {
  const type = SPELL_CAST_TYPE[spellIndex];
  return type !== undefined && type !== 'utility';
}

/** Get the cast type, defaulting to utility for unknown spells */
export function getSpellCastType(spellIndex: string): SpellCastType {
  return SPELL_CAST_TYPE[spellIndex] || 'utility';
}
