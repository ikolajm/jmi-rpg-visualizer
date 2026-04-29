'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  GameState, Character, GamePhase, Room, CombatState, LogEntry, RunStats,
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
      weapon: build.startingEquipment.weapon,
      armor: build.startingEquipment.armor,
      shield: build.startingEquipment.shield,
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

  return (
    <GameContext value={{
      state, initParty, setPhase, setRoom, setCombat, addLog, updateCharacter, updateStats,
    }}>
      {children}
    </GameContext>
  );
}
