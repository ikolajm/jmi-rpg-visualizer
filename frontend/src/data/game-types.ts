/**
 * Game State Types
 *
 * Core data structures for the gameplay loop.
 * These are the LIVE game types — derived from ClassBuild/SRD data
 * but mutable during gameplay (HP changes, equipment swaps, etc.)
 */

import type { StatusFlag } from './condition-visuals';

// ─── Zones ───────────────────────────────────────────────────
// Zones are numeric positions (1, 2, 3). Distance between entities
// determines melee (0), ranged (1), or far (2) relationships.

export type Zone = 1 | 2 | 3;

// ─── Equipment ──────────────────────────────────────────────

export interface WeaponOnHit {
  trigger: 'hit' | 'crit';         // when the effect fires
  chance?: number;                   // 0-1, default 1 (always)
  condition?: string;                // condition to apply (e.g. 'burning', 'frozen')
  conditionDuration?: number;        // turns
  conditionSave?: string;            // ability for save (e.g. 'con')
  conditionDC?: number;              // save DC
  bonusDamage?: string;              // extra dice (e.g. '1d8')
  bonusDamageType?: string;          // damage type
  bonusVsType?: string;              // only triggers vs this monster type (e.g. 'undead')
  description: string;               // tooltip text
}

export interface EquippedWeapon {
  index: string;
  name: string;
  damage: string;        // dice expression, e.g. '1d8'
  damageType: string;    // 'slashing', 'piercing', 'bludgeoning', etc.
  weaponRange: string;   // 'melee' | 'ranged'
  properties: string[];  // 'finesse', 'light', 'two-handed', etc.
  onHit?: WeaponOnHit;   // magic weapon on-hit effect
}

export interface EquippedArmor {
  index: string;
  name: string;
  acBase: number;
  acDexCap?: number;     // undefined = no cap (light), 2 = medium, 0 = heavy
}

// ─── Characters (Player Party) ──────────────────────────────

export interface Character {
  id: string;
  name: string;
  classIndex: string;
  level: number;
  xp: number;

  // Vitals
  hp: number;
  maxHp: number;
  ac: number;
  acSource: string;

  // Ability scores
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };

  savingThrows: string[];

  // Equipment
  equipment: {
    weapon: EquippedWeapon;
    armor: EquippedArmor | null;
    shield: boolean;
  };
  // Live inventory carries only id + quantity; the curated definition
  // (name, effect, healDice, spellIndex) is resolved from V1_CONSUMABLES.
  consumables: { id: string; quantity: number }[];

  // Spellcasting (null for non-casters)
  spellcasting: {
    ability: string;
    spellSaveDC: number;
    spellAttackBonus: number;
    cantrips: string[];
    preparedSpells: string[];
    slotsTotal: number;
    slotsUsed: number;
  } | null;

  // Class features active at current level
  features: string[];

  // Limited-use feature tracking (resets on rest)
  featureUses: Record<string, { used: number; max: number }>;

  // Training buff (+3 primary stat, clears on next rest)
  trainingBuff: { stat: keyof Character['stats']; amount: number } | null;

  // Combat state
  zone: Zone;
  statusEffects: StatusFlag[];
  isAlive: boolean;
}

// ─── Enemies ─────────────────────────────────────────────────

export interface Enemy {
  id: string;
  monsterIndex: string;
  name: string;
  type: string;
  cr: number;
  xp: number;
  behavior: string;
  isBoss: boolean;

  hp: number;
  maxHp: number;
  ac: number;

  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };

  damageResistances: string[];
  damageImmunities: string[];
  damageVulnerabilities: string[];
  conditionImmunities: string[];

  actions: {
    name: string;
    description: string;
    toHit?: number;
    damage?: string;
    damageType?: string;
    reach: string;
    // Condition on hit (parsed from description)
    conditionDC?: number;
    conditionSave?: string;
    conditionApplied?: string;
    // Save-based damage (breath weapons, AoE)
    saveDC?: number;
    saveType?: string;
    saveSuccess?: string; // 'half' | 'none'
  }[];

  specialAbilities: {
    name: string;
    description: string;
  }[];

  // Combat state
  zone: Zone;
  statusEffects: StatusFlag[];
  isAlive: boolean;
}

// ─── Enemy Intent ───────────────────────────────────────────

export type IntentType = 'melee' | 'ranged' | 'breath' | 'condition' | 'skip';

export interface EnemyIntent {
  type: IntentType;
  actionName?: string; // e.g. "Fire Breath", "Bite" — for tooltip
}

// ─── Combat ──────────────────────────────────────────────────

export type CombatEntity = {
  type: 'character';
  id: string;
  initiative: number;
} | {
  type: 'enemy';
  id: string;
  initiative: number;
};

export interface TurnResources {
  actionsRemaining: number;  // 1 normally, 2 with Extra Attack, +1 from Action Surge
  bonusActionUsed: boolean;
  movementUsed: boolean;
}

export interface BoundaryEffect {
  id: string;
  name: string;
  element: 'fire' | 'ice' | 'force';
  damage?: string;
  damageType?: string;
  saveDC?: number;
  saveAbility?: string;
  sourceId: string;
  blocksMovement?: boolean;
}

export type BoundaryKey = '1|2' | '2|3';

export interface CombatState {
  enemies: Enemy[];
  initiativeOrder: CombatEntity[];
  currentTurnIndex: number;
  roundNumber: number;
  turnResources: TurnResources;
  dodging: string[];
  activeEffects: import('@/data/status-effects').ActiveEffect[];
  boundaries: Record<BoundaryKey, BoundaryEffect | null>;
  enemyIntents: Record<string, EnemyIntent>;
}

// ─── Rooms ───────────────────────────────────────────────────

export type RoomType = 'combat' | 'elite_combat' | 'boss' | 'rest' | 'treasure';

export interface Room {
  type: RoomType;
  floor: number;
  roomNumber: number;
  flavorText?: string;
  completed: boolean;
}

// ─── Game Phases ─────────────────────────────────────────────

export type GamePhase =
  | 'room-preview'
  | 'combat'
  | 'loot'
  | 'rest'
  | 'level-up'
  | 'game-over';

// ─── Run Stats (scoring) ─────────────────────────────────────

export interface RunStats {
  roomsCleared: number;
  floorsCleared: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalHealing: number;
  enemiesKilled: number;
  charactersLost: number;
  highestFloor: number;
}

// ─── Log Entry ───────────────────────────────────────────────

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'combat' | 'loot' | 'system' | 'death' | 'levelup';
}

// ─── Floor Modifiers ────────────────────────────────────────

export type FloorModifierId =
  | 'darkness'
  | 'hallowed-ground'
  | 'blood-moon'
  | 'ironhide'
  | 'thin-veil'
  | 'echoing-halls'
  | 'blessed-winds'
  | 'unstable-ground';

export interface FloorModifier {
  id: FloorModifierId;
  name: string;
  description: string;
}

// ─── Full Game State ─────────────────────────────────────────

export interface GameState {
  party: Character[];
  floor: number;
  roomNumber: number;
  currentRoom: Room | null;
  phase: GamePhase;
  combat: CombatState | null;
  log: LogEntry[];
  stats: RunStats;
  floorModifier: FloorModifier | null;
}
