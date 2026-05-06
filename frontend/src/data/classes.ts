/**
 * Class Builds — V1
 *
 * Pre-resolved builds for Party Wipe's 6 classes.
 * Standard array: 15, 14, 13, 12, 10, 8 — assigned per class priorities.
 * Starting equipment resolved from SRD options (one default path per class).
 * Starting spells curated to combat-relevant pool.
 *
 * Players pick a class → everything else is auto-derived.
 */

export interface ClassBuild {
  name: string;
  index: string;
  hitDie: number;
  role: string;
  // Standard array: 15, 14, 13, 12, 10, 8
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  savingThrows: string[]; // proficient saves
  ac: number;             // starting AC (armor + shield + DEX)
  acSource: string;       // how AC is calculated
  startingEquipment: {
    weapon: string;       // SRD equipment index
    armor: string;        // SRD equipment index (or 'none')
    shield: boolean;
  };
  startingConsumables: string[]; // SRD equipment/magic item indices

  // Class features active at level 1
  features: string[];

  // Caster info (null for non-casters)
  spellcasting: {
    ability: string;           // INT, WIS, CHA
    spellSaveDC: number;       // 8 + prof(+2) + ability mod
    spellAttackBonus: number;  // prof(+2) + ability mod
    cantripsKnown: number;
    cantrips: string[];        // SRD spell indices — starting cantrips
    spellSlotsLevel1: number;
    preparedSpells: string[];  // SRD spell indices — starting prepared/known
  } | null;
}

export const classBuilds: ClassBuild[] = [

  // ═══════════════════════════════════════════════════════════
  // FIGHTER — Melee DPS / Tank
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Fighter',
    index: 'fighter',
    hitDie: 10,
    role: 'Melee DPS / Tank',
    stats: { str: 15, dex: 12, con: 14, int: 8, wis: 13, cha: 10 },
    savingThrows: ['STR', 'CON'],
    // Chain Mail (AC 16) + Shield (+2) = 18
    ac: 18,
    acSource: 'Chain Mail + Shield',
    startingEquipment: {
      weapon: 'longsword',
      armor: 'chain-mail',
      shield: true,
    },
    startingConsumables: [],
    features: [
      'Fighting Style: Defense',  // +1 AC when wearing armor
      'Second Wind',              // bonus action: heal 1d10 + level HP, 1/rest
    ],
    spellcasting: null,
  },

  // ═══════════════════════════════════════════════════════════
  // ROGUE — Melee Burst
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Rogue',
    index: 'rogue',
    hitDie: 8,
    role: 'Melee Burst',
    stats: { str: 8, dex: 15, con: 13, int: 12, wis: 14, cha: 10 },
    savingThrows: ['DEX', 'INT'],
    ac: 13,
    acSource: 'Leather Armor',
    startingEquipment: {
      weapon: 'shortsword',
      armor: 'leather-armor',
      shield: false,
    },
    startingConsumables: [],
    features: [
      'Sneak Attack',    // +1d6 extra damage when advantage or ally in zone
    ],
    spellcasting: null,
  },

  // ═══════════════════════════════════════════════════════════
  // WIZARD — Ranged AoE / Control
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Wizard',
    index: 'wizard',
    hitDie: 6,
    role: 'Ranged AoE / Control',
    stats: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
    savingThrows: ['INT', 'WIS'],
    // No armor (10 + DEX +2) = 12, but starts with Mage Armor spell → 13 + DEX = 15
    ac: 12,
    acSource: 'No armor (15 with Mage Armor)',
    startingEquipment: {
      weapon: 'quarterstaff',
      armor: 'none',
      shield: false,
    },
    startingConsumables: [],
    features: [
      'Arcane Recovery', // recover spell slots on rest
    ],
    spellcasting: {
      ability: 'INT',
      spellSaveDC: 12,       // 8 + 2(prof) + 2(INT mod)
      spellAttackBonus: 4,   // 2(prof) + 2(INT mod)
      cantripsKnown: 3,
      cantrips: [
        'fire-bolt',         // ranged damage (1d10, 120ft)
        'ray-of-frost',      // ranged damage + slow (1d8, 60ft)
        'shocking-grasp',    // melee damage + no reactions (1d8, touch)
      ],
      spellSlotsLevel1: 2,
      preparedSpells: [
        'magic-missile',     // auto-hit ranged damage (3×1d4+1)
        'shield',            // +5 AC until next turn
        'sleep',             // incapacitate low-HP enemies (no save)
        'burning-hands',     // AoE cone fire (3d6, DEX save)
        'thunderwave',       // AoE push + damage (2d8, CON save)
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════
  // CLERIC — Healer / Support
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Cleric',
    index: 'cleric',
    hitDie: 8,
    role: 'Healer / Support',
    stats: { str: 14, dex: 10, con: 13, int: 8, wis: 15, cha: 12 },
    savingThrows: ['WIS', 'CHA'],
    // Scale Mail (14 + DEX max 2, DEX +0) + Shield (+2) = 16
    ac: 16,
    acSource: 'Scale Mail + Shield',
    startingEquipment: {
      weapon: 'mace',
      armor: 'scale-mail',
      shield: true,
    },
    startingConsumables: [],
    features: [
      'Disciple of Life',     // healing spells restore +2+spell level
    ],
    spellcasting: {
      ability: 'WIS',
      spellSaveDC: 12,       // 8 + 2(prof) + 2(WIS mod)
      spellAttackBonus: 4,   // 2(prof) + 2(WIS mod)
      cantripsKnown: 3,
      cantrips: [
        'sacred-flame',      // ranged damage (1d8, 60ft, DEX save)
      ],
      spellSlotsLevel1: 2,
      preparedSpells: [
        'cure-wounds',       // heal 1d8 + WIS (touch)
        'healing-word',      // heal 1d4 + WIS (60ft, bonus action)
        'bless',             // +1d4 to attacks/saves for 3 targets (concentration)
        'guiding-bolt',      // ranged damage (4d6) + advantage on next attack
        'shield-of-faith',   // +2 AC to one target (concentration)
        'command',           // WIS save or skip turn
      ],
    },
  },

  // ══════════════════════════════════════════════════════��════
  // RANGER — Ranged DPS
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Ranger',
    index: 'ranger',
    hitDie: 10,
    role: 'Ranged DPS',
    stats: { str: 10, dex: 15, con: 14, int: 8, wis: 13, cha: 12 },
    savingThrows: ['STR', 'DEX'],
    // Leather Armor (11 + DEX +2) = 13
    ac: 13,
    acSource: 'Leather Armor',
    startingEquipment: {
      weapon: 'longbow',
      armor: 'leather-armor',
      shield: false,
    },
    startingConsumables: [],
    features: [],  // Ranger combat features come at L2 (Fighting Style, Spellcasting)
    // Ranger gets spellcasting at level 2 — starts without spells
    spellcasting: null,
  },

  // ═══════════════════════════════════════════════════════════
  // BARBARIAN — Melee Tank
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Barbarian',
    index: 'barbarian',
    hitDie: 12,
    role: 'Melee Tank',
    stats: { str: 15, dex: 13, con: 14, int: 8, wis: 12, cha: 10 },
    savingThrows: ['STR', 'CON'],
    // Unarmored Defense: 10 + DEX(+1) + CON(+2) = 13
    ac: 13,
    acSource: 'Unarmored Defense (10 + DEX + CON)',
    startingEquipment: {
      weapon: 'greataxe',
      armor: 'none',
      shield: false,
    },
    startingConsumables: [],
    features: [
      'Rage',              // bonus action: +2 damage, resistance to physical, advantage on STR (uses/day from class_specific)
      'Unarmored Defense',  // AC = 10 + DEX + CON (no armor)
    ],
    spellcasting: null,
  },
];

/**
 * Ranger spellcasting unlocked at level 2.
 * Applied when a Ranger levels up to 2.
 */
export const rangerSpellcasting = {
  ability: 'WIS',
  spellSaveDC: 11,         // 8 + 2(prof) + 1(WIS mod)
  spellAttackBonus: 3,     // 2(prof) + 1(WIS mod)
  spellsKnown: 2,
  spellSlotsLevel1: 2,
  startingSpells: [
    'hunters-mark',       // bonus action: +1d6 damage to target (concentration)
    'cure-wounds',         // heal 1d8 + WIS (touch)
  ],
};

/**
 * Level-up spell progression for casters.
 * Defines what new spells become available at each level.
 * The game engine uses this + the SRD levels.json for slot progression.
 */
export const casterProgression: Record<string, {
  newSpellsPerLevel: Record<number, string[]>;
}> = {
  wizard: {
    newSpellsPerLevel: {
      2: ['sleep'],              // extra L1 if not already known
      3: ['scorching-ray', 'web'],
      5: ['fireball'],
      7: ['wall-of-fire'],
      9: ['cone-of-cold'],
    },
  },
  cleric: {
    newSpellsPerLevel: {
      2: ['inflict-wounds'],
      3: ['spiritual-weapon', 'hold-person'],
      4: ['aid'],
      5: ['spirit-guardians'],
      8: ['flame-strike'],
    },
  },
  ranger: {
    newSpellsPerLevel: {
      // L2 spells come from rangerSpellcasting.startingSpells (hunters-mark, cure-wounds)
      5: ['spike-growth'],
    },
  },
};
