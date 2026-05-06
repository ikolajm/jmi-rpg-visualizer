/**
 * Status Effect System
 *
 * Active effects that modify combat behavior. Applied by spells,
 * resolved at turn start/end, and displayed on zone tokens.
 */

import { rollDice, rollD20, statMod } from './dice';

export interface ActiveEffect {
  id: string;
  name: string;              // display name
  condition: GameCondition;   // mechanical effect type
  sourceId: string;           // entity that applied it (for concentration)
  targetId: string;           // entity it's on
  turnsRemaining: number;     // -1 = concentration (removed when source loses it)
  saveDC?: number;            // DC for end-of-turn repeat saves
  saveAbility?: string;       // ability for repeat saves
  damagePerTurn?: string;     // dice expression for DoT effects
  damageType?: string;        // damage type for DoT
  value?: number;             // generic value (+AC, +damage dice, etc.)
}

export type GameCondition =
  | 'paralyzed'     // skip turn, attacks against auto-crit melee
  | 'unconscious'   // skip turn, attacks against auto-crit, wake on damage
  | 'restrained'    // disadvantage on attacks, advantage on attacks against
  | 'poisoned'      // disadvantage on attacks
  | 'frightened'    // disadvantage on attacks, can't move toward source
  | 'prone'         // melee advantage against, ranged disadvantage against
  | 'petrified'     // skip turn, auto-crit, resistance to all damage
  | 'burning'       // DoT at turn start
  | 'frozen'        // skip movement
  | 'blessed'       // +1d4 on attack rolls
  | 'hunterMarked'  // +1d6 damage from marker
  | 'shielded'      // +AC bonus
  | 'spiritGuarded' // zone aura, enemies in zone take damage
  | 'commanded'     // skip next turn (one-shot)
  | 'staggered';    // skip next turn (vulnerability exploit)

/** Conditions that prevent the entity from acting */
export const SKIP_TURN_CONDITIONS: GameCondition[] = ['paralyzed', 'unconscious', 'commanded', 'petrified', 'staggered'];

/** Conditions that grant advantage on attacks against the affected entity */
export const ADVANTAGE_AGAINST_CONDITIONS: GameCondition[] = ['paralyzed', 'unconscious', 'restrained', 'prone', 'petrified'];

/** Conditions that give the affected entity disadvantage on their attacks */
export const DISADVANTAGE_ON_ATTACK_CONDITIONS: GameCondition[] = ['restrained', 'poisoned', 'frightened', 'prone'];

/** Check if an entity should skip its turn */
export function shouldSkipTurn(effects: ActiveEffect[]): boolean {
  return effects.some(e => SKIP_TURN_CONDITIONS.includes(e.condition));
}

/** Check if attacks against this entity have advantage */
export function hasAdvantageAgainst(effects: ActiveEffect[]): boolean {
  return effects.some(e => ADVANTAGE_AGAINST_CONDITIONS.includes(e.condition));
}

/** Check if this entity has disadvantage on attacks */
export function hasDisadvantageOnAttack(effects: ActiveEffect[]): boolean {
  return effects.some(e => DISADVANTAGE_ON_ATTACK_CONDITIONS.includes(e.condition));
}

/** Get attack roll bonus from buffs (e.g., bless +1d4) */
export function getAttackBonus(effects: ActiveEffect[]): number {
  let bonus = 0;
  for (const e of effects) {
    if (e.condition === 'blessed') bonus += rollDice('1d4');
  }
  return bonus;
}

/** Get extra damage from effects (e.g., hunter's mark +1d6) */
export function getExtraDamage(effects: ActiveEffect[], targetId: string): number {
  let extra = 0;
  for (const e of effects) {
    if (e.condition === 'hunterMarked' && e.targetId === targetId) {
      extra += rollDice('1d6');
    }
  }
  return extra;
}

/** Get AC bonus from effects (e.g., shield +5, shield of faith +2) */
export function getACBonus(effects: ActiveEffect[]): number {
  let bonus = 0;
  for (const e of effects) {
    if (e.condition === 'shielded' && e.value) bonus += e.value;
  }
  return bonus;
}

/** Process end-of-turn saves. Returns effects that remain active. */
export function resolveEndOfTurnSaves(
  effects: ActiveEffect[],
  entityStats: { str: number; dex: number; con: number; int: number; wis: number; cha: number },
  saveBonus = 0,
): { remaining: ActiveEffect[]; freed: ActiveEffect[] } {
  const remaining: ActiveEffect[] = [];
  const freed: ActiveEffect[] = [];

  for (const e of effects) {
    if (e.saveDC && e.saveAbility) {
      const abilityKey = e.saveAbility.toLowerCase() as keyof typeof entityStats;
      const saveRoll = rollD20() + statMod(entityStats[abilityKey] || 10) + saveBonus;
      if (saveRoll >= e.saveDC) {
        freed.push(e);
        continue;
      }
    }
    remaining.push(e);
  }

  return { remaining, freed };
}

/** Tick down durations. Returns effects that are still active. */
export function tickEffects(effects: ActiveEffect[]): ActiveEffect[] {
  return effects
    .map(e => e.turnsRemaining === -1 ? e : { ...e, turnsRemaining: e.turnsRemaining - 1 })
    .filter(e => e.turnsRemaining === -1 || e.turnsRemaining > 0);
}

/** Remove all effects from a given source (concentration broken) */
export function removeBySource(effects: ActiveEffect[], sourceId: string): ActiveEffect[] {
  return effects.filter(e => e.sourceId !== sourceId);
}

/** Generate a unique effect ID */
let effectCounter = 0;
export function makeEffectId(): string {
  return `effect-${Date.now()}-${effectCounter++}`;
}

/** Condition severity hierarchy — higher supersedes lower */
const SEVERITY: Partial<Record<GameCondition, number>> = {
  petrified: 5,
  paralyzed: 4,
  unconscious: 3,
  prone: 1,
  commanded: 2,
  staggered: 1,
};

/**
 * Apply a condition to an entity, respecting stacking rules:
 * - Same condition from same source → refresh duration
 * - Same condition from different source → keep both (only one matters mechanically)
 * - Superseding condition already active → skip with reason
 * Returns { effects, applied, reason }
 */
export function applyCondition(
  effects: ActiveEffect[],
  newEffect: ActiveEffect,
): { effects: ActiveEffect[]; applied: boolean; reason?: string } {
  const targetEffects = effects.filter(e => e.targetId === newEffect.targetId);

  // Check if a superseding condition blocks this one
  const newSeverity = SEVERITY[newEffect.condition] ?? 0;
  for (const existing of targetEffects) {
    const existingSeverity = SEVERITY[existing.condition] ?? 0;
    if (existingSeverity > newSeverity && SKIP_TURN_CONDITIONS.includes(existing.condition)) {
      return { effects, applied: false, reason: `already ${existing.condition}` };
    }
  }

  // Same condition from same source → refresh duration
  const duplicate = targetEffects.find(e => e.condition === newEffect.condition && e.sourceId === newEffect.sourceId);
  if (duplicate) {
    const updated = effects.map(e => e.id === duplicate.id
      ? { ...e, turnsRemaining: Math.max(e.turnsRemaining, newEffect.turnsRemaining) }
      : e
    );
    return { effects: updated, applied: true, reason: 'refreshed' };
  }

  // Same condition from different source → add (both tracked, one mechanically active)
  return { effects: [...effects, newEffect], applied: true };
}
