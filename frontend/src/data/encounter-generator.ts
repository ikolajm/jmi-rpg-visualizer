/**
 * Encounter Generator — creates CombatState from floor/room type.
 * Pulls from the curated v1 roster, assigns zones, rolls initiative.
 *
 * Bosses (V1_BOSSES) cycle by floor and are multiplicatively scaled — the
 * same boss creature appears scaled down on early floors and at full power
 * deep in a run. Scaling factors are tune-by-playtest.
 */

import { monstersByCR, type MonsterTemplate } from './monster-pool';
import { getFloorTier } from './encounter-config';
import { V1_MONSTERS, V1_BOSSES } from './v1-roster';
import { rollD20, statMod } from './dice';
import type { Enemy, CombatState, Character, CombatEntity, Zone } from './game-types';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Regular (non-boss) v1-roster monsters matching any CR in the pool. */
function getRegularMonstersForCRs(crPool: number[]): MonsterTemplate[] {
  const result: MonsterTemplate[] = [];
  for (const cr of crPool) {
    const pool = monstersByCR[cr];
    if (pool) {
      result.push(...pool.filter(m =>
        V1_MONSTERS.has(m.monsterIndex) && !V1_BOSSES.has(m.monsterIndex),
      ));
    }
  }
  return result;
}

/** Find a monster template by index across the whole CR-keyed pool. */
function findTemplate(monsterIndex: string): MonsterTemplate | undefined {
  for (const pool of Object.values(monstersByCR)) {
    const found = pool.find(m => m.monsterIndex === monsterIndex);
    if (found) return found;
  }
  return undefined;
}

// ─── Boss Scaling ────────────────────────────────────────────
// Bosses carry CR 6-7 ceiling stats. They're scaled to the floor they
// actually appear on — ~0.4× at floor 1, climbing to 1.0× at floor 5,
// capped at 1.4×. Tune-by-playtest.

function bossScale(floor: number): number {
  return Math.min(1.4, 0.4 + 0.15 * (floor - 1));
}

/** Scale a dice expression's count + modifier by `scale` ("7d8" @0.4 → "3d8"). */
function scaleDamage(expr: string, scale: number): string {
  const m = expr.replace(/\s+/g, '').match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!m) return expr; // flat number or unparseable — leave as-is
  const count = Math.max(1, Math.round(parseInt(m[1], 10) * scale));
  const mod = m[3] ? Math.round(parseInt(m[3], 10) * scale) : 0;
  return `${count}d${m[2]}${mod > 0 ? `+${mod}` : mod < 0 ? `${mod}` : ''}`;
}

/** Cycle bosses by floor: floor 1 → first, floor 2 → second, … then wrap. */
function pickBossForFloor(floor: number): MonsterTemplate | undefined {
  const order = [...V1_BOSSES];
  if (order.length === 0) return undefined;
  return findTemplate(order[(floor - 1) % order.length]);
}

function pickMonsters(floor: number, roomType: 'combat' | 'elite_combat' | 'boss', roomNumber?: number): MonsterTemplate[] {
  const tier = getFloorTier(floor);

  // First room: gentle intro — 2 of the weakest enemies
  if (roomNumber === 1 && roomType === 'combat') {
    const easyPool = getRegularMonstersForCRs([0.125, 0.25]);
    if (easyPool.length > 0) {
      return [pickRandom(easyPool), pickRandom(easyPool)];
    }
  }

  if (roomType === 'boss') {
    const boss = pickBossForFloor(floor);
    if (!boss) {
      // Fallback (shouldn't happen): a regular monster from the tier pool
      const fallback = getRegularMonstersForCRs(tier.crPool);
      return fallback.length > 0 ? [pickRandom(fallback)] : [];
    }
    // Optionally one add from the regular pool
    const addPool = getRegularMonstersForCRs(tier.crPool);
    if (addPool.length > 0 && Math.random() < 0.5) {
      return [boss, pickRandom(addPool)];
    }
    return [boss];
  }

  if (roomType === 'elite_combat') {
    // Pick from upper half of CR pool
    const upperPool = tier.crPool.slice(Math.floor(tier.crPool.length / 2));
    const pool = getRegularMonstersForCRs(upperPool.length > 0 ? upperPool : tier.crPool);
    if (pool.length === 0) return [];

    const count = randBetween(tier.enemyCount.elite[0], tier.enemyCount.elite[1]);
    return Array.from({ length: count }, () => pickRandom(pool));
  }

  // Standard combat
  const pool = getRegularMonstersForCRs(tier.crPool);
  if (pool.length === 0) return [];

  const count = randBetween(tier.enemyCount.combat[0], tier.enemyCount.combat[1]);
  return Array.from({ length: count }, () => pickRandom(pool));
}

function templateToEnemy(template: MonsterTemplate, index: number, floor: number): Enemy {
  const zoneMap: Record<string, Zone> = {
    'melee-aggro': 1,
    'flexible': 2,
    'caster': 3,
    'passive': 2,
  };

  const isBoss = V1_BOSSES.has(template.monsterIndex);
  const scale = isBoss ? bossScale(floor) : 1;

  const hp = isBoss ? Math.max(1, Math.round(template.hp * scale)) : template.hp;
  const actions = template.actions.map(a => {
    if (!isBoss) return { ...a };
    return {
      ...a,
      ...(a.damage ? { damage: scaleDamage(a.damage, scale) } : {}),
      ...(a.toHit !== undefined ? { toHit: Math.round(a.toHit * (0.55 + 0.45 * scale)) } : {}),
      ...(a.saveDC !== undefined ? { saveDC: Math.round(8 + (a.saveDC - 8) * scale) } : {}),
      ...(a.conditionDC !== undefined ? { conditionDC: Math.round(8 + (a.conditionDC - 8) * scale) } : {}),
    };
  });

  return {
    id: `enemy-${index}`,
    monsterIndex: template.monsterIndex,
    name: template.name,
    type: template.type,
    cr: template.cr,
    xp: template.xp,
    behavior: template.behavior,
    isBoss,
    hp,
    maxHp: hp,
    ac: template.ac,
    stats: { ...template.stats },
    damageResistances: [...template.damageResistances],
    damageImmunities: [...template.damageImmunities],
    damageVulnerabilities: [...template.damageVulnerabilities],
    conditionImmunities: [...template.conditionImmunities],
    actions,
    specialAbilities: template.specialAbilities.map(sa => ({ ...sa })),
    zone: zoneMap[template.behavior] ?? 1,
    statusEffects: [],
    isAlive: true,
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

/** Roll initiative for the party + enemies, sorted high to low. */
function rollInitiative(party: Character[], enemies: Enemy[], enemyInitiativeBonus = 0): CombatEntity[] {
  const entries: CombatEntity[] = [];

  for (const char of party) {
    if (!char.isAlive) continue;
    entries.push({
      type: 'character',
      id: char.id,
      initiative: rollD20() + statMod(char.stats.dex),
    });
  }

  for (const enemy of enemies) {
    entries.push({
      type: 'enemy',
      id: enemy.id,
      initiative: rollD20() + statMod(enemy.stats.dex) + enemyInitiativeBonus,
    });
  }

  entries.sort((a, b) => b.initiative - a.initiative);
  return entries;
}

export function generateEncounter(
  floor: number,
  roomType: 'combat' | 'elite_combat' | 'boss',
  party: Character[],
  roomNumber?: number,
  enemyInitiativeBonus?: number,
): CombatState {
  const templates = pickMonsters(floor, roomType, roomNumber);
  const enemies = templates.map((t, i) => templateToEnemy(t, i, floor));
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
