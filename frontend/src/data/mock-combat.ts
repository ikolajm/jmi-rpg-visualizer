/**
 * Mock combat scenario for dev testing.
 * Spawns a fixed encounter: 2 goblins + 2 skeletons vs the party.
 */

import type { Enemy, CombatState, CombatEntity, Character } from './game-types';

function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

function statMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

const MOCK_ENEMIES: Omit<Enemy, 'id' | 'zone' | 'statusEffects' | 'isAlive'>[] = [
  {
    monsterIndex: 'goblin',
    name: 'Goblin',
    type: 'humanoid',
    cr: 0.25,
    xp: 50,
    behavior: 'flexible',
    hp: 7, maxHp: 7,
    ac: 15,
    stats: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    damageResistances: [],
    damageImmunities: [],
    damageVulnerabilities: [],
    conditionImmunities: [],
    actions: [
      { name: 'Scimitar', description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.', toHit: 4, damage: '1d6+2', damageType: 'slashing', reach: 'melee' },
      { name: 'Shortbow', description: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.', toHit: 4, damage: '1d6+2', damageType: 'piercing', reach: 'any' },
    ],
    specialAbilities: [
      { name: 'Nimble Escape', description: 'The goblin can take the Disengage or Hide action as a bonus action on each of its turns.' },
    ],
  },
  {
    monsterIndex: 'skeleton',
    name: 'Skeleton',
    type: 'undead',
    cr: 0.25,
    xp: 50,
    behavior: 'flexible',
    hp: 13, maxHp: 13,
    ac: 13,
    stats: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 },
    damageResistances: [],
    damageImmunities: ['poison'],
    damageVulnerabilities: ['bludgeoning'],
    conditionImmunities: ['poisoned', 'exhaustion'],
    actions: [
      { name: 'Shortsword', description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage.', toHit: 4, damage: '1d6+2', damageType: 'piercing', reach: 'melee' },
      { name: 'Shortbow', description: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.', toHit: 4, damage: '1d6+2', damageType: 'piercing', reach: 'any' },
    ],
    specialAbilities: [],
  },
];

export function createMockEnemies(): Enemy[] {
  return [
    { ...MOCK_ENEMIES[0], id: 'enemy-0', zone: 1, statusEffects: [], isAlive: true, name: 'Goblin A' },
    { ...MOCK_ENEMIES[0], id: 'enemy-1', zone: 2, statusEffects: [], isAlive: true, name: 'Goblin B' },
    { ...MOCK_ENEMIES[1], id: 'enemy-2', zone: 1, statusEffects: [], isAlive: true, name: 'Skeleton A' },
    { ...MOCK_ENEMIES[1], id: 'enemy-3', zone: 2, statusEffects: [], isAlive: true, name: 'Skeleton B' },
  ];
}

export function rollInitiative(party: Character[], enemies: Enemy[]): CombatEntity[] {
  const entries: CombatEntity[] = [];

  for (const char of party) {
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
      initiative: rollD20() + statMod(enemy.stats.dex),
    });
  }

  // Sort descending by initiative, break ties with higher DEX
  entries.sort((a, b) => b.initiative - a.initiative);

  return entries;
}

export function createMockCombat(party: Character[]): CombatState {
  const enemies = createMockEnemies();
  const initiativeOrder = rollInitiative(party, enemies);

  return {
    enemies,
    initiativeOrder,
    currentTurnIndex: 0,
    turnResources: { actionUsed: false, bonusActionUsed: false, movementUsed: false },
    dodging: [],
    activeEffects: [],
    boundaries: { '1|2': null, '2|3': null },
    roundNumber: 1,
  };
}
