/**
 * Enemy Turn Logic
 *
 * Extracted from useCombat. Receives a context object with state + callbacks.
 * Handles: DoT, status skip, movement, target selection, attack/breath resolution.
 *
 * State threading: combat changes are accumulated on a single `workingCombat`
 * object. Every setCombat / advanceTurn call uses workingCombat — never the
 * stale turn-start `combat` snapshot — so mid-turn changes (enemy movement,
 * applied conditions, woken sleepers, broken concentration) compound instead
 * of clobbering each other.
 */

import { rollD20, rollDice, statMod } from '@/data/dice';
import {
  logAttackHit, logAttackMiss, logNat1,
  logConditionApplied, logConditionResisted, logConditionFree,
  logBreathWeapon, logDot, logMove, logBoundaryCross, logDeath,
} from '@/data/combat-log';
import { zoneLabel, movableZones } from '@/data/zones';
import {
  shouldSkipTurn, hasAdvantageAgainst, hasDisadvantageOnAttack,
  getACBonus, resolveEndOfTurnSaves,
  applyCondition, makeEffectId, type ActiveEffect, type GameCondition,
} from '@/data/status-effects';
import { bloodMoonDamage, type CombatModifiers } from './combat-modifiers';
import { getClericAuraBonus } from '@/data/zone-synergies';
import { emitCombatFeedback, delay } from '@/data/combat-events';
import type { Zone, CombatState, Character, Enemy, BoundaryKey } from '@/data/game-types';

function getBoundaryKey(from: Zone, to: Zone): BoundaryKey | null {
  const low = Math.min(from, to);
  const high = Math.max(from, to);
  if (high - low !== 1) return null;
  return `${low}|${high}` as BoundaryKey;
}

export interface EnemyTurnContext {
  combat: CombatState;
  party: Character[];
  stats: import('@/data/game-types').RunStats;
  mods: CombatModifiers;
  addLog: (message: string, type: 'combat' | 'death' | 'system' | 'loot' | 'levelup') => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  updateStats: (updates: Partial<import('@/data/game-types').RunStats>) => void;
  setCombat: (combat: CombatState | null) => void;
  setPhase: (phase: import('@/data/game-types').GamePhase) => void;
  advanceTurn: (combatOverride?: CombatState | null, killedIds?: string[]) => void;
  abortSignal?: { cancelled: boolean };
}

export async function executeEnemyTurn(enemy: Enemy, ctx: EnemyTurnContext) {
  const abort = ctx.abortSignal || { cancelled: false };
  const { combat, party, mods, addLog, updateCharacter, updateStats, setCombat, setPhase, advanceTurn } = ctx;

  // Single source of truth for combat mutations this turn.
  let workingCombat: CombatState = combat;

  const aliveChars = party.filter(c => c.isAlive);
  if (aliveChars.length === 0) { addLog('Total Party Kill!', 'death'); setPhase('game-over'); return; }

  // ─── Status skip check ──────────────────────────────────
  const enemyEffects = combat.activeEffects.filter(e => e.targetId === enemy.id);
  if (shouldSkipTurn(enemyEffects)) {
    const effectName = enemyEffects.find(e => ['paralyzed', 'unconscious', 'commanded', 'staggered'].includes(e.condition))?.name || 'status effect';
    addLog(`${enemy.name} is ${effectName === 'Command' ? 'commanded' : effectName === 'Sleep' ? 'asleep' : effectName === 'Staggered' ? 'staggered' : 'paralyzed'} — skips turn.`, 'system');
    const { freed } = resolveEndOfTurnSaves(enemyEffects, enemy.stats);
    if (freed.length > 0) {
      const newEffects = workingCombat.activeEffects.filter(e => !freed.some(f => f.id === e.id));
      freed.forEach(f => addLog(logConditionFree(enemy.name, f.name), 'combat'));
      workingCombat = { ...workingCombat, activeEffects: newEffects };
      setCombat(workingCombat);
    }
    advanceTurn(workingCombat);
    return;
  }

  // ─── Turn-start DoT ─────────────────────────────────────
  const dotEffects = combat.activeEffects.filter(e => e.damagePerTurn);
  for (const dot of dotEffects) {
    if (dot.condition === 'spiritGuarded') {
      const caster = party.find(c => c.id === dot.sourceId);
      if (!caster || !caster.isAlive || enemy.zone !== caster.zone) continue;
    }
    if (dot.condition !== 'spiritGuarded' && dot.targetId !== enemy.id) continue;

    let dmg = rollDice(dot.damagePerTurn!);
    if (dot.saveDC && dot.saveAbility) {
      const saveKey = dot.saveAbility as keyof typeof enemy.stats;
      const saveRoll = rollD20() + statMod(enemy.stats[saveKey] || 10);
      if (saveRoll >= dot.saveDC) dmg = Math.floor(dmg / 2);
      addLog(logDot(enemy.name, dot.name, dmg, dot.damageType || 'fire', saveRoll >= dot.saveDC), 'combat');
    } else {
      addLog(logDot(enemy.name, dot.name, dmg, dot.damageType || 'fire'), 'combat');
    }
    const newHp = Math.max(0, enemy.hp - dmg);
    workingCombat = {
      ...workingCombat,
      enemies: workingCombat.enemies.map(e => e.id === enemy.id ? { ...e, hp: newHp, isAlive: newHp > 0 } : e),
    };
    updateStats({ totalDamageDealt: ctx.stats.totalDamageDealt + dmg });
    if (newHp <= 0) {
      addLog(logDeath(enemy.name, dot.name), 'death');
      updateStats({ enemiesKilled: ctx.stats.enemiesKilled + 1 });
      setCombat(workingCombat);
      advanceTurn(workingCombat);
      return;
    }
  }

  // ─── Behavior ───────────────────────────────────────────
  // Pause to let active turn pulse play
  await delay(300);
  if (abort.cancelled) return;

  const behavior = enemy.behavior || 'melee-aggro';
  let currentEnemy = workingCombat.enemies.find(e => e.id === enemy.id) || enemy;

  if (behavior === 'passive') { advanceTurn(workingCombat); return; }

  const sameZone = aliveChars.filter(c => c.zone === currentEnemy.zone);
  const nearest = aliveChars.reduce((best, c) =>
    Math.abs(c.zone - currentEnemy.zone) < Math.abs(best.zone - currentEnemy.zone) ? c : best
  );

  // ─── Movement ───────────────────────────────────────────
  const moveEffects = combat.activeEffects.filter(e => e.targetId === enemy.id);
  const isFrozen = moveEffects.some(e => e.condition === 'frozen');
  const frightOf = moveEffects.find(e => e.condition === 'frightened');

  if (behavior === 'melee-aggro' && sameZone.length === 0 && !isFrozen && !mods.unstableGround) {
    const moves = movableZones(currentEnemy.zone as Zone);
    const targetZone = nearest.zone;
    let bestMove: Zone | null = moves.reduce((best, z) =>
      Math.abs(z - targetZone) < Math.abs(best - targetZone) ? z : best, moves[0]);

    if (frightOf && bestMove) {
      const source = party.find(c => c.id === frightOf.sourceId);
      if (source && Math.abs(bestMove - source.zone) < Math.abs(currentEnemy.zone - source.zone)) {
        addLog(`${currentEnemy.name} recoils in terror — can't approach!`, 'combat');
        bestMove = null;
      }
    }

    if (bestMove) {
      const bKey = getBoundaryKey(currentEnemy.zone as Zone, bestMove);
      const bEffect = bKey ? workingCombat.boundaries[bKey] : null;

      if (bEffect?.blocksMovement) {
        addLog(`${currentEnemy.name} is blocked by ${bEffect.name} — impassable!`, 'combat');
      } else {
        currentEnemy = { ...currentEnemy, zone: bestMove };
        workingCombat = { ...workingCombat, enemies: workingCombat.enemies.map(e => e.id === currentEnemy.id ? currentEnemy : e) };
        addLog(logMove(currentEnemy.name, zoneLabel(bestMove)), 'combat');

        if (bEffect?.damage) {
          let dmg = rollDice(bEffect.damage);
          if (bEffect.saveDC && bEffect.saveAbility) {
            const sk = bEffect.saveAbility as keyof typeof currentEnemy.stats;
            const sr = rollD20() + statMod(currentEnemy.stats[sk] || 10);
            if (sr >= bEffect.saveDC) dmg = Math.floor(dmg / 2);
            addLog(logBoundaryCross(currentEnemy.name, bEffect.name, dmg, bEffect.damageType || 'fire', sr >= bEffect.saveDC), 'combat');
          } else {
            addLog(logBoundaryCross(currentEnemy.name, bEffect.name, dmg, bEffect.damageType || 'fire', false), 'combat');
          }
          const newHp = Math.max(0, currentEnemy.hp - dmg);
          currentEnemy = { ...currentEnemy, hp: newHp, isAlive: newHp > 0 };
          workingCombat = { ...workingCombat, enemies: workingCombat.enemies.map(e => e.id === currentEnemy.id ? currentEnemy : e) };
          if (newHp <= 0) {
            addLog(logDeath(currentEnemy.name, bEffect.name), 'death');
            setCombat(workingCombat);
            advanceTurn(workingCombat);
            return;
          }
        }
      }
    }
  }

  // ─── Target + action selection ──────────────────────────
  // Pause to let movement animation play
  await delay(300);
  if (abort.cancelled) return;

  const sameZoneAfterMove = aliveChars.filter(c => c.zone === currentEnemy.zone);
  const target = sameZoneAfterMove.length > 0 ? sameZoneAfterMove[0] : nearest;
  const inMeleeRange = target.zone === currentEnemy.zone;

  // Filter actions by what can actually reach the target
  const meleeActions = currentEnemy.actions.filter(a => a.reach === 'melee');
  const rangedActions = currentEnemy.actions.filter(a => a.reach === 'any');
  const dcAction = currentEnemy.actions.find(a => a.saveDC && a.damage);
  const condAction = currentEnemy.actions.find(a => a.conditionDC && !a.saveDC);
  const reachableActions = inMeleeRange
    ? currentEnemy.actions  // In same zone: all actions available
    : currentEnemy.actions.filter(a => a.reach !== 'melee');  // Different zone: no melee

  let action;

  if (behavior === 'caster') {
    action = dcAction || condAction
      || rangedActions[0]
      || (inMeleeRange ? meleeActions[0] : undefined);
  } else if (behavior === 'flexible') {
    action = dcAction
      || (inMeleeRange ? meleeActions[0] : rangedActions[0])
      || reachableActions[0];
  } else {
    // melee-aggro
    action = inMeleeRange
      ? (meleeActions[0] || condAction || reachableActions[0])
      : (dcAction || rangedActions[0]);
  }

  const killedThisTurn: string[] = [];

  if (!action?.toHit && !action?.saveDC) {
    advanceTurn(workingCombat);
    return;
  }

  // ─── Save-based damage (breath weapons) ─────────────────
  if (action.saveDC && !action.toHit) {
    const saveAbility = (action.saveType || 'dex') as keyof typeof target.stats;
    const aura = getClericAuraBonus(target.id, target.zone, party);
    const saveRoll = rollD20() + statMod(target.stats[saveAbility] || 10) + aura;
    const passed = saveRoll >= action.saveDC;
    let damage = action.damage ? rollDice(action.damage) : 0;
    damage = bloodMoonDamage(damage, mods);
    if (passed && action.saveSuccess === 'half') damage = Math.floor(damage / 2);
    else if (passed && action.saveSuccess === 'none') damage = 0;

    addLog(logBreathWeapon(currentEnemy.name, action.name, target.name, damage, action.damageType || 'fire', passed, `${saveAbility.toUpperCase()} ${saveRoll} vs DC ${action.saveDC}`), 'combat');
    if (damage > 0) emitCombatFeedback({ type: 'damage', targetId: target.id, value: damage, damageType: action.damageType || 'fire' });
    const newHp = Math.max(0, target.hp - damage);
    updateCharacter(target.id, { hp: newHp, isAlive: newHp > 0 });
    updateStats({ totalDamageTaken: ctx.stats.totalDamageTaken + damage });
    if (newHp <= 0) {
      killedThisTurn.push(target.id);
      addLog(logDeath(target.name), 'death');
      updateStats({ charactersLost: ctx.stats.charactersLost + 1 });
      if (party.filter(c => c.isAlive && c.id !== target.id).length === 0) {
        addLog('Total Party Kill!', 'death'); setPhase('game-over'); return;
      }
    }
    advanceTurn(workingCombat, killedThisTurn);
    return;
  }

  // Emit attack swing before resolving
  emitCombatFeedback({ type: 'attack-swing', targetId: target.id, attackerId: currentEnemy.id, attackerZone: currentEnemy.zone, targetZone: target.zone });
  await delay(250);
  if (abort.cancelled) return;

  // ─── Melee/ranged attack ────────────────────────────────
  const targetEffectsForAtk = workingCombat.activeEffects.filter(e => e.targetId === target.id);
  const attackerEffectsForAtk = workingCombat.activeEffects.filter(e => e.targetId === currentEnemy.id);
  const isDodging = workingCombat.dodging.includes(target.id);
  const targetIsReckless = target.statusEffects?.includes('reckless');
  const targetConditionAdv = hasAdvantageAgainst(targetEffectsForAtk);
  const enemyRangedDisadv = mods.darkness && action.reach === 'any';
  const enemyHasDisadvantage = hasDisadvantageOnAttack(attackerEffectsForAtk) || enemyRangedDisadv;
  const hasAdv = targetConditionAdv || targetIsReckless;
  const hasDisadv = isDodging || enemyHasDisadvantage;

  const targetACBonus = getACBonus(targetEffectsForAtk);
  const effectiveAC = target.ac + targetACBonus;

  const r1 = rollD20(), r2 = (hasAdv || hasDisadv) ? rollD20() : r1;
  const attackRoll = hasAdv && !hasDisadv ? Math.max(r1, r2) : hasDisadv && !hasAdv ? Math.min(r1, r2) : r1;
  const total = attackRoll + (action.toHit || 0);
  const isCrit = attackRoll === 20 || (targetConditionAdv && action.reach === 'melee');
  const tag = hasAdv ? ' (advantage)' : hasDisadv ? ' (disadvantage)' : '';

  if (attackRoll === 1 || total < effectiveAC) {
    addLog(attackRoll === 1 ? logNat1(currentEnemy.name, target.name) : logAttackMiss(currentEnemy.name, target.name, total, effectiveAC, tag), 'combat');
    emitCombatFeedback({ type: 'miss', targetId: target.id });
  } else {
    let damage = action.damage ? rollDice(action.damage) : 0;
    if (isCrit) damage = Math.floor(damage * 1.5);
    damage = bloodMoonDamage(damage, mods);
    const newHp = Math.max(0, target.hp - damage);
    const isKill = newHp <= 0;
    addLog(logAttackHit(currentEnemy.name, target.name, action.name, damage, action.damageType || 'slashing', total, effectiveAC, isCrit, isKill), 'combat');
    emitCombatFeedback({ type: isCrit ? 'crit' : 'damage', targetId: target.id, value: damage, damageType: action.damageType || 'slashing' });
    emitCombatFeedback({ type: 'impact', targetId: target.id, damageType: action.damageType || 'slashing' });
    updateCharacter(target.id, { hp: newHp, isAlive: !isKill });
    updateStats({ totalDamageTaken: ctx.stats.totalDamageTaken + damage });

    // Condition on hit
    if (action.conditionDC && action.conditionSave && action.conditionApplied && !isKill) {
      const saveAbility = action.conditionSave as keyof typeof target.stats;
      const condAura = getClericAuraBonus(target.id, target.zone, party);
      const saveRoll = rollD20() + statMod(target.stats[saveAbility] || 10) + condAura;
      const saveInfo = `${action.conditionSave!.toUpperCase()} ${saveRoll} vs DC ${action.conditionDC}`;
      if (saveRoll < action.conditionDC) {
        const condition = action.conditionApplied as GameCondition;
        const effect: ActiveEffect = {
          id: makeEffectId(), name: action.name, condition,
          sourceId: currentEnemy.id, targetId: target.id,
          turnsRemaining: condition === 'prone' ? 1 : condition === 'poisoned' ? 3 : -1,
          ...(condition !== 'prone' && condition !== 'poisoned' ? { saveDC: action.conditionDC, saveAbility: action.conditionSave } : {}),
        };
        const { effects: newEffects, applied } = applyCondition(workingCombat.activeEffects, effect);
        if (applied) {
          workingCombat = { ...workingCombat, activeEffects: newEffects };
          setCombat(workingCombat);
          addLog(logConditionApplied(target.name, condition, saveInfo), 'combat');
        }
      } else {
        addLog(logConditionResisted(target.name, action.conditionApplied, saveInfo), 'combat');
      }
    }

    // Wake unconscious
    if (damage > 0) {
      const sleepEffect = workingCombat.activeEffects.find(e => e.targetId === target.id && e.condition === 'unconscious');
      if (sleepEffect) {
        workingCombat = { ...workingCombat, activeEffects: workingCombat.activeEffects.filter(e => e.id !== sleepEffect.id) };
        setCombat(workingCombat);
        addLog(`${target.name} jolts awake!`, 'combat');
      }
    }

    // Concentration breaking
    if (damage > 0) {
      const concEffects = workingCombat.activeEffects.filter(e => e.sourceId === target.id && e.turnsRemaining === -1);
      if (concEffects.length > 0 && target.isAlive) {
        const dc = Math.max(10, Math.floor(damage / 2));
        const conSave = rollD20() + statMod(target.stats.con);
        if (conSave < dc) {
          workingCombat = { ...workingCombat, activeEffects: workingCombat.activeEffects.filter(e => e.sourceId !== target.id || e.turnsRemaining !== -1) };
          addLog(`${target.name}'s concentration shatters! (CON ${conSave} vs DC ${dc})`, 'combat');
          setCombat(workingCombat);
        }
      }
    }

    if (newHp <= 0) {
      killedThisTurn.push(target.id);
      addLog(logDeath(target.name), 'death');
      emitCombatFeedback({ type: 'kill', targetId: target.id, isPartyMember: true });
      updateStats({ charactersLost: ctx.stats.charactersLost + 1 });
      if (party.filter(c => c.isAlive && c.id !== target.id).length === 0) {
        addLog('Total Party Kill!', 'death'); setPhase('game-over'); return;
      }
    }
  }

  // Pause to let damage/impact animations play
  await delay(400);
  if (abort.cancelled) return;

  advanceTurn(workingCombat, killedThisTurn);
}
