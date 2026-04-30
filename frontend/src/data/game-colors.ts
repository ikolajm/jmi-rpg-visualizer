/**
 * Game Color System
 *
 * Semantic color tokens for all game mechanics. Single source of truth.
 * Components import from here — never hardcode game colors inline.
 *
 * Colors chosen to match established RPG conventions (BG3, D&D Beyond, etc.)
 * while working on both dark and light backgrounds.
 */

// ─── Damage Types ────────────────────────────────────────────

export const damageColors: Record<string, string> = {
  // Elemental
  fire:        '#e8723a',
  cold:        '#5b9bd5',
  lightning:   '#d4c94a',
  thunder:     '#9b7fd4',
  acid:        '#8cc43c',
  poison:      '#5bad5a',

  // Magical
  necrotic:    '#4aba8a',
  radiant:     '#e8c263',
  force:       '#8b7fd4',
  psychic:     '#d47fa8',

  // Physical
  bludgeoning: '#9a9590',
  piercing:    '#9a9590',
  slashing:    '#9a9590',

  // Positive
  healing:     '#d45b6e',
};

// ─── Spell Schools ───────────────────────────────────────────

export const schoolColors: Record<string, string> = {
  evocation:     '#e8723a',
  necromancy:    '#4aba8a',
  illusion:      '#9b7fd4',
  abjuration:    '#e8c263',
  conjuration:   '#3abab4',
  divination:    '#5b9bd5',
  enchantment:   '#d47fa8',
  transmutation: '#9a9590',
};

// ─── Action Economy ──────────────────────────────────────────

export const actionColors: Record<string, string> = {
  action:       '#e8c263',  // gold — primary action
  bonusAction:  '#e8723a',  // orange — bonus
  reaction:     '#5b9bd5',  // blue — reactive
  ritual:       '#9b7fd4',  // purple — ritual cast
  free:         '#5bad5a',  // green — free action
};

// ─── Item Rarity ─────────────────────────────────────────────

export const rarityColors: Record<string, string> = {
  common:    '#9a9590',
  uncommon:  '#5bad5a',
  rare:      '#5b9bd5',
  veryRare:  '#9b7fd4',
  legendary: '#e8c263',
  artifact:  '#e8723a',
};

// ─── Feature Types (left border accents) ─────────────────────

export const featureColors: Record<string, string> = {
  attack:   '#c43c3c',
  defense:  '#e8c263',
  resource: '#5b9bd5',
  passive:  '#9a9590',
  stat:     '#5bad5a',
};

// ─── Status Effects ──────────────────────────────────────────

export const statusColors: Record<string, string> = {
  poisoned:       '#5bad5a',
  burning:        '#e8723a',
  frozen:         '#5b9bd5',
  cursed:         '#9b7fd4',
  blessed:        '#e8c263',
  stunned:        '#9a9590',
  raging:         '#c43c3c',
  concentrating:  '#4a7fd4',
};

// ─── Resources ───────────────────────────────────────────────

export const resourceColors = {
  hp:         '#c43c3c',
  hpLow:      '#e8723a',
  hpCritical: '#d42b2b',
  spellSlot:  '#4a7fd4',
  xp:         '#5bad5a',
};

// ─── Surfaces / Overlays ─────────────────────────────────────

export const surfaceColors = {
  overlay:      'rgba(0, 0, 0, 0.50)',
  overlayHeavy: 'rgba(0, 0, 0, 0.70)',
  overlayLight: 'rgba(0, 0, 0, 0.40)',
  glassHover:   'rgba(255, 255, 255, 0.10)',
  glassActive:  'rgba(255, 255, 255, 0.15)',
};

// ─── Tailwind class helpers ──────────────────────────────────
// For inline usage where a CSS var isn't practical.
// These are style objects, not class names — use with style={} prop.

export function damageStyle(type: string) {
  return { color: damageColors[type] || damageColors.slashing };
}

export function schoolStyle(school: string) {
  return { color: schoolColors[school] || schoolColors.transmutation };
}

export function actionStyle(action: string) {
  return { color: actionColors[action] || actionColors.action };
}

export function rarityStyle(rarity: string) {
  return { color: rarityColors[rarity] || rarityColors.common };
}

export function rarityBorderStyle(rarity: string) {
  return { borderColor: rarityColors[rarity] || rarityColors.common };
}

export function featureBorderStyle(type: string) {
  return { borderLeftColor: featureColors[type] || featureColors.passive };
}
