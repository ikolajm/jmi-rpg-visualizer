'use client';

import { useEffect } from 'react';
import { useGame } from '@/components/providers/GameProvider';
import { rollD20, rollDice, statMod } from '@/data/dice';
import { spellMeta } from '@/data/spell-meta';
import { getSpellCastType } from '@/data/spell-engine';
import { proficiencyBonus } from '@/data/progression';
import {
  logAttackHit, logAttackMiss, logNat1, logSpellHit, logSpellMiss,
  logHeal, logConditionApplied, logConditionResisted, logConditionFree,
  logBreathWeapon, logDot, logMove, logBoundaryCross, logDeath, logImmune,
} from '@/data/combat-log';
import { zoneLabel, movableZones } from '@/data/zones';
import {
  shouldSkipTurn, SKIP_TURN_CONDITIONS, hasAdvantageAgainst, hasDisadvantageOnAttack,
  getAttackBonus, getExtraDamage, getACBonus, resolveEndOfTurnSaves, tickEffects,
  removeBySource, applyCondition, makeEffectId, type ActiveEffect, type GameCondition,
} from '@/data/status-effects';
import type { Zone, CombatState, Enemy, BoundaryKey } from '@/data/game-types';

/** Get the boundary key between two adjacent zones, or null if not adjacent */
function getBoundaryKey(from: Zone, to: Zone): BoundaryKey | null {
  const low = Math.min(from, to);
  const high = Math.max(from, to);
  if (high - low !== 1) return null;
  return `${low}|${high}` as BoundaryKey;
}

interface UseCombatOptions {
  onVictory?: (defeatedEnemies: Enemy[]) => void;
}

export function useCombat(options: UseCombatOptions = {}) {
  const { state, setCombat, setPhase, addLog, updateCharacter, updateStats } = useGame();

  const currentEntity = state.combat?.initiativeOrder[state.combat.currentTurnIndex];
  const isPlayerTurn = currentEntity?.type === 'character';
  const activeCharacter = isPlayerTurn ? state.party.find(c => c.id === currentEntity.id) : null;

  // ─── Turn Advancement ──────────────────────────────────────

  function advanceTurn(combatOverride?: CombatState | null, killedIds?: string[]) {
    const combat = combatOverride || state.combat;
    if (!combat) return;

    if (combat.enemies.every(e => !e.isAlive)) {
      addLog('All enemies defeated! Victory!', 'system');
      updateStats({ roomsCleared: state.stats.roomsCleared + 1 });
      const defeated = [...combat.enemies];
      setCombat(null);
      if (options.onVictory) {
        options.onVictory(defeated);
      } else {
        setPhase('room-preview');
      }
      return;
    }

    const dead = new Set(killedIds || []);

    let nextIndex = (combat.currentTurnIndex + 1) % combat.initiativeOrder.length;
    let attempts = 0;
    while (attempts < combat.initiativeOrder.length) {
      const next = combat.initiativeOrder[nextIndex];
      if (dead.has(next.id)) { nextIndex = (nextIndex + 1) % combat.initiativeOrder.length; attempts++; continue; }
      const isAlive = next.type === 'character'
        ? state.party.find(c => c.id === next.id)?.isAlive
        : combat.enemies.find(e => e.id === next.id)?.isAlive;
      if (isAlive) break;
      nextIndex = (nextIndex + 1) % combat.initiativeOrder.length;
      attempts++;
    }

    const nextEntity = combat.initiativeOrder[nextIndex];
    const newDodging = nextEntity?.type === 'character'
      ? combat.dodging.filter(id => id !== nextEntity.id) : combat.dodging;

    // Clean up effects from dead entities + tick durations
    let tickedEffects = combat.activeEffects;

    // Remove effects sourced by dead entities (concentration drops on death)
    const deadCharIds = state.party.filter(c => !c.isAlive).map(c => c.id);
    const deadEnemyIds = combat.enemies.filter(e => !e.isAlive).map(e => e.id);
    for (const id of [...deadCharIds, ...deadEnemyIds, ...(killedIds || [])]) {
      tickedEffects = cleanupDeadEffects(tickedEffects, id);
    }
    // Also remove effects targeting dead entities
    tickedEffects = tickedEffects.filter(e => {
      const targetAlive = state.party.some(c => c.id === e.targetId && c.isAlive)
        || combat.enemies.some(en => en.id === e.targetId && en.isAlive);
      return targetAlive;
    });

    tickedEffects = tickEffects(tickedEffects);

    // Clean up boundaries from dead sources
    let cleanedBoundaries = { ...combat.boundaries };
    const allDeadIds = new Set([...deadCharIds, ...deadEnemyIds, ...(killedIds || [])]);
    for (const key of ['1|2', '2|3'] as BoundaryKey[]) {
      if (cleanedBoundaries[key] && allDeadIds.has(cleanedBoundaries[key]!.sourceId)) {
        cleanedBoundaries[key] = null;
      }
    }

    // Clear reckless from the entity whose turn just ended (current entity)
    const currentId = combat.initiativeOrder[combat.currentTurnIndex]?.id;
    if (currentId) {
      // Remove 'reckless' from the character's statusEffects
      const recklessChar = state.party.find(c => c.id === currentId && c.statusEffects.includes('reckless'));
      if (recklessChar) {
        updateCharacter(currentId, { statusEffects: recklessChar.statusEffects.filter(s => s !== ('reckless')) });
      }
    }

    setCombat({
      ...combat,
      currentTurnIndex: nextIndex,
      roundNumber: nextIndex <= combat.currentTurnIndex ? combat.roundNumber + 1 : combat.roundNumber,
      turnResources: { actionUsed: false, bonusActionUsed: false, movementUsed: false },
      dodging: newDodging,
      activeEffects: tickedEffects,
      boundaries: cleanedBoundaries,
    });
  }

  /** Remove all concentration effects sourced by a dead entity */
  function cleanupDeadEffects(effects: ActiveEffect[], deadId: string): ActiveEffect[] {
    return removeBySource(effects, deadId);
  }

  function finishAction(combatUpdate: Partial<CombatState>) {
    if (!state.combat) return;
    const updated = { ...state.combat, ...combatUpdate } as CombatState;
    if (updated.turnResources.actionUsed && updated.turnResources.movementUsed) advanceTurn(updated);
    else setCombat(updated);
  }

  // ─── Player Turn Start: DoT + Status Check ─────────────────

  useEffect(() => {
    if (!state.combat || state.phase !== 'combat') return;
    const current = state.combat.initiativeOrder[state.combat.currentTurnIndex];
    if (!current || current.type !== 'character') return;
    const char = state.party.find(c => c.id === current.id);
    if (!char || !char.isAlive) return;

    const charEffects = state.combat.activeEffects.filter(e => e.targetId === current.id);

    // DoT at turn start (burning, poison DoT on player)
    const dotEffects = charEffects.filter(e => e.damagePerTurn);
    if (dotEffects.length > 0) {
      for (const dot of dotEffects) {
        const dmg = rollDice(dot.damagePerTurn!);
        const newHp = Math.max(0, char.hp - dmg);
        updateCharacter(char.id, { hp: newHp, isAlive: newHp > 0 });
        updateStats({ totalDamageTaken: state.stats.totalDamageTaken + dmg });
        addLog(logDot(char.name, dot.name, dmg, dot.damageType || 'fire'), 'combat');
        if (newHp <= 0) {
          addLog(logDeath(char.name), 'death');
          updateStats({ charactersLost: state.stats.charactersLost + 1 });
          if (state.party.filter(c => c.isAlive && c.id !== char.id).length === 0) {
            addLog('Total Party Kill!', 'death'); setPhase('game-over'); return;
          }
        }
      }
    }

    // Skip turn if disabled
    if (!shouldSkipTurn(charEffects)) return;

    const t = setTimeout(() => {
      const disabling = charEffects.find(e => SKIP_TURN_CONDITIONS.includes(e.condition));
      const label = disabling?.condition || 'status';
      addLog(`${char.name} is ${label} — skips turn.`, 'system');
      const { remaining, freed } = resolveEndOfTurnSaves(charEffects, char.stats);
      if (freed.length > 0) {
        const newEffects = state.combat!.activeEffects.filter(e => !freed.some(f => f.id === e.id));
        freed.forEach(f => addLog(logConditionFree(char.name, f.name), 'combat'));
        setCombat({ ...state.combat!, activeEffects: newEffects });
      }
      advanceTurn();
    }, 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.combat?.currentTurnIndex, state.combat?.roundNumber]);

  // ─── Enemy Turn Effect ──────────────────────────────────────

  useEffect(() => {
    if (!state.combat || state.phase !== 'combat') return;
    const current = state.combat.initiativeOrder[state.combat.currentTurnIndex];
    if (!current || current.type !== 'enemy') return;

    const enemy = state.combat.enemies.find(e => e.id === current.id);
    if (!enemy || !enemy.isAlive) {
      const t = setTimeout(() => advanceTurn(), 100);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      const aliveChars = state.party.filter(c => c.isAlive);
      if (aliveChars.length === 0) { addLog('Total Party Kill!', 'death'); setPhase('game-over'); return; }

      // Check if enemy is disabled by status effects
      const enemyEffects = state.combat!.activeEffects.filter(e => e.targetId === enemy.id);
      if (shouldSkipTurn(enemyEffects)) {
        const effectName = enemyEffects.find(e => ['paralyzed', 'unconscious', 'commanded'].includes(e.condition))?.name || 'status effect';
        addLog(`${enemy.name} is ${effectName === 'Command' ? 'commanded' : effectName === 'Sleep' ? 'asleep' : 'paralyzed'} — skips turn.`, 'system');
        const { remaining, freed } = resolveEndOfTurnSaves(enemyEffects, enemy.stats);
        if (freed.length > 0) {
          const newEffects = state.combat!.activeEffects.filter(e => !freed.some(f => f.id === e.id));
          freed.forEach(f => addLog(logConditionFree(enemy.name, f.name), 'combat'));
          setCombat({ ...state.combat!, activeEffects: newEffects });
        }
        advanceTurn();
        return;
      }

      // Turn-start DoT: Spirit Guardians (zone aura), burning, poison DoT, etc.
      let updatedEnemiesForSG = state.combat!.enemies;
      const dotEffects = state.combat!.activeEffects.filter(e => e.damagePerTurn);
      for (const dot of dotEffects) {
        // Spirit Guardians: damages enemies in caster's zone
        if (dot.condition === 'spiritGuarded') {
          const caster = state.party.find(c => c.id === dot.sourceId);
          if (!caster || !caster.isAlive || enemy.zone !== caster.zone) continue;
        }
        // Generic DoT on this enemy (burning, etc.)
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
        updatedEnemiesForSG = updatedEnemiesForSG.map(e => e.id === enemy.id ? { ...e, hp: newHp, isAlive: newHp > 0 } : e);
        updateStats({ totalDamageDealt: state.stats.totalDamageDealt + dmg });
        if (newHp <= 0) {
          addLog(logDeath(enemy.name, dot.name), 'death');
          updateStats({ enemiesKilled: state.stats.enemiesKilled + 1 });
          setCombat({ ...state.combat!, enemies: updatedEnemiesForSG });
          advanceTurn();
          return;
        }
      }

      const behavior = enemy.behavior || 'melee-aggro';
      let currentEnemy = updatedEnemiesForSG.find(e => e.id === enemy.id) || enemy;
      let updatedEnemies = updatedEnemiesForSG;

      // Passive enemies skip their turn
      if (behavior === 'passive') { advanceTurn(); return; }

      const sameZone = aliveChars.filter(c => c.zone === currentEnemy.zone);
      const nearest = aliveChars.reduce((best, c) =>
        Math.abs(c.zone - currentEnemy.zone) < Math.abs(best.zone - currentEnemy.zone) ? c : best
      );

      // Frozen enemies can't move
      const moveEffects = state.combat!.activeEffects.filter(e => e.targetId === enemy.id);
      const isFrozen = moveEffects.some(e => e.condition === 'frozen');
      // Frightened enemies can't move toward source
      const frightOf = moveEffects.find(e => e.condition === 'frightened');

      // Zone movement for melee-aggro/boss: move toward target if not in same zone
      if ((behavior === 'melee-aggro' || behavior === 'boss') && sameZone.length === 0 && !isFrozen) {
        const moves = movableZones(currentEnemy.zone as Zone);
        const targetZone = nearest.zone;
        let bestMove: Zone | null = moves.reduce((best, z) =>
          Math.abs(z - targetZone) < Math.abs(best - targetZone) ? z : best, moves[0]);

        // Frightened: can't move toward the source of fear
        if (frightOf && bestMove) {
          const source = state.party.find(c => c.id === frightOf.sourceId);
          if (source && Math.abs(bestMove - source.zone) < Math.abs(currentEnemy.zone - source.zone)) {
            addLog(`${currentEnemy.name} recoils in terror — can't approach!`, 'combat');
            bestMove = null;
          }
        }

        if (bestMove) {
          // Check boundary before moving
          const bKey = getBoundaryKey(currentEnemy.zone as Zone, bestMove);
          const bEffect = bKey ? state.combat!.boundaries[bKey] : null;

          if (bEffect?.blocksMovement) {
            addLog(`${currentEnemy.name} is blocked by ${bEffect.name} — impassable!`, 'combat');
          } else {
            currentEnemy = { ...currentEnemy, zone: bestMove };
            updatedEnemies = updatedEnemies.map(e => e.id === currentEnemy.id ? currentEnemy : e);
            addLog(logMove(currentEnemy.name, zoneLabel(bestMove)), 'combat');

            // Boundary damage on crossing
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
              updatedEnemies = updatedEnemies.map(e => e.id === currentEnemy.id ? currentEnemy : e);
              updateStats({ totalDamageDealt: state.stats.totalDamageDealt + dmg });
              if (newHp <= 0) {
                addLog(logDeath(currentEnemy.name, bEffect.name), 'death');
                updateStats({ enemiesKilled: state.stats.enemiesKilled + 1 });
                setCombat({ ...state.combat!, enemies: updatedEnemies });
                advanceTurn(); return;
              }
            }
          }
        }
      }

      // Pick target and action based on behavior
      const sameZoneAfterMove = aliveChars.filter(c => c.zone === currentEnemy.zone);
      const target = sameZoneAfterMove.length > 0 ? sameZoneAfterMove[0] : nearest;
      let action;

      // Priority: DC actions (breath weapons, gaze) > ranged > melee
      const dcAction = currentEnemy.actions.find(a => a.saveDC && a.damage);
      const condAction = currentEnemy.actions.find(a => a.conditionDC && !a.saveDC);

      if (behavior === 'caster' || behavior === 'boss-caster' || behavior === 'boss') {
        // Lead with DC damage (breath weapon), then DC condition, then ranged, then melee
        action = dcAction || condAction
          || currentEnemy.actions.find(a => a.reach === 'any')
          || currentEnemy.actions[0];
      } else if (behavior === 'flexible') {
        action = dcAction
          || ((target.zone === currentEnemy.zone)
            ? currentEnemy.actions.find(a => a.reach === 'melee') || currentEnemy.actions[0]
            : currentEnemy.actions.find(a => a.reach === 'any') || currentEnemy.actions[0]);
      } else {
        // melee-aggro: prefer melee, but use DC action if available and not in melee range
        action = (target.zone === currentEnemy.zone)
          ? currentEnemy.actions.find(a => a.reach === 'melee') || condAction || currentEnemy.actions[0]
          : dcAction || currentEnemy.actions.find(a => a.reach === 'any') || currentEnemy.actions[0];
      }

      let killedThisTurn: string[] = [];

      // If action has no toHit AND no saveDC, skip (utility ability like Invisibility)
      if (!action?.toHit && !action?.saveDC) {
        if (updatedEnemies !== state.combat!.enemies) {
          setCombat({ ...state.combat!, enemies: updatedEnemies });
        }
        advanceTurn(); return;
      }

      // Save-based damage (breath weapons, AoE) — resolve separately
      if (action.saveDC && !action.toHit) {
        const saveAbility = (action.saveType || 'dex') as keyof typeof target.stats;
        const saveRoll = rollD20() + statMod(target.stats[saveAbility] || 10);
        const passed = saveRoll >= action.saveDC;
        let damage = action.damage ? rollDice(action.damage) : 0;
        if (passed && action.saveSuccess === 'half') damage = Math.floor(damage / 2);
        else if (passed && action.saveSuccess === 'none') damage = 0;

        addLog(logBreathWeapon(currentEnemy.name, action.name, target.name, damage, action.damageType || 'fire', passed, `${saveAbility.toUpperCase()} ${saveRoll} vs DC ${action.saveDC}`), 'combat');
        const newHp = Math.max(0, target.hp - damage);
        updateCharacter(target.id, { hp: newHp, isAlive: newHp > 0 });
        updateStats({ totalDamageTaken: state.stats.totalDamageTaken + damage });
        if (newHp <= 0) {
          killedThisTurn.push(target.id);
          addLog(logDeath(target.name), 'death');
          updateStats({ charactersLost: state.stats.charactersLost + 1 });
          if (state.party.filter(c => c.isAlive && c.id !== target.id).length === 0) {
            addLog('Total Party Kill!', 'death'); setPhase('game-over'); return;
          }
        }
        if (updatedEnemies !== state.combat!.enemies) {
          const combatWithEnemies = { ...state.combat!, enemies: updatedEnemies };
          setCombat(combatWithEnemies);
          advanceTurn(combatWithEnemies, killedThisTurn);
        } else {
          advanceTurn(undefined, killedThisTurn);
        }
        return;
      }

      // Advantage/disadvantage from conditions + dodge + reckless
      const targetEffectsForAtk = state.combat!.activeEffects.filter(e => e.targetId === target.id);
      const attackerEffectsForAtk = state.combat!.activeEffects.filter(e => e.targetId === currentEnemy.id);
      const isDodging = state.combat!.dodging.includes(target.id);
      const targetIsReckless = target.statusEffects?.includes('reckless');
      const targetConditionAdv = hasAdvantageAgainst(targetEffectsForAtk); // paralyzed, unconscious, restrained
      const enemyHasDisadvantage = hasDisadvantageOnAttack(attackerEffectsForAtk); // restrained enemy
      const hasAdv = targetConditionAdv || targetIsReckless;
      const hasDisadv = isDodging || enemyHasDisadvantage;

      // AC bonus from shield/shield-of-faith effects on target
      const targetACBonus = getACBonus(targetEffectsForAtk);
      const effectiveAC = target.ac + targetACBonus;

      const r1 = rollD20(), r2 = (hasAdv || hasDisadv) ? rollD20() : r1;
      const attackRoll = hasAdv && !hasDisadv ? Math.max(r1, r2) : hasDisadv && !hasAdv ? Math.min(r1, r2) : r1;
      const total = attackRoll + (action.toHit || 0);
      // Paralyzed/unconscious: melee auto-crits
      const isCrit = attackRoll === 20 || (targetConditionAdv && action.reach === 'melee');
      const tag = hasAdv ? ' (advantage)' : hasDisadv ? ' (disadvantage)' : '';

      if (attackRoll === 1 || total < effectiveAC) {
        addLog(attackRoll === 1 ? logNat1(currentEnemy.name, target.name) : logAttackMiss(currentEnemy.name, target.name, total, effectiveAC, tag), 'combat');
      } else {
        let damage = action.damage ? rollDice(action.damage) : 0;
        if (isCrit) damage = Math.floor(damage * 1.5);
        const newHp = Math.max(0, target.hp - damage);
        const isKill = newHp <= 0;
        addLog(logAttackHit(currentEnemy.name, target.name, action.name, damage, action.damageType || 'slashing', total, effectiveAC, isCrit, isKill), 'combat');
        updateCharacter(target.id, { hp: newHp, isAlive: !isKill });
        updateStats({ totalDamageTaken: state.stats.totalDamageTaken + damage });

        // Apply condition on hit
        if (action.conditionDC && action.conditionSave && action.conditionApplied && !isKill) {
          const saveAbility = action.conditionSave as keyof typeof target.stats;
          const saveRoll = rollD20() + statMod(target.stats[saveAbility] || 10);
          const saveInfo = `${action.conditionSave!.toUpperCase()} ${saveRoll} vs DC ${action.conditionDC}`;
          if (saveRoll < action.conditionDC) {
            const condition = action.conditionApplied as GameCondition;
            const effect: ActiveEffect = {
              id: makeEffectId(), name: action.name, condition,
              sourceId: currentEnemy.id, targetId: target.id,
              turnsRemaining: condition === 'prone' ? 1 : condition === 'poisoned' ? 3 : -1,
              ...(condition !== 'prone' && condition !== 'poisoned' ? { saveDC: action.conditionDC, saveAbility: action.conditionSave } : {}),
            };
            const { effects: newEffects, applied, reason } = applyCondition(state.combat!.activeEffects, effect);
            if (applied) {
              setCombat({ ...state.combat!, activeEffects: newEffects });
              addLog(logConditionApplied(target.name, condition, saveInfo), 'combat');
            }
          } else {
            addLog(logConditionResisted(target.name, action.conditionApplied, saveInfo), 'combat');
          }
        }

        // Wake unconscious targets on damage
        if (damage > 0) {
          const sleepEffect = state.combat!.activeEffects.find(e => e.targetId === target.id && e.condition === 'unconscious');
          if (sleepEffect) {
            const newEffects = state.combat!.activeEffects.filter(e => e.id !== sleepEffect.id);
            setCombat({ ...state.combat!, activeEffects: newEffects });
            addLog(`${target.name} jolts awake!`, 'combat');
          }
        }

        // Concentration breaking: if the target is concentrating (source of a concentration spell), CON save
        if (damage > 0) {
          const concEffects = state.combat!.activeEffects.filter(e => e.sourceId === target.id && e.turnsRemaining === -1);
          if (concEffects.length > 0 && target.isAlive) {
            const dc = Math.max(10, Math.floor(damage / 2));
            const conSave = rollD20() + statMod(target.stats.con);
            if (conSave < dc) {
              const newEffects = state.combat!.activeEffects.filter(e => e.sourceId !== target.id || e.turnsRemaining !== -1);
              addLog(`${target.name}'s concentration shatters! (CON ${conSave} vs DC ${dc})`, 'combat');
              setCombat({ ...state.combat!, activeEffects: newEffects });
            }
          }
        }

        if (newHp <= 0) {
          killedThisTurn.push(target.id);
          addLog(logDeath(target.name), 'death');
          updateStats({ charactersLost: state.stats.charactersLost + 1 });
          if (state.party.filter(c => c.isAlive && c.id !== target.id).length === 0) {
            addLog('Total Party Kill!', 'death'); setPhase('game-over'); return;
          }
        }
      }
      // Persist zone movement + advance turn, passing killed IDs
      if (updatedEnemies !== state.combat!.enemies) {
        const combatWithEnemies = { ...state.combat!, enemies: updatedEnemies };
        setCombat(combatWithEnemies);
        advanceTurn(combatWithEnemies, killedThisTurn);
      } else {
        advanceTurn(undefined, killedThisTurn);
      }
    }, 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.combat?.currentTurnIndex, state.combat?.roundNumber]);

  // ─── Player Actions ────────────────────────────────────────

  function resolveAttack(targetId: string, isExtraAttack = false) {
    if (!activeCharacter || !state.combat) return;
    const target = state.combat.enemies.find(e => e.id === targetId);
    if (!target || !target.isAlive) return;

    const weapon = activeCharacter.equipment.weapon;
    const strMod_ = statMod(activeCharacter.stats.str), dexMod_ = statMod(activeCharacter.stats.dex);
    const isRanged = weapon.weaponRange === 'ranged';
    const isFinesse = weapon.properties.includes('finesse');
    const mod = isRanged ? dexMod_ : isFinesse ? Math.max(strMod_, dexMod_) : strMod_;
    const prof = proficiencyBonus(activeCharacter.level);
    const toHit = mod + prof;
    const damageType = weapon.damageType;

    // Improved Critical (Fighter L3): crit on 19-20
    const critThreshold = activeCharacter.features.includes('Improved Critical') ? 19 : 20;

    // Advantage sources: reckless attack, target is restrained/paralyzed/unconscious
    const isReckless = activeCharacter.statusEffects.includes('reckless');
    const targetEffects = state.combat.activeEffects.filter(e => e.targetId === targetId);
    const targetConditionAdv = hasAdvantageAgainst(targetEffects);
    const attackerEffects = state.combat.activeEffects.filter(e => e.targetId === activeCharacter.id);
    const attackerDisadv = hasDisadvantageOnAttack(attackerEffects);
    const hasAdv = isReckless || targetConditionAdv;

    // Bless bonus
    const blessBonus = getAttackBonus(state.combat.activeEffects.filter(e => e.targetId === activeCharacter.id));

    const r1 = rollD20();
    const r2 = (hasAdv || attackerDisadv) ? rollD20() : r1;
    const attackRoll = hasAdv && !attackerDisadv ? Math.max(r1, r2) : attackerDisadv && !hasAdv ? Math.min(r1, r2) : r1;
    const total = attackRoll + toHit + blessBonus;
    // Paralyzed/unconscious: melee auto-crit
    const isCrit = attackRoll >= critThreshold || (targetConditionAdv && !isRanged);
    const tag = hasAdv ? ' (advantage)' : attackerDisadv ? ' (disadvantage)' : '';

    if (attackRoll === 1) {
      addLog(logNat1(activeCharacter.name, target.name), 'combat');
    } else if (total < target.ac) {
      addLog(logAttackMiss(activeCharacter.name, target.name, total, target.ac, tag), 'combat');
    } else {
      let damage = rollDice(weapon.damage) + mod;
      if (isCrit) damage += rollDice(weapon.damage);

      // Rage bonus: +2 STR melee damage while raging
      if (activeCharacter.statusEffects.includes('raging') && !isRanged) {
        damage += 2;
      }

      // Brutal Critical (Barbarian L9): extra die on crit
      if (isCrit && activeCharacter.features.includes('Brutal Critical')) {
        damage += rollDice(weapon.damage);
      }

      // Sneak Attack (Rogue): +Xd6 with advantage or ally in same zone as target
      if (activeCharacter.classIndex === 'rogue' && activeCharacter.features.includes('Sneak Attack')) {
        const hasAdvantage = isReckless; // or other advantage sources
        const allyInZone = state.party.some(c => c.isAlive && c.id !== activeCharacter.id && c.zone === target.zone);
        if (hasAdvantage || allyInZone) {
          const sneakDice = Math.ceil(activeCharacter.level / 2); // 1d6 at L1, 2d6 at L3, etc.
          const sneakDmg = rollDice(`${sneakDice}d6`);
          damage += sneakDmg;
          addLog(`  A blade finds the weak spot — Sneak Attack +${sneakDmg}!`, 'combat');
        }
      }

      // Hunter's Prey (Ranger L3): +1d8 to wounded target (below max HP)
      if (activeCharacter.features.includes("Hunter's Prey") && target.hp < target.maxHp) {
        const preyDmg = rollDice('1d8');
        damage += preyDmg;
      }

      // Divine Strike (Cleric L8): +1d8 radiant on weapon attack
      if (activeCharacter.features.includes('Divine Strike')) {
        damage += rollDice('1d8');
      }

      // Hunter's Mark bonus
      damage += getExtraDamage(state.combat.activeEffects.filter(e => e.sourceId === activeCharacter.id), targetId);

      // Bless bonus (already rolled in getAttackBonus but apply to damage display)

      // Damage type interactions
      let isImmune = false;
      if (target.damageImmunities.includes(damageType)) { damage = 0; isImmune = true; }
      else if (target.damageVulnerabilities.includes(damageType)) { damage *= 2; }
      else if (target.damageResistances.some(r => r.includes(damageType))) { damage = Math.floor(damage / 2); }

      const newHp = Math.max(0, target.hp - damage);
      const isKill = newHp <= 0;

      if (isImmune) { addLog(logImmune(target.name, damageType), 'combat'); }
      else { addLog(logAttackHit(activeCharacter.name, target.name, weapon.name, damage, damageType, total, target.ac, isCrit, isKill), 'combat'); }

      const newEnemies = state.combat.enemies.map(e => e.id === targetId ? { ...e, hp: newHp, isAlive: newHp > 0 } : e);
      if (isKill) { addLog(logDeath(target.name), 'death'); updateStats({ enemiesKilled: state.stats.enemiesKilled + 1 }); }
      updateStats({ totalDamageDealt: state.stats.totalDamageDealt + damage });

      // Wake unconscious enemies on damage
      let updatedEffects = state.combat.activeEffects;
      if (damage > 0) {
        const sleepEffect = updatedEffects.find(e => e.targetId === targetId && e.condition === 'unconscious');
        if (sleepEffect) {
          updatedEffects = updatedEffects.filter(e => e.id !== sleepEffect.id);
          addLog(`${target.name} jolts awake!`, 'combat');
        }
      }

      const combatUpdate: Partial<CombatState> = { enemies: newEnemies };
      if (updatedEffects !== state.combat.activeEffects) combatUpdate.activeEffects = updatedEffects;

      if (!isExtraAttack) {
        finishAction({ ...combatUpdate, turnResources: { ...state.combat.turnResources, actionUsed: true } });
      } else {
        setCombat({ ...state.combat, ...combatUpdate });
      }
      return;
    }

    if (!isExtraAttack) {
      finishAction({ turnResources: { ...state.combat.turnResources, actionUsed: true } });
    }
  }

  function handleAttack(targetId: string) {
    if (!activeCharacter || !state.combat) return;

    // Extra Attack (Fighter/Ranger/Barbarian L5): two attacks per action
    const hasExtraAttack = activeCharacter.features.includes('Extra Attack');
    if (hasExtraAttack) {
      resolveAttack(targetId, true); // first attack (don't consume action)
      // Small delay for second attack log readability
      setTimeout(() => resolveAttack(targetId, false), 100); // second attack consumes action
    } else {
      resolveAttack(targetId, false);
    }
  }

  function handleCast(spellIndex: string, targetId: string) {
    if (!activeCharacter || !state.combat || !activeCharacter.spellcasting) return;
    const meta = spellMeta[spellIndex]; if (!meta) return;
    const sc = activeCharacter.spellcasting;
    const castType = getSpellCastType(spellIndex);
    const isCantrip = meta.level === 0;
    const name = spellIndex.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (!isCantrip) updateCharacter(activeCharacter.id, { spellcasting: { ...sc, slotsUsed: sc.slotsUsed + 1 } });

    const effects = [...state.combat.activeEffects];

    // ── Healing ──────────────────────────────────────────
    if (castType === 'healing') {
      const ally = state.party.find(c => c.id === targetId); if (!ally) return;
      const modVal = Math.floor((activeCharacter.stats[sc.ability.toLowerCase() as keyof typeof activeCharacter.stats] - 10) / 2);
      let heal = rollDice(meta.damage?.replace(/\+\s*mod/i, '').trim() || '1d8') + modVal;

      // Disciple of Life (Cleric L1): +2+spell level on healing spells
      if (activeCharacter.features.includes('Disciple of Life') && !isCantrip) {
        heal += 2 + meta.level;
      }

      const newHp = Math.min(ally.maxHp, ally.hp + heal);
      updateCharacter(ally.id, { hp: newHp });
      addLog(logHeal(activeCharacter.name, name, ally.name, heal, ally.hp, newHp), 'combat');

      // Blessed Healer (Cleric L6): when you heal others, heal self 2+spell level
      if (activeCharacter.features.includes('Blessed Healer') && ally.id !== activeCharacter.id && !isCantrip) {
        const selfHeal = 2 + meta.level;
        const selfNewHp = Math.min(activeCharacter.maxHp, activeCharacter.hp + selfHeal);
        updateCharacter(activeCharacter.id, { hp: selfNewHp });
        addLog(logHeal(activeCharacter.name, 'Blessed Healer', activeCharacter.name, selfHeal, activeCharacter.hp, selfNewHp), 'combat');
      }

      finishAction({ turnResources: { ...state.combat.turnResources, actionUsed: true } });
      return;
    }

    // Helper: apply effect with stacking rules
    function tryApply(effect: ActiveEffect, targetName: string): boolean {
      const { effects: newEffects, applied, reason } = applyCondition(effects, effect);
      if (applied) {
        effects.length = 0;
        effects.push(...newEffects);
        if (reason === 'refreshed') addLog(`  ${targetName}: ${effect.condition} refreshed.`, 'combat');
        return true;
      }
      addLog(`  ${targetName} is already ${reason || 'affected'}.`, 'combat');
      return false;
    }

    // ── Buff (target ally) ───────────────────────────────
    if (castType === 'buff') {
      const ally = state.party.find(c => c.id === targetId);

      if (spellIndex === 'bless') {
        const effect: ActiveEffect = { id: makeEffectId(), name: 'Bless', condition: 'blessed', sourceId: activeCharacter.id, targetId, turnsRemaining: -1 };
        if (tryApply(effect, ally?.name || 'ally')) {
          addLog(`${activeCharacter.name} blesses ${ally?.name || 'ally'} — +1d4 on attacks.`, 'combat');
        }
      } else if (spellIndex === 'hunters-mark') {
        const effect: ActiveEffect = { id: makeEffectId(), name: "Hunter's Mark", condition: 'hunterMarked', sourceId: activeCharacter.id, targetId, turnsRemaining: -1 };
        const enemy = state.combat.enemies.find(e => e.id === targetId);
        if (tryApply(effect, enemy?.name || 'target')) {
          addLog(`${activeCharacter.name} marks ${enemy?.name || 'target'} — +1d6 damage on attacks.`, 'combat');
        }
      } else if (spellIndex === 'shield-of-faith') {
        const effect: ActiveEffect = { id: makeEffectId(), name: 'Shield of Faith', condition: 'shielded', sourceId: activeCharacter.id, targetId, turnsRemaining: -1, value: 2 };
        if (tryApply(effect, ally?.name || 'ally')) {
          addLog(`${activeCharacter.name} shields ${ally?.name || 'ally'} with faith — +2 AC.`, 'combat');
        }
      } else if (spellIndex === 'shield') {
        const effect: ActiveEffect = { id: makeEffectId(), name: 'Shield', condition: 'shielded', sourceId: activeCharacter.id, targetId: activeCharacter.id, turnsRemaining: 1, value: 5 };
        if (tryApply(effect, activeCharacter.name)) {
          addLog(`${activeCharacter.name} raises a magical shield — +5 AC.`, 'combat');
        }
      }

      finishAction({ activeEffects: effects, turnResources: { ...state.combat.turnResources, actionUsed: true } });
      return;
    }

    // ── Condition (target enemy, save-based) ─────────────
    if (castType === 'condition') {
      const target = state.combat.enemies.find(e => e.id === targetId);
      if (!target) { finishAction({ turnResources: { ...state.combat.turnResources, actionUsed: true } }); return; }

      if (spellIndex === 'hold-person') {
        const saveRoll = rollD20() + statMod(target.stats.wis);
        if (saveRoll >= sc.spellSaveDC) {
          addLog(logConditionResisted(target.name, 'paralyzed', `WIS ${saveRoll} vs DC ${sc.spellSaveDC}`), 'combat');
        } else {
          const effect: ActiveEffect = { id: makeEffectId(), name: 'Hold Person', condition: 'paralyzed', sourceId: activeCharacter.id, targetId, turnsRemaining: -1, saveDC: sc.spellSaveDC, saveAbility: 'wis' };
          if (tryApply(effect, target.name)) {
            addLog(logConditionApplied(target.name, 'paralyzed', `WIS ${saveRoll} vs DC ${sc.spellSaveDC}`), 'combat');
          }
        }
      } else if (spellIndex === 'sleep') {
        const hpPool = rollDice('5d8');
        const zoneEnemies = state.combat.enemies
          .filter(e => e.isAlive && e.zone === target.zone)
          .sort((a, b) => a.hp - b.hp);
        let remaining = hpPool;
        const slept: string[] = [];
        for (const e of zoneEnemies) {
          if (e.hp <= remaining) {
            remaining -= e.hp;
            const effect: ActiveEffect = { id: makeEffectId(), name: 'Sleep', condition: 'unconscious', sourceId: activeCharacter.id, targetId: e.id, turnsRemaining: 10 };
            const { applied } = applyCondition(effects, effect);
            if (applied) {
              const result = applyCondition(effects, effect);
              effects.length = 0;
              effects.push(...result.effects);
              slept.push(e.name);
            }
          }
        }
        if (slept.length > 0) {
          addLog(`${activeCharacter.name}'s Sleep washes over the zone (${hpPool} HP) — ${slept.join(', ')} collapse!`, 'combat');
        } else {
          addLog(`${activeCharacter.name}'s Sleep has no effect — enemies too strong (${hpPool} HP).`, 'combat');
        }
      } else if (spellIndex === 'web') {
        const saveRoll = rollD20() + statMod(target.stats.dex);
        if (saveRoll >= sc.spellSaveDC) {
          addLog(logConditionResisted(target.name, 'restrained', `DEX ${saveRoll} vs DC ${sc.spellSaveDC}`), 'combat');
        } else {
          const effect: ActiveEffect = { id: makeEffectId(), name: 'Web', condition: 'restrained', sourceId: activeCharacter.id, targetId, turnsRemaining: -1, saveDC: sc.spellSaveDC, saveAbility: 'dex' };
          if (tryApply(effect, target.name)) {
            addLog(logConditionApplied(target.name, 'restrained', `DEX ${saveRoll} vs DC ${sc.spellSaveDC}`), 'combat');
          }
        }
      } else if (spellIndex === 'spirit-guardians') {
        const effect: ActiveEffect = { id: makeEffectId(), name: 'Spirit Guardians', condition: 'spiritGuarded', sourceId: activeCharacter.id, targetId: activeCharacter.id, turnsRemaining: -1, damagePerTurn: '3d8', damageType: 'radiant', saveDC: sc.spellSaveDC, saveAbility: 'wis' };
        if (tryApply(effect, activeCharacter.name)) {
          addLog(`${activeCharacter.name} summons Spirit Guardians — radiant spirits orbit, dealing 3d8 to enemies in zone!`, 'combat');
        }
      } else if (spellIndex === 'command') {
        const saveRoll = rollD20() + statMod(target.stats.wis);
        if (saveRoll >= sc.spellSaveDC) {
          addLog(logConditionResisted(target.name, 'commanded', `WIS ${saveRoll} vs DC ${sc.spellSaveDC}`), 'combat');
        } else {
          const effect: ActiveEffect = { id: makeEffectId(), name: 'Command', condition: 'commanded', sourceId: activeCharacter.id, targetId, turnsRemaining: 1 };
          if (tryApply(effect, target.name)) {
            addLog(logConditionApplied(target.name, 'commanded', `WIS ${saveRoll} vs DC ${sc.spellSaveDC}`), 'combat');
          }
        }
      } else if (spellIndex === 'spike-growth') {
        // Zone hazard — simplified: immediate damage to all enemies in target's zone
        const zoneEnemies = state.combat.enemies.filter(e => e.isAlive && e.zone === target.zone);
        let totalDmg = 0;
        const newEnemies = state.combat.enemies.map(e => {
          if (!e.isAlive || e.zone !== target.zone) return e;
          const dmg = rollDice('2d4');
          totalDmg += dmg;
          const newHp = Math.max(0, e.hp - dmg);
          if (newHp <= 0) { addLog(logDeath(e.name, 'Spike Growth'), 'death'); updateStats({ enemiesKilled: state.stats.enemiesKilled + 1 }); }
          return { ...e, hp: newHp, isAlive: newHp > 0 };
        });
        addLog(`${activeCharacter.name} conjures Spike Growth — thorns shred enemies for ${totalDmg} piercing!`, 'combat');
        updateStats({ totalDamageDealt: state.stats.totalDamageDealt + totalDmg });
        finishAction({ enemies: newEnemies, activeEffects: effects, turnResources: { ...state.combat.turnResources, actionUsed: true } });
        return;
      }

      finishAction({ activeEffects: effects, turnResources: { ...state.combat.turnResources, actionUsed: true } });
      return;
    }

    // ── Boundary (wall between zones) ─────────────────────
    if (castType === 'boundary') {
      const boundaryKey = targetId as BoundaryKey;
      const element = spellIndex === 'wall-of-fire' ? 'fire' as const : 'fire' as const; // extend for ice/force later
      const newBoundary: import('@/data/game-types').BoundaryEffect = {
        id: makeEffectId(),
        name,
        element,
        damage: meta.damage || '5d8',
        damageType: meta.damageType || 'fire',
        saveDC: sc.spellSaveDC,
        saveAbility: 'dex',
        sourceId: activeCharacter.id,
      };

      const oldBoundary = state.combat.boundaries[boundaryKey];
      if (oldBoundary) {
        addLog(`${name} erupts across the boundary, consuming ${oldBoundary.name}!`, 'combat');
      }

      const newBoundaries = { ...state.combat.boundaries, [boundaryKey]: newBoundary };
      addLog(`${activeCharacter.name} conjures ${name} across the Zone ${boundaryKey.replace('|', '–')} boundary!`, 'combat');
      finishAction({ boundaries: newBoundaries, turnResources: { ...state.combat.turnResources, actionUsed: true } });
      return;
    }

    // ── Damage (target enemy) ────────────────────────────
    if (castType === 'damage' && meta.damageType) {
      const target = state.combat.enemies.find(e => e.id === targetId); if (!target) return;
      const isAutoHit = spellIndex === 'magic-missile';
      let hit = true, isCrit = false;
      if (!isAutoHit) {
        const roll = rollD20(), total = roll + sc.spellAttackBonus;
        isCrit = roll === 20; hit = roll !== 1 && (isCrit || total >= target.ac);
        if (!hit) addLog(logSpellMiss(activeCharacter.name, name, target.name, roll + sc.spellAttackBonus, target.ac), 'combat');
      }
      if (hit) {
        // Cantrip scaling: double dice at L5, triple at L11, quadruple at L17
        let baseDamage = (meta.damage || '1d6').replace(/[×x].*/, '').trim();
        if (isCantrip && activeCharacter.level >= 5) {
          const diceMatch = baseDamage.match(/^(\d+)(d\d+.*)$/);
          if (diceMatch) {
            const multiplier = activeCharacter.level >= 17 ? 4 : activeCharacter.level >= 11 ? 3 : 2;
            baseDamage = `${parseInt(diceMatch[1]) * multiplier}${diceMatch[2]}`;
          }
        }
        let damage = rollDice(baseDamage);
        if (isCrit) damage += rollDice(baseDamage);
        if (spellIndex === 'magic-missile') damage *= 3;

        // Empowered Evocation (Wizard L10): +INT mod to evocation damage
        if (activeCharacter.features.includes('Empowered Evocation') && meta.school === 'evocation') {
          damage += statMod(activeCharacter.stats.int);
        }

        // Hunter's Mark bonus
        damage += getExtraDamage(state.combat.activeEffects.filter(e => e.sourceId === activeCharacter.id), targetId);
        let isImmune = false;
        if (target.damageImmunities.includes(meta.damageType)) { damage = 0; isImmune = true; }
        else if (target.damageVulnerabilities.includes(meta.damageType)) { damage *= 2; }

        const newHp = Math.max(0, target.hp - damage);
        const isKill = newHp <= 0;
        if (isImmune) { addLog(logImmune(target.name, meta.damageType), 'combat'); }
        else { addLog(logSpellHit(activeCharacter.name, name, target.name, damage, meta.damageType, isCrit, isKill), 'combat'); }
        const newEnemies = state.combat.enemies.map(e => e.id === targetId ? { ...e, hp: newHp, isAlive: !isKill } : e);
        if (isKill) { addLog(logDeath(target.name), 'death'); updateStats({ enemiesKilled: state.stats.enemiesKilled + 1 }); }
        updateStats({ totalDamageDealt: state.stats.totalDamageDealt + damage });
        finishAction({ enemies: newEnemies, turnResources: { ...state.combat.turnResources, actionUsed: true } }); return;
      }
    }

    finishAction({ turnResources: { ...state.combat.turnResources, actionUsed: true } });
  }

  function handleDefend() {
    if (!activeCharacter || !state.combat) return;
    addLog(`${activeCharacter.name} braces for impact — dodging.`, 'combat');
    finishAction({ dodging: [...state.combat.dodging, activeCharacter.id], turnResources: { ...state.combat.turnResources, actionUsed: true } });
  }

  function handleUseItem(itemId: string, targetId: string) {
    if (!activeCharacter || !state.combat) return;
    const idx = activeCharacter.consumables.findIndex(c => c.id === itemId);
    if (idx === -1 || activeCharacter.consumables[idx].quantity <= 0) return;
    const item = activeCharacter.consumables[idx];
    const target = state.party.find(c => c.id === targetId); if (!target) return;
    const heal = rollDice('2d4') + 2;
    const newHp = Math.min(target.maxHp, target.hp + heal);
    updateCharacter(target.id, { hp: newHp });
    const newConsumables = [...activeCharacter.consumables];
    newConsumables[idx] = { ...item, quantity: item.quantity - 1 };
    updateCharacter(activeCharacter.id, { consumables: newConsumables });
    addLog(logHeal(activeCharacter.name, item.name, target.name, heal, target.hp, newHp), 'combat');
    finishAction({ turnResources: { ...state.combat.turnResources, actionUsed: true } });
  }

  function handleBonusAction(actionId: string) {
    if (!activeCharacter || !state.combat) return;

    if (actionId === 'second-wind') {
      const heal = rollDice('1d10') + activeCharacter.level;
      const newHp = Math.min(activeCharacter.maxHp, activeCharacter.hp + heal);
      updateCharacter(activeCharacter.id, { hp: newHp, featureUses: { ...activeCharacter.featureUses, 'second-wind': { ...activeCharacter.featureUses['second-wind'], used: activeCharacter.featureUses['second-wind'].used + 1 } } });
      addLog(logHeal(activeCharacter.name, 'Second Wind', activeCharacter.name, heal, activeCharacter.hp, newHp), 'combat');
    }

    if (actionId === 'rage') {
      updateCharacter(activeCharacter.id, { featureUses: { ...activeCharacter.featureUses, 'rage': { ...activeCharacter.featureUses['rage'], used: activeCharacter.featureUses['rage'].used + 1 } }, statusEffects: [...activeCharacter.statusEffects, 'raging'] });
      addLog(`${activeCharacter.name} erupts into a furious Rage!`, 'combat');
    }

    if (actionId === 'action-surge') {
      // Action Surge: reset actionUsed so player can take another action this turn
      updateCharacter(activeCharacter.id, { featureUses: { ...activeCharacter.featureUses, 'action-surge': { ...activeCharacter.featureUses['action-surge'], used: activeCharacter.featureUses['action-surge'].used + 1 } } });
      addLog(`${activeCharacter.name} surges with renewed vigor — extra action!`, 'combat');
      setCombat({ ...state.combat, turnResources: { ...state.combat.turnResources, actionUsed: false, bonusActionUsed: true } });
      return;
    }

    if (actionId === 'reckless-attack') {
      updateCharacter(activeCharacter.id, { statusEffects: [...activeCharacter.statusEffects, 'reckless'] });
      addLog(`${activeCharacter.name} throws caution to the wind — reckless attack!`, 'combat');
    }

    if (actionId === 'channel-divinity') {
      // Preserve Life: distribute 5×level HP among alive allies (up to half their max HP each)
      const pool = activeCharacter.level * 5;
      let remaining = pool;
      const wounded = state.party
        .filter(c => c.isAlive && c.hp < c.maxHp)
        .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp)); // heal most wounded first
      for (const ally of wounded) {
        if (remaining <= 0) break;
        const maxHeal = Math.floor(ally.maxHp / 2) - ally.hp; // can't heal above half max
        const heal = Math.min(remaining, Math.max(0, maxHeal > 0 ? maxHeal : ally.maxHp - ally.hp));
        if (heal > 0) {
          const newHp = Math.min(ally.maxHp, ally.hp + heal);
          updateCharacter(ally.id, { hp: newHp });
          remaining -= heal;
          addLog(logHeal(activeCharacter.name, 'Preserve Life', ally.name, heal, ally.hp, newHp), 'combat');
        }
      }
      updateCharacter(activeCharacter.id, { featureUses: { ...activeCharacter.featureUses, 'channel-divinity': { ...activeCharacter.featureUses['channel-divinity'], used: activeCharacter.featureUses['channel-divinity'].used + 1 } } });
      addLog(`${activeCharacter.name} channels divine energy — ${pool - remaining} HP restored to the wounded.`, 'combat');
    }

    setCombat({ ...state.combat, turnResources: { ...state.combat.turnResources, bonusActionUsed: true } });
  }

  function handleMove(zone: Zone) {
    if (!activeCharacter || !state.combat) return;

    // Frightened: can't move toward the source of fear
    const frightEffects = state.combat.activeEffects.filter(e => e.targetId === activeCharacter.id && e.condition === 'frightened');
    if (frightEffects.length > 0) {
      for (const fe of frightEffects) {
        const source = state.combat.enemies.find(e => e.id === fe.sourceId);
        if (source) {
          const currentDist = Math.abs(activeCharacter.zone - source.zone);
          const newDist = Math.abs(zone - source.zone);
          if (newDist < currentDist) {
            addLog(`${activeCharacter.name} recoils in terror — can't approach ${source.name}!`, 'combat');
            return;
          }
        }
      }
    }

    // Frozen: can't move
    const frozenEffect = state.combat.activeEffects.find(e => e.targetId === activeCharacter.id && e.condition === 'frozen');
    if (frozenEffect) {
      addLog(`${activeCharacter.name} is locked in ice — can't move!`, 'combat');
      return;
    }

    // Boundary check: crossing a wall between zones
    const boundaryKey = getBoundaryKey(activeCharacter.zone, zone);
    const boundary = boundaryKey ? state.combat.boundaries[boundaryKey] : null;

    if (boundary?.blocksMovement) {
      addLog(`${activeCharacter.name} is blocked by ${boundary.name} — impassable!`, 'combat');
      return;
    }

    updateCharacter(activeCharacter.id, { zone });
    addLog(logMove(activeCharacter.name, zoneLabel(zone)), 'combat');

    // Take boundary damage if crossing through a wall
    if (boundary?.damage) {
      let dmg = rollDice(boundary.damage);
      if (boundary.saveDC && boundary.saveAbility) {
        const saveKey = boundary.saveAbility as keyof typeof activeCharacter.stats;
        const saveRoll = rollD20() + statMod(activeCharacter.stats[saveKey] || 10);
        if (saveRoll >= boundary.saveDC) dmg = Math.floor(dmg / 2);
        addLog(logBoundaryCross(activeCharacter.name, boundary.name, dmg, boundary.damageType || 'fire', saveRoll >= boundary.saveDC), 'combat');
      } else {
        addLog(logBoundaryCross(activeCharacter.name, boundary.name, dmg, boundary.damageType || 'fire', false), 'combat');
      }
      const newHp = Math.max(0, activeCharacter.hp - dmg);
      updateCharacter(activeCharacter.id, { hp: newHp, isAlive: newHp > 0 });
      updateStats({ totalDamageTaken: state.stats.totalDamageTaken + dmg });
      if (newHp <= 0) {
        addLog(logDeath(activeCharacter.name), 'death');
        updateStats({ charactersLost: state.stats.charactersLost + 1 });
      }
    }

    finishAction({ turnResources: { ...state.combat.turnResources, movementUsed: true } });
  }

  return {
    currentEntity,
    isPlayerTurn,
    activeCharacter,
    advanceTurn,
    handleAttack,
    handleCast,
    handleDefend,
    handleUseItem,
    handleBonusAction,
    handleMove,
  };
}
