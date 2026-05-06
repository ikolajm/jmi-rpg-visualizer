/**
 * V1 Roster — Curated game content
 *
 * Every entry here is distinct, functional, and intentional.
 * Generators and UI filter against these lists.
 * Nothing outside the roster appears in gameplay.
 *
 * Philosophy: FF GBA / BG1 / Fallout 1 — small scope, everything works.
 */

// ─── Monsters (46 curated from 304) ────────────────────────────

export const V1_MONSTERS = new Set([
  // Tier 1 — Floors 1-5 (CR 0.125–1): 15 monsters
  'giant-rat',        // 0.125 — intro fodder
  'kobold',           // 0.125 — pack tactics, teaches positioning
  'skeleton',         // 0.125 — poison immune, bludgeoning vulnerable (teaches damage types)
  'stirge',           // 0.125 — blood drain grapple
  'goblin',           // 0.25  — flexible melee + ranged, nimble escape
  'sprite',           // 0.25  — poison sleep arrow, invisibility, high AC
  'flying-sword',     // 0.25  — construct, AC 17, condition immunities
  'wolf',             // 0.25  — pack tactics + knockdown
  'cockatrice',       // 0.5   — petrification (first real threat)
  'hobgoblin',        // 0.5   — martial advantage +2d6 with ally, AC 18
  'shadow',           // 0.5   — necrotic drain, STR reduction
  'worg',             // 0.5   — knockdown bite, tanky wolf upgrade
  'bugbear',          // 1     — brute + surprise damage
  'ghoul',            // 1     — paralysis claws (first condition enemy)
  'giant-spider',     // 1     — web restrain + poison

  // Tier 2 — Floors 6-10 (CR 2–5): 15 monsters
  'ogre',             // 2 — big HP sack, hits hard
  'ghast',            // 2 — stench aura poison, paralyzing claws (ghoul upgrade)
  'ankheg',           // 2 — acid spray line AoE + grapple
  'gelatinous-cube',  // 2 — engulf mechanic, transparent ambush
  'mimic',            // 2 — adhesive grapple, shapechanger surprise
  'hell-hound',       // 3 — fire immune, fire breath cone, pack tactics
  'owlbear',          // 3 — multi-attack bruiser, iconic
  'mummy',            // 3 — rot curse (reduce max HP), dreadful glare fear
  'phase-spider',     // 3 — ethereal jaunt vanish, poison bite
  'winter-wolf',      // 3 — cold immune, cold breath AoE, pack tactics
  'troll',            // 5 — regeneration 10/turn (fire/acid stops it)
  'air-elemental',    // 5 — whirlwind AoE knockback
  'fire-elemental',   // 5 — fire form passive damage, water vulnerability
  'gorgon',           // 5 — petrifying breath cone
  'vampire-spawn',    // 5 — life drain, regen, sunlight vulnerability

  // Tier 3 — Floors 11-15 (CR 6–8): 8 monsters
  'chimera',          // 6 — 3 heads multi-attack + fire breath
  'drider',           // 6 — spider hybrid, poison + spellcasting
  'medusa',           // 6 — petrifying gaze, snake hair, ranged poison
  'wyvern',           // 6 — poison stinger 7d6
  'stone-giant',      // 7 — rock throw + greatclub tank
  'oni',              // 7 — regen, shapechanger, innate spellcasting
  'young-white-dragon', // 6 — cold breath, cold immune
  'young-black-dragon', // 7 — acid breath, acid immune

  // Tier 4 — Floors 16-20 (CR 9–10): 5 monsters
  'young-red-dragon',    // 10 — fire breath 16d6, iconic boss
  'young-blue-dragon',   // 9  — lightning breath
  'aboleth',             // 10 — tentacle disease, legendary actions
  'guardian-naga',        // 10 — spellcaster boss, poison spit
  'young-silver-dragon',  // 9  — cold breath + paralyze breath

  // Death March — Floors 21+ (CR 11+): 3 monsters
  'remorhaz',          // 11 — heated body, swallow
  'purple-worm',       // 15 — 247 HP, swallow, tail stinger
  'adult-red-dragon',  // 17 — the final wall
]);

// ─── Spells (27 curated from 52) ───────────────────────────────

export const V1_SPELLS = new Set([
  // Cantrips (4)
  'fire-bolt',         // Wizard — 1d10 fire, 120ft
  'ray-of-frost',      // Wizard — 1d8 cold + slow, 60ft
  'shocking-grasp',    // Wizard — 1d8 lightning, touch, no reactions
  'sacred-flame',      // Cleric — 1d8 radiant, 60ft, DEX save

  // Level 1 Damage (5)
  'magic-missile',     // Wizard — 3×(1d4+1) force, auto-hit
  'burning-hands',     // Wizard — 3d6 fire cone, DEX save
  'guiding-bolt',      // Cleric — 4d6 radiant, next attack advantage
  'inflict-wounds',    // Cleric — 3d10 necrotic, melee touch
  'thunderwave',       // Wizard — 2d8 thunder + push, CON save

  // Level 1 Conditions (2)
  'sleep',             // Wizard — 5d8 HP pool, lowest HP first
  'command',           // Cleric — WIS save or skip next turn

  // Level 1 Buffs (3)
  'bless',             // Cleric — +1d4 attacks/saves, up to 3 allies
  'hunters-mark',      // Ranger — +1d6 damage to marked target
  'shield-of-faith',   // Cleric — +2 AC to one ally

  // Level 1 Defense (1)
  'shield',            // Wizard — +5 AC until next turn

  // Level 1 Healing (2)
  'cure-wounds',       // Cleric/Ranger — 1d8+MOD, touch
  'healing-word',      // Cleric — 1d4+MOD, bonus action, 60ft

  // Level 2 (6)
  'scorching-ray',     // Wizard — 3×2d6 fire
  'spiritual-weapon',  // Cleric — 1d8+MOD, bonus action
  'hold-person',       // Cleric — WIS save or paralyzed
  'web',               // Wizard — DEX save or restrained
  'spike-growth',      // Ranger — zone hazard, 2d4 piercing
  'aid',               // Cleric — +5 max HP to up to 3 targets

  // Level 3 (2)
  'fireball',          // Wizard — 8d6 fire, DEX save
  'spirit-guardians',  // Cleric — zone aura, 3d8 radiant/turn

  // Level 4 (1)
  'wall-of-fire',      // Wizard — boundary spell, 5d8 fire on crossing

  // Level 5 (2)
  'flame-strike',      // Cleric — 4d6 fire + 4d6 radiant, DEX save
  'cone-of-cold',      // Wizard — 8d8 cold, CON save
]);

// ─── Weapons (12 curated from 37) ──────────────────────────────

export interface RosterWeapon {
  index: string;
  name: string;
  damage: string;
  damageType: string;
  weaponRange: 'melee' | 'ranged';
  properties: string[];
}

export const V1_WEAPONS: RosterWeapon[] = [
  { index: 'dagger', name: 'Dagger', damage: '1d4', damageType: 'piercing', weaponRange: 'melee', properties: ['finesse', 'light', 'thrown'] },
  { index: 'shortsword', name: 'Shortsword', damage: '1d6', damageType: 'piercing', weaponRange: 'melee', properties: ['finesse', 'light'] },
  { index: 'mace', name: 'Mace', damage: '1d6', damageType: 'bludgeoning', weaponRange: 'melee', properties: [] },
  { index: 'quarterstaff', name: 'Quarterstaff', damage: '1d6', damageType: 'bludgeoning', weaponRange: 'melee', properties: [] },
  { index: 'longsword', name: 'Longsword', damage: '1d8', damageType: 'slashing', weaponRange: 'melee', properties: ['versatile'] },
  { index: 'rapier', name: 'Rapier', damage: '1d8', damageType: 'piercing', weaponRange: 'melee', properties: ['finesse'] },
  { index: 'warhammer', name: 'Warhammer', damage: '1d8', damageType: 'bludgeoning', weaponRange: 'melee', properties: ['versatile'] },
  { index: 'longbow', name: 'Longbow', damage: '1d8', damageType: 'piercing', weaponRange: 'ranged', properties: ['ammunition', 'heavy', 'two-handed'] },
  { index: 'glaive', name: 'Glaive', damage: '1d10', damageType: 'slashing', weaponRange: 'melee', properties: ['heavy', 'reach', 'two-handed'] },
  { index: 'heavy-crossbow', name: 'Heavy Crossbow', damage: '1d10', damageType: 'piercing', weaponRange: 'ranged', properties: ['ammunition', 'heavy', 'loading', 'two-handed'] },
  { index: 'greataxe', name: 'Greataxe', damage: '1d12', damageType: 'slashing', weaponRange: 'melee', properties: ['heavy', 'two-handed'] },
  { index: 'greatsword', name: 'Greatsword', damage: '2d6', damageType: 'slashing', weaponRange: 'melee', properties: ['heavy', 'two-handed'] },
];

export const V1_WEAPON_SET = new Set(V1_WEAPONS.map(w => w.index));

// ─── Armor (8 curated from 13) ─────────────────────────────────

export interface RosterArmor {
  index: string;
  name: string;
  acBase: number;
  acDexCap?: number; // undefined = no cap (light), number = medium/heavy cap, 0 = no DEX
  category: 'light' | 'medium' | 'heavy';
}

export const V1_ARMOR: RosterArmor[] = [
  { index: 'leather-armor', name: 'Leather Armor', acBase: 11, category: 'light' },
  { index: 'studded-leather-armor', name: 'Studded Leather', acBase: 12, category: 'light' },
  { index: 'chain-shirt', name: 'Chain Shirt', acBase: 13, acDexCap: 2, category: 'medium' },
  { index: 'scale-mail', name: 'Scale Mail', acBase: 14, acDexCap: 2, category: 'medium' },
  { index: 'half-plate-armor', name: 'Half Plate', acBase: 15, acDexCap: 2, category: 'medium' },
  { index: 'chain-mail', name: 'Chain Mail', acBase: 16, acDexCap: 0, category: 'heavy' },
  { index: 'splint-armor', name: 'Splint', acBase: 17, acDexCap: 0, category: 'heavy' },
  { index: 'plate-armor', name: 'Plate', acBase: 18, acDexCap: 0, category: 'heavy' },
];

export const V1_ARMOR_SET = new Set(V1_ARMOR.map(a => a.index));

// ─── Consumables (9 curated) ───────────────────────────────────

export interface RosterConsumable {
  index: string;
  name: string;
  rarity: string;
  effect: 'heal' | 'buff' | 'spell';
  healDice?: string;      // for potions: dice expression
  buffDescription?: string;
  spellIndex?: string;     // for scrolls: which spell it casts
  category: 'consumable';
}

export const V1_CONSUMABLES: RosterConsumable[] = [
  { index: 'potion-of-healing', name: 'Potion of Healing', rarity: 'Common', effect: 'heal', healDice: '2d4+2', category: 'consumable' },
  { index: 'potion-of-greater-healing', name: 'Potion of Greater Healing', rarity: 'Uncommon', effect: 'heal', healDice: '4d4+4', category: 'consumable' },
  { index: 'potion-of-superior-healing', name: 'Potion of Superior Healing', rarity: 'Rare', effect: 'heal', healDice: '8d4+8', category: 'consumable' },
  { index: 'potion-of-heroism', name: 'Potion of Heroism', rarity: 'Rare', effect: 'buff', buffDescription: '+10 temporary HP and Bless effect for 1 hour.', category: 'consumable' },
  { index: 'potion-of-fire-resistance', name: 'Potion of Fire Resistance', rarity: 'Uncommon', effect: 'buff', buffDescription: 'Resistance to fire damage for 1 hour.', category: 'consumable' },
  { index: 'potion-of-speed', name: 'Potion of Speed', rarity: 'Very Rare', effect: 'buff', buffDescription: 'Haste effect for 1 minute. Extra action each turn.', category: 'consumable' },
  { index: 'scroll-of-fireball', name: 'Scroll of Fireball', rarity: 'Uncommon', effect: 'spell', spellIndex: 'fireball', category: 'consumable' },
  { index: 'scroll-of-cure-wounds', name: 'Scroll of Cure Wounds', rarity: 'Common', effect: 'spell', spellIndex: 'cure-wounds', category: 'consumable' },
  { index: 'scroll-of-hold-person', name: 'Scroll of Hold Person', rarity: 'Uncommon', effect: 'spell', spellIndex: 'hold-person', category: 'consumable' },
];

export const V1_CONSUMABLE_SET = new Set(V1_CONSUMABLES.map(c => c.index));

// ─── Combat-Relevant Features (per class) ──────────────────────

/** Features that mechanically affect zone combat. Everything else is hidden. */
export const V1_FEATURES: Record<string, Set<string>> = {
  fighter: new Set([
    'fighter-fighting-style',     // L1: +1 AC in armor (Defense)
    'second-wind',                // L1: bonus action heal 1d10+level
    'action-surge-1-use',         // L2: extra action, 1/rest
    'improved-critical',          // L3: crit on 19-20
    'extra-attack-1',             // L5: 2 attacks per action
  ]),
  rogue: new Set([
    'sneak-attack',               // L1: +Xd6 with advantage or ally in zone
    'cunning-action',             // L2: bonus action dash/disengage
    'uncanny-dodge',              // L5: reaction halve damage
    'rogue-evasion',              // L7: DEX save success = 0 damage
  ]),
  wizard: new Set([
    'arcane-recovery',            // L1: recover spell slots on rest
    'sculpt-spells',              // L2: allies auto-save your evocation spells
    'potent-cantrip',             // L6: cantrips deal half on save
    'empowered-evocation',        // L10: +INT mod to evocation damage
  ]),
  cleric: new Set([
    'disciple-of-life',           // L1: healing spells +2+spell level
    'channel-divinity-preserve-life', // L2: 5×level HP divided among allies
    'blessed-healer',             // L6: when you heal others, heal self 2+spell level
    'divine-strike',              // L8: +1d8 radiant on weapon attack
  ]),
  ranger: new Set([
    'ranger-fighting-style',      // L2: fighting style
    'ranger-extra-attack',        // L5: 2 attacks per action
    'hunters-prey',               // L3: +1d8 on wounded target
  ]),
  barbarian: new Set([
    'rage',                       // L1: +2 damage, physical resistance
    'barbarian-unarmored-defense', // L1: AC = 10 + DEX + CON
    'reckless-attack',            // L2: advantage on attacks, enemies get advantage
    'barbarian-extra-attack',     // L5: 2 attacks per action
    'brutal-critical-1-die',      // L9: extra die on crit
  ]),
};

// ─── Loot Tier Mapping ─────────────────────────────────────────

/** Which equipment is available at each floor tier */
export const LOOT_TIERS = {
  // Floors 1-5: starting gear + minor upgrades
  early: {
    weapons: ['dagger', 'shortsword', 'mace', 'quarterstaff', 'longsword', 'longbow', 'greataxe'],
    armor: ['leather-armor', 'studded-leather-armor', 'chain-shirt', 'scale-mail', 'chain-mail'],
    consumables: ['potion-of-healing', 'scroll-of-cure-wounds'],
  },
  // Floors 6-10: full base roster + uncommon consumables
  mid: {
    weapons: ['rapier', 'warhammer', 'glaive', 'heavy-crossbow', 'greatsword'],
    armor: ['half-plate-armor', 'splint-armor'],
    consumables: ['potion-of-greater-healing', 'potion-of-fire-resistance', 'scroll-of-fireball', 'scroll-of-hold-person'],
  },
  // Floors 11-15: top-tier base + rare consumables
  late: {
    weapons: ['greatsword', 'glaive', 'heavy-crossbow'],
    armor: ['splint-armor', 'plate-armor'],
    consumables: ['potion-of-superior-healing', 'potion-of-heroism'],
  },
  // Floors 16+: endgame
  endgame: {
    weapons: ['greatsword', 'glaive'],
    armor: ['plate-armor'],
    consumables: ['potion-of-superior-healing', 'potion-of-heroism', 'potion-of-speed'],
  },
} as const;
