/**
 * Game State Types
 *
 * Core data structures for the gameplay loop.
 * These are the LIVE game types — derived from ClassBuild/SRD data
 * but mutable during gameplay (HP changes, equipment swaps, etc.)
 */

import type { StatusEffect } from '@/components/molecules/StatusStack';

// ─── Zones ───────────────────────────────────────────────────
// Zones are numeric positions (1, 2, 3). Distance between entities
// determines melee (0), ranged (1), or far (2) relationships.

export type Zone = 1 | 2 | 3;

// ─── Equipment ──────────────────────────────────────────────

export interface EquippedWeapon {
  index: string;
  name: string;
  damage: string;        // dice expression, e.g. '1d8'
  damageType: string;    // 'slashing', 'piercing', 'bludgeoning', etc.
  weaponRange: string;   // 'melee' | 'ranged'
  properties: string[];  // 'finesse', 'light', 'two-handed', etc.
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
    ring1: string | null;
    ring2: string | null;
  };
  consumables: { id: string; name: string; quantity: number; effect: string; value: number }[];

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

  // Combat state
  zone: Zone;
  statusEffects: StatusEffect[];
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
  statusEffects: StatusEffect[];
  isAlive: boolean;
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
  actionUsed: boolean;
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
}

// ─── Rooms ───────────────────────────────────────────────────

export type RoomType = 'combat' | 'elite_combat' | 'boss' | 'rest' | 'treasure' | 'trap';

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
  | 'trap'
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
}
