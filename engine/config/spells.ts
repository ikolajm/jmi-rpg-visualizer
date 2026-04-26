/**
 * Spell Combat Relevance + Status Effect Mapping
 *
 * The game auto-includes spells that have damage, heal_at_slot_level, dc, or attack_type.
 * That covers 125 of 319 SRD spells. The lists below handle the rest:
 *
 * - manualInclude: combat-relevant buffs/debuffs/control that lack auto-detect fields
 * - manualExclude: spells that have dc/damage but aren't useful in a dungeon crawl
 * - statusEffectMap: which spells apply which visual status effects on placards
 */

/**
 * Spells to include despite lacking damage/heal/dc/attack_type fields.
 * These are buffs, debuffs, and control spells relevant to dungeon combat.
 */
export const manualInclude: string[] = [
  // Defensive / AC buffs
  'Shield',
  'Shield of Faith',
  'Mage Armor',
  'Barkskin',
  'Stoneskin',
  'Blur',
  'Blink',
  'Mirror Image',

  // Offensive buffs
  'Bless',
  'Haste',
  'Hunter\'s Mark',
  'Magic Weapon',
  'Heroism',
  'Enhance Ability',
  'True Strike',
  'Shillelagh',

  // Defensive / party protection
  'Death Ward',
  'Protection From Energy',
  'Protection from Evil and Good',
  'Protection from Poison',
  'Sanctuary',
  'Warding Bond',
  'Holy Aura',
  'Globe of Invulnerability',
  'Resistance',

  // Condition removal
  'Lesser Restoration',
  'Greater Restoration',
  'Remove Curse',
  'Spare the Dying',

  // Movement / positioning
  'Misty Step',
  'Expeditious Retreat',
  'Fly',
  'Freedom of Movement',
  'Longstrider',

  // Battlefield control
  'Darkness',
  'Silence',
  'Web',
  'Sleet Storm',
  'Spike Growth',
  'Spirit Guardians',
  'Wall of Force',
  'Wall of Stone',
  'Forcecage',
  'Prismatic Wall',
  'Antilife Shell',
  'Antimagic Field',

  // Counter / dispel
  'Counterspell',
  'Dispel Magic',

  // Stealth / advantage
  'Greater Invisibility',
  'Invisibility',
  'Pass Without Trace',

  // Instant effect (no dc because auto-succeed)
  'Power Word Kill',
  'Power Word Stun',
  'Color Spray',
  'Irresistible Dance',
  'Maze',
  'Time Stop',

  // Conjuration (summons add action economy)
  'Conjure Animals',
  'Conjure Elemental',
  'Conjure Minor Elementals',
  'Conjure Fey',
  'Conjure Celestial',
  'Conjure Woodland Beings',
  'Animate Dead',
  'Animate Objects',

  // Healing adjacent
  'Beacon of Hope',
  'Goodberry',
  'Heroes\' Feast',

  // Polymorph (massive combat impact)
  'True Polymorph',

  // Telekinesis (can throw enemies/objects)
  'Telekinesis',

  // Fog Cloud (area denial)
  'Fog Cloud',

  // Arcane Hand (versatile combat utility)
  'Arcane Hand',
];

/**
 * Spells to exclude despite having damage/heal/dc/attack_type.
 * These technically have combat fields but aren't useful in a dungeon crawl.
 */
export const manualExclude: string[] = [
  // These are fine for now — reassess during playtesting
];

/**
 * Status effect mapping.
 *
 * Maps SRD spell index → game status effect for the visual animation system.
 * A spell can apply multiple effects. Only maps spells that inflict a
 * tracked status — raw damage spells without a lingering effect aren't listed.
 */
export type StatusEffect =
  | 'poisoned'
  | 'burning'
  | 'frozen'
  | 'cursed'
  | 'blessed'
  | 'stunned'
  | 'raging'         // barbarian class feature, not spell-applied
  | 'concentrating'; // auto-applied when casting a concentration spell

/**
 * SRD condition → game effect consolidation:
 *
 *   SRD Condition              → Game Effect   → Rationale
 *   ─────────────────────────────────────────────────────────
 *   Poisoned                   → poisoned       Direct match
 *   Stunned, Paralyzed,        → stunned        All prevent/limit actions
 *     Frightened, Incapacitated,
 *     Unconscious
 *   Restrained, Grappled,      → frozen         All prevent movement
 *     Petrified
 *   Blinded, Charmed           → cursed         Disadvantage / impaired
 *   Prone, Deafened            → (skipped)       Minimal zone-combat impact
 *   Invisible                  → (skipped)       Not a debuff to inflict
 *
 * "burning" has no SRD condition — it's a game-specific fire DoT.
 * "blessed" and "raging" are buffs, not SRD conditions.
 */
export const statusEffectMap: Record<string, StatusEffect[]> = {

  // === Poisoned ===
  'poison-spray': ['poisoned'],
  'ray-of-sickness': ['poisoned'],
  'stinking-cloud': ['poisoned'],
  'cloudkill': ['poisoned'],
  'contagion': ['poisoned'],

  // === Burning (game-specific fire DoT — no SRD condition equivalent) ===
  'heat-metal': ['burning'],
  'flaming-sphere': ['burning'],
  'wall-of-fire': ['burning'],
  'fire-shield': ['burning'],

  // === Frozen (SRD: restrained, grappled, petrified → can't move zones) ===
  'ray-of-frost': ['frozen'],
  'entangle': ['frozen'],
  'web': ['frozen'],
  'sleet-storm': ['frozen'],
  'black-tentacles': ['frozen'],
  'telekinesis': ['frozen'],
  'flesh-to-stone': ['frozen'],
  'imprisonment': ['frozen'],
  'cone-of-cold': ['frozen'],
  'prismatic-spray': ['cursed', 'frozen'],   // blinded + petrified + restrained
  'prismatic-wall': ['cursed', 'frozen'],    // blinded + petrified + restrained

  // === Cursed (SRD: blinded, charmed → disadvantage / impaired) ===
  'bestow-curse': ['cursed'],
  'bane': ['cursed'],
  'hex': ['cursed'],
  'blindness-deafness': ['cursed'],
  'charm-person': ['cursed'],
  'color-spray': ['cursed', 'stunned'],      // blinded + unconscious
  'suggestion': ['cursed'],
  'compulsion': ['cursed'],
  'dominate-beast': ['cursed'],
  'dominate-person': ['cursed'],
  'dominate-monster': ['cursed'],
  'sunbeam': ['cursed'],
  'sunburst': ['cursed'],

  // === Blessed (buffs — positive effects) ===
  'bless': ['blessed'],
  'beacon-of-hope': ['blessed'],
  'holy-aura': ['blessed'],
  'heroism': ['blessed'],

  // === Stunned (SRD: stunned, paralyzed, frightened, incapacitated, unconscious → skip turn) ===
  'hold-person': ['stunned'],
  'hold-monster': ['stunned'],
  'power-word-stun': ['stunned'],
  'sleep': ['stunned'],
  'fear': ['stunned'],
  'hypnotic-pattern': ['cursed', 'stunned'],  // charmed + incapacitated
  'banishment': ['stunned'],
  'phantasmal-killer': ['stunned'],
  'irresistible-dance': ['stunned'],
  'divine-word': ['cursed', 'stunned'],        // blinded + stunned
  'symbol': ['stunned'],
  'weird': ['stunned'],

  // === Multiple effects ===
  'eyebite': ['stunned', 'poisoned'],          // frightened + unconscious variants
  'contagion': ['poisoned', 'stunned'],         // poisoned + blinded + stunned variants
};

/**
 * Status effects applied by monster abilities (by action name patterns).
 * The AI system checks monster action descriptions for these keywords.
 */
export const monsterStatusTriggers: Record<string, StatusEffect> = {
  'poison': 'poisoned',
  'Poisoned': 'poisoned',
  'fire': 'burning',
  'Fire Breath': 'burning',
  'cold': 'frozen',
  'Cold Breath': 'frozen',
  'Frightful Presence': 'stunned', // fear → stunned for simplicity in v1
  'paralyz': 'stunned',            // Paralyzing Touch → stunned
  'curse': 'cursed',
  'Curse': 'cursed',
};

/**
 * Check if a spell is combat-relevant.
 */
export function isCombatRelevant(spell: {
  index: string;
  damage?: unknown;
  heal_at_slot_level?: unknown;
  dc?: unknown;
  attack_type?: string;
}): boolean {
  if (manualExclude.includes(spell.index)) return false;

  // Auto-include: has combat-relevant fields
  if (spell.damage || spell.heal_at_slot_level || spell.dc || spell.attack_type) {
    return true;
  }

  // Manual include list (matched by name, not index — more readable)
  // The caller should pass the name separately if checking by name
  return false;
}

/**
 * Check if a spell is in the manual include list (by name).
 */
export function isManuallyIncluded(spellName: string): boolean {
  return manualInclude.includes(spellName);
}
