/**
 * Encounter Generator — creates CombatState from floor/room type.
 * Pulls from pre-baked monster pool, assigns zones, rolls initiative.
 */

import { monstersByCR, type MonsterTemplate } from './monster-pool';
import { getFloorTier } from './encounter-config';
import { V1_MONSTERS } from './v1-roster';
import { rollInitiative } from './mock-combat';
import type { Enemy, CombatState, Character, Zone, RoomType } from './game-types';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Get all v1-roster monsters matching any CR in the pool */
function getMonstersForCRs(crPool: number[]): MonsterTemplate[] {
  const result: MonsterTemplate[] = [];
  for (const cr of crPool) {
    const pool = monstersByCR[cr];
    if (pool) result.push(...pool.filter(m => V1_MONSTERS.has(m.monsterIndex)));
  }
  return result;
}

function pickMonsters(floor: number, roomType: 'combat' | 'elite_combat' | 'boss', roomNumber?: number): MonsterTemplate[] {
  const tier = getFloorTier(floor);

  // First room: gentle intro — 2 of the weakest enemies
  if (roomNumber === 1 && roomType === 'combat') {
    const easyPool = getMonstersForCRs([0.125, 0.25]);
    if (easyPool.length > 0) {
      return [pickRandom(easyPool), pickRandom(easyPool)];
    }
  }

  if (roomType === 'boss') {
    // Find boss-eligible monsters (CR >= bossMinCR)
    const allCRs = Object.keys(monstersByCR).map(Number).sort((a, b) => a - b);
    const bossCRs = allCRs.filter(cr => cr >= tier.bossMinCR);
    const bossPool = getMonstersForCRs(bossCRs);

    if (bossPool.length === 0) {
      // Fallback: use highest available from tier pool
      const fallback = getMonstersForCRs(tier.crPool);
      return fallback.length > 0 ? [pickRandom(fallback)] : [];
    }

    // Prefer legendary monsters
    const legendary = bossPool.filter(m => m.behavior === 'boss' || m.behavior === 'boss-caster');
    const boss = legendary.length > 0 ? pickRandom(legendary) : pickRandom(bossPool);

    // Optionally add 1-2 adds from the regular pool
    const adds: MonsterTemplate[] = [];
    const addPool = getMonstersForCRs(tier.crPool);
    if (addPool.length > 0) {
      const addCount = randBetween(0, 2);
      for (let i = 0; i < addCount; i++) {
        adds.push(pickRandom(addPool));
      }
    }

    return [boss, ...adds];
  }

  if (roomType === 'elite_combat') {
    // Pick from upper half of CR pool
    const upperPool = tier.crPool.slice(Math.floor(tier.crPool.length / 2));
    const pool = getMonstersForCRs(upperPool.length > 0 ? upperPool : tier.crPool);
    if (pool.length === 0) return [];

    const count = randBetween(tier.enemyCount.elite[0], tier.enemyCount.elite[1]);
    return Array.from({ length: count }, () => pickRandom(pool));
  }

  // Standard combat
  const pool = getMonstersForCRs(tier.crPool);
  if (pool.length === 0) return [];

  const count = randBetween(tier.enemyCount.combat[0], tier.enemyCount.combat[1]);
  return Array.from({ length: count }, () => pickRandom(pool));
}

function templateToEnemy(template: MonsterTemplate, index: number): Enemy {
  const zoneMap: Record<string, Zone> = {
    'melee-aggro': 1,
    'boss': 1,
    'flexible': 2,
    'caster': 3,
    'boss-caster': 3,
    'passive': 2,
  };

  return {
    id: `enemy-${index}`,
    monsterIndex: template.monsterIndex,
    name: template.name,
    type: template.type,
    cr: template.cr,
    xp: template.xp,
    hp: template.hp,
    maxHp: template.hp,
    ac: template.ac,
    stats: { ...template.stats },
    damageResistances: [...template.damageResistances],
    damageImmunities: [...template.damageImmunities],
    damageVulnerabilities: [...template.damageVulnerabilities],
    conditionImmunities: [...template.conditionImmunities],
    actions: template.actions.map(a => ({ ...a })),
    specialAbilities: template.specialAbilities.map(sa => ({ ...sa })),
    zone: zoneMap[template.behavior] || 1,
    statusEffects: [],
    isAlive: true,
    behavior: template.behavior,
  };
}

function deduplicateNames(enemies: Enemy[]): void {
  const counts: Record<string, number> = {};
  for (const e of enemies) {
    counts[e.monsterIndex] = (counts[e.monsterIndex] || 0) + 1;
  }

  const suffixCounters: Record<string, number> = {};
  for (const e of enemies) {
    if (counts[e.monsterIndex] > 1) {
      const idx = (suffixCounters[e.monsterIndex] || 0);
      e.name = `${e.name} ${String.fromCharCode(65 + idx)}`; // A, B, C...
      suffixCounters[e.monsterIndex] = idx + 1;
    }
  }
}

export function generateEncounter(
  floor: number,
  roomType: 'combat' | 'elite_combat' | 'boss',
  party: Character[],
  roomNumber?: number,
  enemyInitiativeBonus?: number,
): CombatState {
  const templates = pickMonsters(floor, roomType, roomNumber);
  const enemies = templates.map((t, i) => templateToEnemy(t, i));
  deduplicateNames(enemies);

  const initiativeOrder = rollInitiative(party, enemies, enemyInitiativeBonus);

  return {
    enemies,
    initiativeOrder,
    currentTurnIndex: 0,
    roundNumber: 1,
    turnResources: { actionsRemaining: 1, bonusActionUsed: false, movementUsed: false },
    dodging: [],
    activeEffects: [],
    boundaries: { '1|2': null, '2|3': null },
    enemyIntents: {},
  };
}
