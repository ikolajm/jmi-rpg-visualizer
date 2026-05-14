/**
 * Progression — XP awards, level-up checks, and stat application.
 */

import { casterProgression, rangerSpellcasting, classBuilds } from './classes';
import { rollDice, statMod } from './dice';
import type { Character } from './game-types';

/** Accelerated XP thresholds for roguelike pacing (roughly 1/3 of 5e standard) */
export const XP_THRESHOLDS: Record<number, number> = {
  2: 100,
  3: 300,
  4: 750,
  5: 1800,
  6: 4000,
  7: 7500,
  8: 11000,
  9: 16000,
  10: 22000,
};

/** Proficiency bonus by level */
export function proficiencyBonus(level: number): number {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  return 4;
}

/** Primary stat per class for auto-ASI */
export const PRIMARY_STAT: Record<string, keyof Character['stats']> = {
  fighter: 'str',
  rogue: 'dex',
  wizard: 'int',
  cleric: 'wis',
  ranger: 'dex',
  barbarian: 'str',
};

/** Levels that grant Ability Score Improvements */
const ASI_LEVELS: Record<string, number[]> = {
  fighter: [4, 6, 8],
  rogue: [4, 8, 10],
  wizard: [4, 8],
  cleric: [4],
  ranger: [4, 8],
  barbarian: [4, 8],
};

/** V1 combat features granted at each level (display names for level-up recap) */
const LEVEL_FEATURES: Record<string, Record<number, string[]>> = {
  fighter: {
    2: ['Action Surge'],
    3: ['Improved Critical'],
    5: ['Extra Attack'],
  },
  rogue: {
    // No new named features — Rogue's progression is Sneak Attack scaling.
  },
  wizard: {
    10: ['Empowered Evocation'],
  },
  cleric: {
    2: ['Channel Divinity: Preserve Life'],
    6: ['Blessed Healer'],
    8: ['Divine Strike'],
  },
  ranger: {
    3: ["Hunter's Prey"],
    5: ['Extra Attack'],
  },
  barbarian: {
    2: ['Reckless Attack'],
    5: ['Extra Attack'],
    9: ['Brutal Critical'],
  },
};

/** Award XP equally to alive party members. Returns updated characters. */
export function awardXP(party: Character[], xpTotal: number): Character[] {
  const alive = party.filter(c => c.isAlive);
  if (alive.length === 0) return party;
  const xpEach = Math.floor(xpTotal / alive.length);

  return party.map(c => {
    if (!c.isAlive) return c;
    return { ...c, xp: c.xp + xpEach };
  });
}

/** Check if a character is eligible to level up */
export function checkLevelUp(character: Character): boolean {
  if (character.level >= 10) return false;
  const threshold = XP_THRESHOLDS[character.level + 1];
  return threshold !== undefined && character.xp >= threshold;
}

export interface LevelUpResult {
  character: Character;
  hpGained: number;
  newLevel: number;
  newFeatures: string[];
  newSpells: string[];
  statBoost?: { stat: string; amount: number };
}

/** Apply level-up to a character. Returns the updated character and a summary of changes. */
export function applyLevelUp(character: Character): LevelUpResult {
  const newLevel = character.level + 1;
  const noChange: LevelUpResult = { character, hpGained: 0, newLevel: character.level, newFeatures: [], newSpells: [] };
  if (newLevel > 10) return noChange;

  const build = classBuilds.find(b => b.index === character.classIndex);
  if (!build) return noChange;

  // HP increase: roll hit die + CON mod (minimum 1)
  const hpRoll = Math.max(1, rollDice(`1d${build.hitDie}`) + statMod(character.stats.con));
  const newMaxHp = character.maxHp + hpRoll;

  // Combat features for this level
  const newFeatureNames = LEVEL_FEATURES[character.classIndex]?.[newLevel] || [];
  const updatedFeatures = [...character.features, ...newFeatureNames];

  // Proficiency bonus update
  const oldProf = proficiencyBonus(character.level);
  const newProf = proficiencyBonus(newLevel);
  const profDelta = newProf - oldProf;

  // Auto-ASI: +2 to primary stat at ASI levels
  const updatedStats = { ...character.stats };
  let statBoost: LevelUpResult['statBoost'] = undefined;
  const asiLevels = ASI_LEVELS[character.classIndex] || [];
  if (asiLevels.includes(newLevel)) {
    const primary = PRIMARY_STAT[character.classIndex] || 'str';
    updatedStats[primary] = Math.min(20, updatedStats[primary] + 2);
    statBoost = { stat: primary.toUpperCase(), amount: 2 };
  }

  // Spellcasting updates
  let updatedSpellcasting = character.spellcasting;

  // Ranger gets spellcasting at level 2
  if (character.classIndex === 'ranger' && newLevel === 2 && !updatedSpellcasting) {
    updatedSpellcasting = {
      ability: rangerSpellcasting.ability,
      spellSaveDC: rangerSpellcasting.spellSaveDC,
      spellAttackBonus: rangerSpellcasting.spellAttackBonus,
      cantrips: [],
      preparedSpells: [...rangerSpellcasting.startingSpells],
      slotsTotal: rangerSpellcasting.spellSlotsLevel1,
      slotsUsed: 0,
    };
  }

  // Add new spells from caster progression
  let gainedSpells: string[] = [];
  if (updatedSpellcasting) {
    const progression = casterProgression[character.classIndex];
    const newSpells = progression?.newSpellsPerLevel[newLevel] || [];
    gainedSpells = newSpells;
    if (newSpells.length > 0) {
      updatedSpellcasting = {
        ...updatedSpellcasting,
        preparedSpells: [...updatedSpellcasting.preparedSpells, ...newSpells],
      };
    }

    // Update proficiency-based values
    if (profDelta > 0) {
      updatedSpellcasting = {
        ...updatedSpellcasting,
        spellSaveDC: updatedSpellcasting.spellSaveDC + profDelta,
        spellAttackBonus: updatedSpellcasting.spellAttackBonus + profDelta,
      };
    }

    // Grant extra spell slot at certain levels (simplified: +1 slot at 2,3,5,7,9)
    if ([2, 3, 5, 7, 9].includes(newLevel)) {
      updatedSpellcasting = {
        ...updatedSpellcasting,
        slotsTotal: updatedSpellcasting.slotsTotal + 1,
      };
    }
  }

  // Feature uses updates
  const updatedFeatureUses = { ...character.featureUses };

  if (character.classIndex === 'fighter' && newLevel === 2) {
    updatedFeatureUses['action-surge'] = { used: 0, max: 1 };
  }
  if (character.classIndex === 'cleric' && newLevel === 2) {
    updatedFeatureUses['channel-divinity'] = { used: 0, max: 1 };
  }
  if (character.classIndex === 'barbarian' && (newLevel === 3 || newLevel === 6)) {
    const currentMax = updatedFeatureUses['rage']?.max || 2;
    updatedFeatureUses['rage'] = { used: 0, max: currentMax + 1 };
  }

  return {
    character: {
      ...character,
      level: newLevel,
      maxHp: newMaxHp,
      hp: character.hp + hpRoll,
      stats: updatedStats,
      features: updatedFeatures,
      spellcasting: updatedSpellcasting,
      featureUses: updatedFeatureUses,
    },
    hpGained: hpRoll,
    newLevel,
    newFeatures: newFeatureNames,
    newSpells: gainedSpells,
    statBoost,
  };
}
