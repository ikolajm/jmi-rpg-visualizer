/**
 * Game Color Maps
 *
 * Lookup maps for game-mechanic color groups. All values are CSS var
 * references → game-tokens.css (single source of truth for hex values).
 *
 * Per-feature visual registries (damage, conditions, intent, behavior,
 * boundary, hit-event) live in their own *-visuals.ts modules. This file
 * holds the looser groupings (schools, action economy, rarity, feature
 * type, resource bars) that don't justify a dedicated registry.
 */

// ─── Spell Schools ───────────────────────────────────────────

export const schoolColors: Record<string, string> = {
  evocation:     'var(--school-evocation)',
  necromancy:    'var(--school-necromancy)',
  illusion:      'var(--school-illusion)',
  abjuration:    'var(--school-abjuration)',
  conjuration:   'var(--school-conjuration)',
  divination:    'var(--school-divination)',
  enchantment:   'var(--school-enchantment)',
  transmutation: 'var(--school-transmutation)',
};

// ─── Action Economy ──────────────────────────────────────────

export const actionColors: Record<string, string> = {
  action:       'var(--action-primary)',
  bonusAction:  'var(--action-bonus)',
  reaction:     'var(--action-reaction)',
  ritual:       'var(--action-ritual)',
  free:         'var(--action-free)',
};

// ─── Item Rarity ─────────────────────────────────────────────

export const rarityColors: Record<string, string> = {
  common:    'var(--rarity-common)',
  uncommon:  'var(--rarity-uncommon)',
  rare:      'var(--rarity-rare)',
  veryRare:  'var(--rarity-very-rare)',
  legendary: 'var(--rarity-legendary)',
  artifact:  'var(--rarity-artifact)',
};

// ─── Feature Types (left border accents) ─────────────────────

export const featureColors: Record<string, string> = {
  attack:   'var(--feature-attack)',
  defense:  'var(--feature-defense)',
  resource: 'var(--feature-resource)',
  passive:  'var(--feature-passive)',
  stat:     'var(--feature-stat)',
};

// ─── Resources ───────────────────────────────────────────────

export const resourceColors = {
  hp:         'var(--resource-hp)',
  hpLow:      'var(--resource-hp-low)',
  hpCritical: 'var(--resource-hp-critical)',
  hpDead:     'var(--resource-hp-dead)',
  spellSlot:  'var(--resource-spell-slot)',
  xp:         'var(--resource-xp)',
};

// ─── Style helpers ───────────────────────────────────────────

export function schoolStyle(school: string) {
  return { color: schoolColors[school] || schoolColors.transmutation };
}
