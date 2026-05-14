/**
 * Combat Resolvers — Pure Functions
 *
 * Player attack and spell damage resolution. No side effects —
 * returns result objects that the hook applies to state.
 */

import { rollD20, rollDice, statMod } from '@/data/dice';
import { spellMeta } from '@/data/spell-meta';
import { getSpellCastType } from '@/data/spell-engine';
import { proficiencyBonus } from '@/data/progression';
import {
  logAttackHit, logAttackMiss, logNat1, logSpellHit, logSpellMiss,
  logHeal, logConditionApplied, logConditionResisted,
  logDeath, logImmune,
} from '@/data/combat-log';
import {
  hasAdvantageAgainst, hasDisadvantageOnAttack,
  getAttackBonus, getExtraDamage,
  applyCondition, makeEffectId, type ActiveEffect, type GameCondition,
} from '@/data/status-effects';
import { bloodMoonDamage, type CombatModifiers } from './combat-modifiers';
import { getFlankingBonus, getRangerOverwatchBonus } from '@/data/zone-synergies';
import type { Character, Enemy, CombatState, BoundaryKey, Zone } from '@/data/game-types';

// ─── Shared Types ────────────────────────────────────────────

export type LogEntry = { message: string; type: 'combat' | 'death' | 'system' | 'loot' | 'levelup' };

export interface AttackResult {
  logs: LogEntry[];
  damage: number;
  isImmune: boolean;
  isVulnerable: boolean;
  isResisted: boolean;
  enemyUpdates: { id: string; hp: number; isAlive: boolean } | null;
  effects: ActiveEffect[];
  effectsChanged: boolean;
}

export interface SpellResult {
  logs: LogEntry[];
  damage: number;
  effects: ActiveEffect[];
  effectsChanged: boolean;
  enemyUpdates: Map<string, { hp: number; isAlive: boolean }>;
  characterUpdates: Map<string, Partial<Character>>;
  boundaries?: Record<BoundaryKey, import('@/data/game-types').BoundaryEffect | null>;
}

// ─── Stagger Helper ──────────────────────────────────────────

function tryStagger(
  targetId: string,
  targetName: string,
  targetCon: number,
  damage: number,
  sourceId: string,
  effects: ActiveEffect[],
): { effects: ActiveEffect[]; logs: LogEntry[] } {
  const logs: LogEntry[] = [];
  const dc = 10 + Math.floor(damage / 10);
  const conSave = rollD20() + statMod(targetCon);
  if (conSave < dc) {
    const effect: ActiveEffect = {
      id: makeEffectId(), name: 'Staggered', condition: 'staggered',
      sourceId, targetId, turnsRemaining: 1,
    };
    const { effects: newEffects, applied } = applyCondition(effects, effect);
    if (applied) {
      logs.push({ message: `${targetName} staggers from the critical weakness! (CON ${conSave} vs DC ${dc})`, type: 'combat' });
      return { effects: newEffects, logs };
    }
  } else {
    logs.push({ message: `${targetName} resists the stagger. (CON ${conSave} vs DC ${dc})`, type: 'combat' });
  }
  return { effects, logs };
}

// ─── Resolve Player Attack ───────────────────────────────────

export function resolvePlayerAttack(
  attacker: Character,
  targetId: string,
  combat: CombatState,
  party: Character[],
  mods: CombatModifiers,
): AttackResult {
  const logs: LogEntry[] = [];
  const target = combat.enemies.find(e => e.id === targetId);
  if (!target || !target.isAlive) {
    return { logs, damage: 0, isImmune: false, isVulnerable: false, isResisted: false, enemyUpdates: null, effects: combat.activeEffects, effectsChanged: false };
  }

  const weapon = attacker.equipment.weapon;
  const strMod_ = statMod(attacker.stats.str), dexMod_ = statMod(attacker.stats.dex);
  const isRanged = weapon.weaponRange === 'ranged';
  const isFinesse = weapon.properties.includes('finesse');
  const mod = isRanged ? dexMod_ : isFinesse ? Math.max(strMod_, dexMod_) : strMod_;
  const prof = proficiencyBonus(attacker.level);
  const toHit = mod + prof;
  const damageType = weapon.damageType;

  const critThreshold = attacker.features.includes('Improved Critical') ? 19 : 20;

  const isReckless = attacker.statusEffects.includes('reckless');
  const targetEffects = combat.activeEffects.filter(e => e.targetId === targetId);
  const targetConditionAdv = hasAdvantageAgainst(targetEffects);
  const attackerEffects = combat.activeEffects.filter(e => e.targetId === attacker.id);
  const attackerDisadv = hasDisadvantageOnAttack(attackerEffects) || (mods.darkness && isRanged);
  const hasAdv = isReckless || targetConditionAdv;

  const blessBonus = getAttackBonus(combat.activeEffects.filter(e => e.targetId === attacker.id));

  // Zone synergy: flanking (+2 melee hit when 2+ allies in target's zone)
  const flankingBonus = !isRanged ? getFlankingBonus(attacker, target.zone as Zone, party) : 0;
  if (flankingBonus > 0) logs.push({ message: `  Flanking bonus — +${flankingBonus} to hit!`, type: 'combat' });

  const r1 = rollD20();
  const r2 = (hasAdv || attackerDisadv) ? rollD20() : r1;
  const attackRoll = hasAdv && !attackerDisadv ? Math.max(r1, r2) : attackerDisadv && !hasAdv ? Math.min(r1, r2) : r1;
  const total = attackRoll + toHit + blessBonus + flankingBonus;
  const isCrit = attackRoll >= critThreshold || (targetConditionAdv && !isRanged);
  const tag = hasAdv ? ' (advantage)' : attackerDisadv ? ' (disadvantage)' : '';

  const effectiveEnemyAC = target.ac + (mods.ironhide ? 2 : 0);

  // Miss
  if (attackRoll === 1) {
    logs.push({ message: logNat1(attacker.name, target.name), type: 'combat' });
    return { logs, damage: 0, isImmune: false, isVulnerable: false, isResisted: false, enemyUpdates: null, effects: combat.activeEffects, effectsChanged: false };
  }
  if (total < effectiveEnemyAC) {
    logs.push({ message: logAttackMiss(attacker.name, target.name, total, effectiveEnemyAC, tag), type: 'combat' });
    return { logs, damage: 0, isImmune: false, isVulnerable: false, isResisted: false, enemyUpdates: null, effects: combat.activeEffects, effectsChanged: false };
  }

  // Hit — calculate damage
  let damage = rollDice(weapon.damage) + mod;
  if (isCrit) damage += rollDice(weapon.damage);

  if (attacker.statusEffects.includes('raging') && !isRanged) damage += attacker.level >= 9 ? 3 : 2;
  if (isCrit && attacker.features.includes('Brutal Critical')) damage += rollDice(weapon.damage);

  if (attacker.classIndex === 'rogue' && attacker.features.includes('Sneak Attack')) {
    const allyInZone = party.some(c => c.isAlive && c.id !== attacker.id && c.zone === target.zone);
    if (isReckless || allyInZone) {
      const sneakDmg = rollDice(`${Math.ceil(attacker.level / 2)}d6`);
      damage += sneakDmg;
      logs.push({ message: `  A blade finds the weak spot — Sneak Attack +${sneakDmg}!`, type: 'combat' });
    }
  }

  if (attacker.features.includes("Hunter's Prey") && target.hp < target.maxHp) damage += rollDice('1d8');
  if (attacker.features.includes('Divine Strike')) damage += rollDice('1d8');
  damage += getExtraDamage(combat.activeEffects.filter(e => e.sourceId === attacker.id), targetId);

  // Zone synergy: ranger overwatch (+2 ranged damage when alone in zone)
  if (isRanged) {
    const overwatchBonus = getRangerOverwatchBonus(attacker, combat.enemies);
    if (overwatchBonus > 0) {
      damage += overwatchBonus;
      logs.push({ message: `  Overwatch position — +${overwatchBonus} damage!`, type: 'combat' });
    }
  }

  damage = bloodMoonDamage(damage, mods);

  // Damage type interactions
  let isImmune = false;
  let isVulnerable = false;
  let isResisted = false;
  if (target.damageImmunities.includes(damageType)) { damage = 0; isImmune = true; }
  else if (target.damageVulnerabilities.includes(damageType)) { damage *= 2; isVulnerable = true; }
  else if (target.damageResistances.some(r => r.includes(damageType))) { damage = Math.floor(damage / 2); isResisted = true; }

  const newHp = Math.max(0, target.hp - damage);
  const isKill = newHp <= 0;

  if (isImmune) { logs.push({ message: logImmune(target.name, damageType), type: 'combat' }); }
  else { logs.push({ message: logAttackHit(attacker.name, target.name, weapon.name, damage, damageType, total, target.ac, isCrit, isKill), type: 'combat' }); }

  if (isKill) logs.push({ message: logDeath(target.name), type: 'death' });

  // Effect updates: wake unconscious, stagger
  let updatedEffects = combat.activeEffects;
  if (damage > 0) {
    const sleepEffect = updatedEffects.find(e => e.targetId === targetId && e.condition === 'unconscious');
    if (sleepEffect) {
      updatedEffects = updatedEffects.filter(e => e.id !== sleepEffect.id);
      logs.push({ message: `${target.name} jolts awake!`, type: 'combat' });
    }
  }
  if (isVulnerable && !isKill) {
    const stagger = tryStagger(targetId, target.name, target.stats.con, damage, attacker.id, updatedEffects);
    updatedEffects = stagger.effects;
    logs.push(...stagger.logs);
  }

  // On-hit weapon effects (magic weapons)
  if (weapon.onHit && damage > 0 && !isKill && !isImmune) {
    const oh = weapon.onHit;
    const triggerFired = oh.trigger === 'hit' || (oh.trigger === 'crit' && isCrit);
    const chanceRoll = oh.chance ? Math.random() < oh.chance : true;

    if (triggerFired && chanceRoll) {
      // Bonus damage vs type
      if (oh.bonusDamage && oh.bonusDamageType) {
        const typeMatch = !oh.bonusVsType || target.type === oh.bonusVsType;
        if (typeMatch) {
          const bonusDmg = rollDice(oh.bonusDamage);
          damage += bonusDmg;
          const updatedHp = Math.max(0, newHp - bonusDmg);
          const bonusKill = updatedHp <= 0;
          logs.push({ message: `  ${weapon.name} blazes — +${bonusDmg} ${oh.bonusDamageType}!`, type: 'combat' });
          if (bonusKill) logs.push({ message: logDeath(target.name), type: 'death' });
          return {
            logs, damage, isImmune: false, isVulnerable: false, isResisted: false,
            enemyUpdates: { id: targetId, hp: updatedHp, isAlive: !bonusKill },
            effects: updatedEffects,
            effectsChanged: updatedEffects !== combat.activeEffects,
          };
        }
      }

      // Condition application
      if (oh.condition) {
        let applied = false;
        if (oh.conditionSave && oh.conditionDC) {
          const saveKey = oh.conditionSave as keyof typeof target.stats;
          const saveRoll = rollD20() + statMod(target.stats[saveKey] || 10);
          if (saveRoll < oh.conditionDC) {
            applied = true;
            logs.push({ message: `  ${weapon.name} strikes true — ${target.name} fails ${oh.conditionSave.toUpperCase()} ${saveRoll} vs DC ${oh.conditionDC}!`, type: 'combat' });
          } else {
            logs.push({ message: `  ${target.name} resists ${weapon.name}'s effect. (${oh.conditionSave.toUpperCase()} ${saveRoll} vs DC ${oh.conditionDC})`, type: 'combat' });
          }
        } else {
          applied = true;
        }

        if (applied) {
          const effect: ActiveEffect = {
            id: makeEffectId(), name: weapon.name, condition: oh.condition as GameCondition,
            sourceId: attacker.id, targetId, turnsRemaining: oh.conditionDuration ?? 1,
            ...(oh.condition === 'burning' ? { damagePerTurn: '1d6', damageType: 'fire' } : {}),
          };
          const { effects: newEffects, applied: wasApplied } = applyCondition(updatedEffects, effect);
          if (wasApplied) {
            updatedEffects = newEffects;
            logs.push({ message: `  ${target.name} is ${oh.condition} by ${weapon.name}!`, type: 'combat' });
          }
        }
      }
    }
  }

  return {
    logs,
    damage,
    isImmune, isVulnerable, isResisted,
    enemyUpdates: { id: targetId, hp: newHp, isAlive: !isKill },
    effects: updatedEffects,
    effectsChanged: updatedEffects !== combat.activeEffects,
  };
}

// ─── Resolve Spell Damage (damage cast type only) ────────────

export function resolveSpellDamage(
  caster: Character,
  spellIndex: string,
  targetId: string,
  combat: CombatState,
  spellSaveDC: number,
  spellAttackBonus: number,
  mods: CombatModifiers,
): AttackResult {
  const logs: LogEntry[] = [];
  const meta = spellMeta[spellIndex];
  const target = combat.enemies.find(e => e.id === targetId);
  if (!target || !meta?.damageType) {
    return { logs, damage: 0, isImmune: false, isVulnerable: false, isResisted: false, enemyUpdates: null, effects: combat.activeEffects, effectsChanged: false };
  }

  const name = spellIndex.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const isCantrip = meta.level === 0;
  const isAutoHit = spellIndex === 'magic-missile';
  let hit = true, isCrit = false;

  if (!isAutoHit) {
    const spellTargetAC = target.ac + (mods.ironhide ? 2 : 0);
    const roll = rollD20(), total = roll + spellAttackBonus;
    isCrit = roll === 20; hit = roll !== 1 && (isCrit || total >= spellTargetAC);
    if (!hit) {
      logs.push({ message: logSpellMiss(caster.name, name, target.name, roll + spellAttackBonus, spellTargetAC), type: 'combat' });
      return { logs, damage: 0, isImmune: false, isVulnerable: false, isResisted: false, enemyUpdates: null, effects: combat.activeEffects, effectsChanged: false };
    }
  }

  // Calculate damage
  let baseDamage = (meta.damage || '1d6').replace(/[×x].*/, '').trim();
  if (isCantrip && caster.level >= 5) {
    const diceMatch = baseDamage.match(/^(\d+)(d\d+.*)$/);
    if (diceMatch) {
      const multiplier = caster.level >= 17 ? 4 : caster.level >= 11 ? 3 : 2;
      baseDamage = `${parseInt(diceMatch[1]) * multiplier}${diceMatch[2]}`;
    }
  }
  let damage = rollDice(baseDamage);
  if (isCrit) damage += rollDice(baseDamage);
  if (spellIndex === 'magic-missile') damage *= 3;

  if (caster.features.includes('Empowered Evocation') && meta.school === 'evocation') {
    damage += statMod(caster.stats.int);
  }

  damage += getExtraDamage(combat.activeEffects.filter(e => e.sourceId === caster.id), targetId);

  // Zone synergy: ranger overwatch (+2 spell damage when alone in zone)
  const spellOverwatch = getRangerOverwatchBonus(caster, combat.enemies);
  if (spellOverwatch > 0) {
    damage += spellOverwatch;
    logs.push({ message: `  Overwatch position — +${spellOverwatch} damage!`, type: 'combat' });
  }

  damage = bloodMoonDamage(damage, mods);

  let isImmune = false;
  let isVulnerable = false;
  let isResisted = false;
  if (target.damageImmunities.includes(meta.damageType)) { damage = 0; isImmune = true; }
  else if (target.damageVulnerabilities.includes(meta.damageType)) { damage *= 2; isVulnerable = true; }
  else if (meta.damageType && target.damageResistances.some(r => r.includes(meta.damageType!))) { damage = Math.floor(damage / 2); isResisted = true; }

  const newHp = Math.max(0, target.hp - damage);
  const isKill = newHp <= 0;
  if (isImmune) { logs.push({ message: logImmune(target.name, meta.damageType!), type: 'combat' }); }
  else { logs.push({ message: logSpellHit(caster.name, name, target.name, damage, meta.damageType, isCrit, isKill), type: 'combat' }); }
  if (isKill) logs.push({ message: logDeath(target.name), type: 'death' });

  // Stagger on vulnerability
  let updatedEffects = combat.activeEffects;
  if (isVulnerable && !isKill) {
    const stagger = tryStagger(targetId, target.name, target.stats.con, damage, caster.id, updatedEffects);
    updatedEffects = stagger.effects;
    logs.push(...stagger.logs);
  }

  return {
    logs,
    damage,
    isImmune, isVulnerable, isResisted,
    enemyUpdates: { id: targetId, hp: newHp, isAlive: !isKill },
    effects: updatedEffects,
    effectsChanged: updatedEffects !== combat.activeEffects,
  };
}
