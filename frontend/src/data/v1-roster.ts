/**
 * V1 Roster — Curated game content
 *
 * Every entry here is distinct, functional, and intentional.
 * Generators and UI filter against these lists.
 * Nothing outside the roster appears in gameplay.
 *
 * Philosophy: FF GBA / BG1 / Fallout 1 — small scope, everything works.
 */

// ─── Monsters (18 curated from 304) ────────────────────────────
//
// Curation rule: every entry either offers a strategy loop the engine
// actually wires (a damage-type weakness/immunity, or a condition the
// player saves against), OR is a deliberate vanilla "mob" for dungeon-
// crawl texture. Distributed across the compressed 5-floor cadence.
// Cut creatures whose loop was dead data (specialAbility / desc-only)
// or redundant with a kept loop.

export const V1_MONSTERS = new Set([
  // ─ Floor 1 — CR 0.125–0.25 ─
  'giant-rat',          // 0.125 — mob: vanilla cleanup fodder
  'goblin',             // 0.25  — mob: vanilla flexible attacker
  'skeleton',           // 0.25  — bludgeoning-vulnerable + poison-immune (damage-type teacher)
  'wolf',               // 0.25  — Bite inflicts prone (STR save)

  // ─ Floor 2 — CR 0.5–1 ─
  'shadow',             // 0.5   — resists nonmagical physical, vulnerable to radiant
  'ghoul',              // 1     — Claws inflict paralyzed (CON save)
  'giant-spider',       // 1     — Bite inflicts poisoned (CON save); the poison creature

  // ─ Floor 3 — CR 2 ─
  'ankheg',             // 2     — Acid Spray: save-for-half AoE
  'gelatinous-cube',    // 2     — Engulf: restrain + save-or-full AoE
  'ogre',               // 2     — mob: vanilla "watch your HP" bruiser

  // ─ Floor 4 — CR 3 ─
  'hell-hound',         // 3     — fire-immune + fire-breath AoE
  'mummy',              // 3     — fire-vulnerable + frighten-inflict + resists physical
  'winter-wolf',        // 3     — cold-immune + prone-inflict + cold-breath AoE
  'owlbear',            // 3     — mob: vanilla high-damage bruiser

  // ─ Floor 5+ — CR 3–5 ─
  'gorgon',             // 5     — Petrifying Breath: restrain + save-or-full AoE

  // ─ Bosses (cycle across floors, multiplicatively scaled — see V1_BOSSES) ─
  'chimera',            // 6 base — multiattack + Fire Breath save-AoE
  'young-black-dragon', // 7 base — acid-immune + Acid Breath save-AoE
  'stone-giant',        // 7 base — Rock: ranged prone-inflict + heavy melee
]);

/**
 * Bosses — a subset of V1_MONSTERS. Spawned only in boss rooms, never as
 * regular encounters. The encounter generator cycles them by floor and
 * scales them multiplicatively (CR 6-7 stats are the ceiling — they're
 * scaled down for the floor they actually appear on).
 */
export const V1_BOSSES = new Set([
  'chimera',
  'young-black-dragon',
  'stone-giant',
]);

// ─── Spells (23 curated from 52) ───────────────────────────────
//
// Curation rule: every spell is a distinct, wired player tool. The deep
// tail (L3+ spells unlocked at character level 5+) was cut — average runs
// never reach it. Boundary spells are the exception: kept and re-tiered
// into demonstrated scope, since the boundary subsystem is an extensible
// zone-control playstyle worth promoting.

export const V1_SPELLS = new Set([
  // ─ Cantrips (4) ─
  'fire-bolt',         // Wizard — 1d10 fire
  'ray-of-frost',      // Wizard — 1d8 cold
  'shocking-grasp',    // Wizard — 1d8 lightning, melee
  'sacred-flame',      // Cleric — 1d8 radiant, DEX save

  // ─ Damage (6) ─
  'magic-missile',     // Wizard — 3×(1d4+1) force, auto-hit
  'burning-hands',     // Wizard — 3d6 fire cone, DEX save
  'guiding-bolt',      // Cleric — 4d6 radiant
  'inflict-wounds',    // Cleric — 3d10 necrotic, melee
  'thunderwave',       // Wizard — 2d8 thunder, CON save
  'scorching-ray',     // Wizard — fire, single-target

  // ─ Conditions (5) ─
  'sleep',             // Wizard — 5d8 HP pool, lowest HP first
  'command',           // Cleric — WIS save or skip next turn
  'hold-person',       // Cleric — WIS save or paralyzed
  'web',               // Wizard — DEX save or restrained
  'spike-growth',      // Ranger — zone hazard, 2d4 piercing

  // ─ Buffs / Defense (4) ─
  'bless',             // Cleric — +1d4 attacks/saves
  'hunters-mark',      // Ranger — +1d6 damage to marked target
  'shield-of-faith',   // Cleric — +2 AC to one ally
  'shield',            // Wizard — +5 AC self until next turn

  // ─ Healing (2) ─
  'cure-wounds',       // Cleric/Ranger — 1d8+MOD, touch
  'healing-word',      // Cleric — 1d4+MOD, bonus action

  // ─ Boundary — zone-control walls (2) ─
  'wall-of-fire',      // Wizard — fire wall: damage on cross (re-tiered into early access)
  'wall-of-frost',     // Wizard — ice wall: blocks movement entirely (custom, completes the boundary system)
]);

// ─── Weapons (14 curated from 37 — 9 base + 5 magic) ───────────
//
// Only damage / damageType / range / finesse / on-hit are mechanically
// wired; all other properties are flavor. Base weapons are kept where
// they occupy a distinct point on that grid or are a class starter;
// the 5 magic weapons each carry a unique damage type + wired on-hit.

import type { WeaponOnHit } from './game-types';

export interface RosterWeapon {
  index: string;
  name: string;
  damage: string;
  damageType: string;
  weaponRange: 'melee' | 'ranged';
  properties: string[];
  onHit?: WeaponOnHit;
  rarity?: string;
}

export const V1_WEAPONS: RosterWeapon[] = [
  { index: 'shortsword', name: 'Shortsword', damage: '1d6', damageType: 'piercing', weaponRange: 'melee', properties: ['finesse', 'light'] },
  { index: 'mace', name: 'Mace', damage: '1d6', damageType: 'bludgeoning', weaponRange: 'melee', properties: [] },
  { index: 'quarterstaff', name: 'Quarterstaff', damage: '1d6', damageType: 'bludgeoning', weaponRange: 'melee', properties: [] },
  { index: 'longsword', name: 'Longsword', damage: '1d8', damageType: 'slashing', weaponRange: 'melee', properties: ['versatile'] },
  { index: 'rapier', name: 'Rapier', damage: '1d8', damageType: 'piercing', weaponRange: 'melee', properties: ['finesse'] },
  { index: 'warhammer', name: 'Warhammer', damage: '1d8', damageType: 'bludgeoning', weaponRange: 'melee', properties: ['versatile'] },
  { index: 'longbow', name: 'Longbow', damage: '1d8', damageType: 'piercing', weaponRange: 'ranged', properties: ['ammunition', 'heavy', 'two-handed'] },
  { index: 'heavy-crossbow', name: 'Heavy Crossbow', damage: '1d10', damageType: 'piercing', weaponRange: 'ranged', properties: ['ammunition', 'heavy', 'loading', 'two-handed'] },
  { index: 'greataxe', name: 'Greataxe', damage: '1d12', damageType: 'slashing', weaponRange: 'melee', properties: ['heavy', 'two-handed'] },
  // Magic weapons — each a unique damage type + wired on-hit
  { index: 'flame-tongue', name: 'Flame Tongue', damage: '2d6', damageType: 'fire', weaponRange: 'melee', properties: ['versatile'], rarity: 'Rare',
    onHit: { trigger: 'crit', condition: 'burning', conditionDuration: 3, description: 'On crit: target burns (1d6 fire/turn, 3 turns)' } },
  { index: 'frost-brand', name: 'Frost Brand', damage: '1d8', damageType: 'cold', weaponRange: 'melee', properties: ['versatile'], rarity: 'Rare',
    onHit: { trigger: 'hit', chance: 0.25, condition: 'frozen', conditionDuration: 1, description: '25% chance on hit: target frozen (can\'t move, 1 turn)' } },
  { index: 'venom-dagger', name: 'Venom Dagger', damage: '1d4', damageType: 'piercing', weaponRange: 'melee', properties: ['finesse', 'light'], rarity: 'Uncommon',
    onHit: { trigger: 'hit', condition: 'poisoned', conditionDuration: 2, conditionSave: 'con', conditionDC: 13, description: 'On hit: CON 13 save or poisoned (2 turns)' } },
  { index: 'holy-avenger', name: 'Holy Avenger', damage: '2d6', damageType: 'radiant', weaponRange: 'melee', properties: ['heavy', 'two-handed'], rarity: 'Very Rare',
    onHit: { trigger: 'hit', bonusDamage: '1d8', bonusDamageType: 'radiant', bonusVsType: 'undead', description: 'On hit vs undead: +1d8 radiant damage' } },
  { index: 'thunderous-maul', name: 'Thunderous Maul', damage: '2d6', damageType: 'thunder', weaponRange: 'melee', properties: ['heavy', 'two-handed'], rarity: 'Rare',
    onHit: { trigger: 'crit', condition: 'staggered', conditionDuration: 1, description: 'On crit: target staggered (skips next turn)' } },
];

export const V1_WEAPON_SET = new Set(V1_WEAPONS.map(w => w.index));

// ─── Armor (6 curated from 13) ─────────────────────────────────
//
// A pure AC ladder — only acBase + acDexCap are wired (light = full DEX,
// medium = cap 2, heavy = no DEX). Kept ~2 rungs per category; the
// category DEX rule is the only tactical texture.

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
  { index: 'scale-mail', name: 'Scale Mail', acBase: 14, acDexCap: 2, category: 'medium' },
  { index: 'half-plate-armor', name: 'Half Plate', acBase: 15, acDexCap: 2, category: 'medium' },
  { index: 'chain-mail', name: 'Chain Mail', acBase: 16, acDexCap: 0, category: 'heavy' },
  { index: 'plate-armor', name: 'Plate', acBase: 18, acDexCap: 0, category: 'heavy' },
];

export const V1_ARMOR_SET = new Set(V1_ARMOR.map(a => a.index));

// ─── Consumables (6 curated) ───────────────────────────────────
//
// Two effect types, both fully wired: 'heal' (rolls healDice) and 'spell'
// (a scroll — casts spellIndex as the reader, no slot cost, fixed DC).
// Buff potions were cut — each needed a new mechanic (temp HP, player
// damage-resistance, haste) the engine doesn't have.

export interface RosterConsumable {
  index: string;
  name: string;
  rarity: string;
  effect: 'heal' | 'spell';
  healDice?: string;       // 'heal' — dice expression
  spellIndex?: string;     // 'spell' — the spell the scroll casts
  category: 'consumable';
}

export const V1_CONSUMABLES: RosterConsumable[] = [
  { index: 'potion-of-healing', name: 'Potion of Healing', rarity: 'Common', effect: 'heal', healDice: '2d4+2', category: 'consumable' },
  { index: 'potion-of-greater-healing', name: 'Potion of Greater Healing', rarity: 'Uncommon', effect: 'heal', healDice: '4d4+4', category: 'consumable' },
  { index: 'scroll-of-cure-wounds', name: 'Scroll of Cure Wounds', rarity: 'Common', effect: 'spell', spellIndex: 'cure-wounds', category: 'consumable' },
  { index: 'scroll-of-hold-person', name: 'Scroll of Hold Person', rarity: 'Uncommon', effect: 'spell', spellIndex: 'hold-person', category: 'consumable' },
  { index: 'scroll-of-wall-of-fire', name: 'Scroll of Wall of Fire', rarity: 'Rare', effect: 'spell', spellIndex: 'wall-of-fire', category: 'consumable' },
  { index: 'scroll-of-wall-of-frost', name: 'Scroll of Wall of Frost', rarity: 'Rare', effect: 'spell', spellIndex: 'wall-of-frost', category: 'consumable' },
];

export const V1_CONSUMABLE_SET = new Set(V1_CONSUMABLES.map(c => c.index));

/** Resolve a consumable's curated definition by index. */
export function getConsumable(index: string): RosterConsumable | undefined {
  return V1_CONSUMABLES.find(c => c.index === index);
}

// ─── Combat-Relevant Features (per class) ──────────────────────

/** Features that mechanically affect zone combat. Everything else is hidden. */
/**
 * Features that mechanically fire in v1 zone combat.
 * Excluded: fighting styles (AC hardcoded), cunning action (no dash/disengage),
 * uncanny dodge / evasion (no reactions), arcane recovery (rest handles globally),
 * sculpt spells (no friendly fire), potent cantrip (not wired), unarmored defense (AC hardcoded).
 */
export const V1_FEATURES: Record<string, Set<string>> = {
  fighter: new Set([
    'second-wind',                // L1: bonus action heal 1d10+level
    'action-surge-1-use',         // L2: extra action, 1/rest
    'improved-critical',          // L3: crit on 19-20
    'extra-attack-1',             // L5: 2 attacks per action
  ]),
  rogue: new Set([
    'sneak-attack',               // L1: +Xd6 with advantage or ally in zone
  ]),
  wizard: new Set([
    'empowered-evocation',        // L10: +INT mod to evocation damage
  ]),
  cleric: new Set([
    'disciple-of-life',           // L1: healing spells +2+spell level
    'channel-divinity-preserve-life', // L2: 5×level HP divided among allies
    'blessed-healer',             // L6: when you heal others, heal self 2+spell level
    'divine-strike',              // L8: +1d8 radiant on weapon attack
  ]),
  ranger: new Set([
    'ranger-extra-attack',        // L5: 2 attacks per action
    'hunters-prey',               // L3: +1d8 on wounded target
  ]),
  barbarian: new Set([
    'rage',                       // L1: +2 damage, physical resistance
    'reckless-attack',            // L2: advantage on attacks, enemies get advantage
    'barbarian-extra-attack',     // L5: 2 attacks per action
    'brutal-critical-1-die',      // L9: extra die on crit
  ]),
};

// ─── Feature Combat Summaries ─────────────────────────────────

/**
 * Structured mechanical data for V1 features. The SRD only provides
 * prose descriptions — this fills the gap with badge-friendly summaries.
 * Keyed by feature index. Level-scaling features use a function.
 */
export interface FeatureCombatSummary {
  badge: string | ((level: number) => string);
  detail: string | ((level: number) => string);
  type: 'attack' | 'defense' | 'heal' | 'utility';
}

export const V1_FEATURE_SUMMARIES: Record<string, FeatureCombatSummary> = {
  'second-wind':              { badge: (lvl) => `Heal 1d10+${lvl}`, detail: (lvl) => `Bonus action: recover 1d10+${lvl} HP. Once per rest.`, type: 'heal' },
  'action-surge-1-use':       { badge: 'Extra Action', detail: 'Bonus action: gain one additional action this turn. Once per rest.', type: 'utility' },
  'improved-critical':        { badge: 'Crit on 19-20', detail: 'Your weapon attacks score a critical hit on a roll of 19 or 20.', type: 'attack' },
  'extra-attack-1':           { badge: '2 Attacks', detail: 'You can attack twice per turn instead of once.', type: 'attack' },
  'sneak-attack':             { badge: (lvl) => `Sneak +${Math.ceil(lvl / 2)}d6`, detail: (lvl) => `+${Math.ceil(lvl / 2)}d6 damage when you have advantage or an ally is in the target's zone.`, type: 'attack' },
  'empowered-evocation':      { badge: '+INT to evocation', detail: 'Add your Intelligence modifier to evocation spell damage.', type: 'attack' },
  'disciple-of-life':         { badge: '+2+lvl healing', detail: 'Your healing spells restore an extra 2 + spell level HP.', type: 'heal' },
  'channel-divinity-preserve-life': { badge: '5×lvl HP pool', detail: (lvl) => `Bonus action: distribute ${lvl * 5} HP among wounded allies. Once per rest.`, type: 'heal' },
  'blessed-healer':           { badge: 'Self-heal on heal', detail: 'When you heal an ally, you also recover 2 + spell level HP.', type: 'heal' },
  'divine-strike':            { badge: '+1d8 radiant', detail: 'Once per turn, your weapon attack deals an extra 1d8 radiant damage.', type: 'attack' },
  'ranger-extra-attack':      { badge: '2 Attacks', detail: 'You can attack twice per turn instead of once.', type: 'attack' },
  'hunters-prey':             { badge: '+1d8 wounded', detail: 'Deal an extra 1d8 damage to targets below their max HP.', type: 'attack' },
  'rage':                     { badge: '+2 melee dmg', detail: 'Bonus action: enter rage. +2 melee damage, resist physical damage. Uses limited per day.', type: 'attack' },
  'reckless-attack':          { badge: 'Advantage (risky)', detail: 'Bonus action: gain advantage on attacks this turn, but enemies also gain advantage on you.', type: 'attack' },
  'barbarian-extra-attack':   { badge: '2 Attacks', detail: 'You can attack twice per turn instead of once.', type: 'attack' },
  'brutal-critical-1-die':    { badge: 'Extra crit die', detail: 'On a critical hit, roll one additional weapon damage die.', type: 'attack' },
};

// ─── Loot Tier Mapping ─────────────────────────────────────────

/**
 * Which equipment is available at each floor tier, keyed to the compressed
 * cadence (floors turn over every 5 rooms). Pools are cumulative — a deeper
 * tier adds to everything below it. Weapons are re-distributed in the weapon
 * trim pass; armor + consumable distributions are provisional until their
 * own passes.
 */
export const LOOT_TIERS = {
  // Floors 1-2 — average-run scope
  early: {
    weapons: ['shortsword', 'mace', 'quarterstaff', 'longsword', 'longbow', 'greataxe'],
    armor: ['leather-armor', 'studded-leather-armor'],
    consumables: ['potion-of-healing', 'scroll-of-cure-wounds'],
  },
  // Floors 3-4 — good-run scope
  mid: {
    weapons: ['rapier', 'warhammer', 'heavy-crossbow', 'venom-dagger'],
    armor: ['scale-mail', 'half-plate-armor'],
    consumables: ['potion-of-greater-healing', 'scroll-of-hold-person'],
  },
  // Floors 5-6 — deep-run scope (the boundary-scroll playstyle drops here)
  late: {
    weapons: ['flame-tongue', 'frost-brand'],
    armor: ['chain-mail', 'plate-armor'],
    consumables: ['scroll-of-wall-of-fire', 'scroll-of-wall-of-frost'],
  },
  // Floors 7+ — exceptional-run scope
  endgame: {
    weapons: ['holy-avenger', 'thunderous-maul'],
    armor: [],
    consumables: [],
  },
} as const;
