'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  GameState, Character, GamePhase, Room, CombatState, LogEntry, RunStats,
  EquippedWeapon, EquippedArmor, FloorModifier,
} from '@/data/game-types';
import type { ClassBuild } from '@/data/classes';

// ─── Initial State ───────────────────────────────────────────

const INITIAL_STATS: RunStats = {
  roomsCleared: 0,
  floorsCleared: 0,
  totalDamageDealt: 0,
  totalDamageTaken: 0,
  totalHealing: 0,
  enemiesKilled: 0,
  charactersLost: 0,
  highestFloor: 1,
};

const INITIAL_STATE: GameState = {
  party: [],
  floor: 1,
  roomNumber: 0,
  currentRoom: null,
  phase: 'room-preview',
  combat: null,
  log: [],
  stats: INITIAL_STATS,
  floorModifier: null,
};

// ─── Feature Uses Factory ────────────────────────────────────

function buildFeatureUses(classIndex: string): Record<string, { used: number; max: number }> {
  const uses: Record<string, { used: number; max: number }> = {};
  switch (classIndex) {
    case 'fighter':
      uses['second-wind'] = { used: 0, max: 1 };
      break;
    case 'barbarian':
      uses['rage'] = { used: 0, max: 2 };
      break;
    // Rogue's Cunning Action is unlimited (no tracking needed)
    // Caster bonus action spells use spell slots (tracked separately)
  }
  return uses;
}

// ─── Starting Equipment Data ────────────────────────────────

const STARTING_WEAPONS: Record<string, EquippedWeapon> = {
  longsword: { index: 'longsword', name: 'Longsword', damage: '1d8', damageType: 'slashing', weaponRange: 'melee', properties: [] },
  shortsword: { index: 'shortsword', name: 'Shortsword', damage: '1d6', damageType: 'piercing', weaponRange: 'melee', properties: ['finesse', 'light'] },
  greataxe: { index: 'greataxe', name: 'Greataxe', damage: '1d12', damageType: 'slashing', weaponRange: 'melee', properties: ['heavy', 'two-handed'] },
  mace: { index: 'mace', name: 'Mace', damage: '1d6', damageType: 'bludgeoning', weaponRange: 'melee', properties: [] },
  longbow: { index: 'longbow', name: 'Longbow', damage: '1d8', damageType: 'piercing', weaponRange: 'ranged', properties: ['ammunition', 'heavy', 'two-handed'] },
  quarterstaff: { index: 'quarterstaff', name: 'Quarterstaff', damage: '1d6', damageType: 'bludgeoning', weaponRange: 'melee', properties: [] },
};

const STARTING_ARMOR: Record<string, EquippedArmor | null> = {
  'chain-mail': { index: 'chain-mail', name: 'Chain Mail', acBase: 16, acDexCap: 0 },
  'leather-armor': { index: 'leather-armor', name: 'Leather Armor', acBase: 11 },
  'scale-mail': { index: 'scale-mail', name: 'Scale Mail', acBase: 14, acDexCap: 2 },
  'none': null,
};

// ─── Character Factory ──────────────────────────────────────

function createCharacter(build: ClassBuild, slotIndex: number): Character {
  const conMod = Math.floor((build.stats.con - 10) / 2);

  return {
    id: `char-${slotIndex}`,
    name: build.name,
    classIndex: build.index,
    level: 1,
    xp: 0,
    hp: build.hitDie + conMod,
    maxHp: build.hitDie + conMod,
    ac: build.ac,
    acSource: build.acSource,
    stats: { ...build.stats },
    savingThrows: [...build.savingThrows],
    equipment: {
      weapon: STARTING_WEAPONS[build.startingEquipment.weapon] || STARTING_WEAPONS.longsword,
      armor: STARTING_ARMOR[build.startingEquipment.armor] ?? null,
      shield: build.startingEquipment.shield,
      ring1: null,
      ring2: null,
    },
    consumables: [
      { id: 'health-potion', name: 'Health Potion', quantity: 2, effect: 'heal', value: 7 },
    ],
    spellcasting: build.spellcasting ? {
      ability: build.spellcasting.ability,
      spellSaveDC: build.spellcasting.spellSaveDC,
      spellAttackBonus: build.spellcasting.spellAttackBonus,
      cantrips: [...build.spellcasting.cantrips],
      preparedSpells: [...build.spellcasting.preparedSpells],
      slotsTotal: build.spellcasting.spellSlotsLevel1,
      slotsUsed: 0,
    } : null,
    features: [...build.features],
    featureUses: buildFeatureUses(build.index),
    trainingBuff: null,
    zone: 2,
    statusEffects: [],
    isAlive: true,
  };
}

// ─── Context ─────────────────────────────────────────────────

interface GameContextValue {
  state: GameState;
  initParty: (builds: ClassBuild[]) => void;
  setPhase: (phase: GamePhase) => void;
  setRoom: (room: Room) => void;
  setCombat: (combat: CombatState | null) => void;
  addLog: (message: string, type: LogEntry['type']) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  updateStats: (updates: Partial<RunStats>) => void;
  advanceRoom: () => void;
  setFloorModifier: (modifier: FloorModifier | null) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(INITIAL_STATE);

  const initParty = useCallback((builds: ClassBuild[]) => {
    const party = builds.map((b, i) => createCharacter(b, i));
    setState({
      ...INITIAL_STATE,
      party,
      floor: 1,
      roomNumber: 0,
      phase: 'room-preview',
      log: [{
        id: 'init',
        timestamp: Date.now(),
        message: 'The party descends into the dungeon...',
        type: 'system',
      }],
    });
  }, []);

  const setPhase = useCallback((phase: GamePhase) => {
    setState(prev => ({ ...prev, phase }));
  }, []);

  const setRoom = useCallback((room: Room) => {
    setState(prev => ({
      ...prev,
      currentRoom: room,
      roomNumber: room.roomNumber,
      floor: room.floor,
    }));
  }, []);

  const setCombat = useCallback((combat: CombatState | null) => {
    setState(prev => ({ ...prev, combat }));
  }, []);

  const addLog = useCallback((message: string, type: LogEntry['type']) => {
    setState(prev => ({
      ...prev,
      log: [...prev.log, {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        message,
        type,
      }],
    }));
  }, []);

  const updateCharacter = useCallback((id: string, updates: Partial<Character>) => {
    setState(prev => ({
      ...prev,
      party: prev.party.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }, []);

  const updateStats = useCallback((updates: Partial<RunStats>) => {
    setState(prev => ({
      ...prev,
      stats: { ...prev.stats, ...updates },
    }));
  }, []);

  const advanceRoom = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentRoom: null,
      phase: 'room-preview' as GamePhase,
    }));
  }, []);

  const setFloorModifier = useCallback((modifier: FloorModifier | null) => {
    setState(prev => ({ ...prev, floorModifier: modifier }));
  }, []);

  return (
    <GameContext value={{
      state, initParty, setPhase, setRoom, setCombat, addLog, updateCharacter, updateStats, advanceRoom, setFloorModifier,
    }}>
      {children}
    </GameContext>
  );
}
