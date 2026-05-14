'use client';

import { useEffect } from 'react';
import { useGame } from '@/components/providers/GameProvider';
import { rollD20, rollDice, statMod } from '@/data/dice';
import { spellMeta } from '@/data/spell-meta';
import { getSpellCastType } from '@/data/spell-engine';
import {
  logHeal, logConditionApplied, logConditionResisted, logConditionFree,
  logDot, logMove, logBoundaryCross, logDeath,
} from '@/data/combat-log';
import { zoneLabel } from '@/data/zones';
import {
  shouldSkipTurn, SKIP_TURN_CONDITIONS, resolveEndOfTurnSaves, tickEffects,
  removeBySource, applyCondition, makeEffectId, type ActiveEffect,
} from '@/data/status-effects';
import { planIntents } from '@/data/enemy-intent';
import { getModifiers, hallowedHeal } from './combat-modifiers';
import { getClericAuraBonus } from '@/data/zone-synergies';
import { resolvePlayerAttack, resolveSpellDamage } from './combat-resolvers';
import { executeEnemyTurn } from './enemy-turn';
import { emitCombatFeedback, delay } from '@/data/combat-events';
import type { Zone, CombatState, Enemy, BoundaryKey, TurnResources } from '@/data/game-types';

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
  const mods = getModifiers(state.floorModifier);

  // ─── Enemy Intent (recompute at round start) ───────────────

  useEffect(() => {
    if (!state.combat || state.phase !== 'combat') return;
    const intents = planIntents(state.combat.enemies, state.party, state.combat.activeEffects);
    const current = state.combat.enemyIntents;
    const changed = Object.keys(intents).length !== Object.keys(current).length
      || Object.keys(intents).some(id => current[id]?.type !== intents[id].type);
    if (changed) {
      setCombat({ ...state.combat, enemyIntents: intents });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.combat?.roundNumber, state.phase]);

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

    let tickedEffects = combat.activeEffects;
    const deadCharIds = state.party.filter(c => !c.isAlive).map(c => c.id);
    const deadEnemyIds = combat.enemies.filter(e => !e.isAlive).map(e => e.id);
    for (const id of [...deadCharIds, ...deadEnemyIds, ...(killedIds || [])]) {
      tickedEffects = removeBySource(tickedEffects, id);
    }
    tickedEffects = tickedEffects.filter(e => {
      const targetAlive = state.party.some(c => c.id === e.targetId && c.isAlive)
        || combat.enemies.some(en => en.id === e.targetId && en.isAlive);
      return targetAlive;
    });
    tickedEffects = tickEffects(tickedEffects);

    const cleanedBoundaries = { ...combat.boundaries };
    const allDeadIds = new Set([...deadCharIds, ...deadEnemyIds, ...(killedIds || [])]);
    for (const key of ['1|2', '2|3'] as BoundaryKey[]) {
      if (cleanedBoundaries[key] && allDeadIds.has(cleanedBoundaries[key]!.sourceId)) {
        cleanedBoundaries[key] = null;
      }
    }

    const currentId = combat.initiativeOrder[combat.currentTurnIndex]?.id;
    if (currentId) {
      const recklessChar = state.party.find(c => c.id === currentId && c.statusEffects.includes('reckless'));
      if (recklessChar) {
        updateCharacter(currentId, { statusEffects: recklessChar.statusEffects.filter(s => s !== 'reckless') });
      }
    }

    // Determine action count for next entity
    let actions = 1;
    if (nextEntity?.type === 'character') {
      const nextChar = state.party.find(c => c.id === nextEntity.id);
      if (nextChar?.features.includes('Extra Attack')) actions = 2;
    }

    setCombat({
      ...combat,
      currentTurnIndex: nextIndex,
      roundNumber: nextIndex <= combat.currentTurnIndex ? combat.roundNumber + 1 : combat.roundNumber,
      turnResources: { actionsRemaining: actions, bonusActionUsed: false, movementUsed: false },
      dodging: newDodging,
      activeEffects: tickedEffects,
      boundaries: cleanedBoundaries,
    });
  }

  /** Build turnResources with one action spent */
  function spendAction(): TurnResources {
    return { ...state.combat!.turnResources, actionsRemaining: state.combat!.turnResources.actionsRemaining - 1 };
  }

  function finishAction(combatUpdate: Partial<CombatState>) {
    if (!state.combat) return;
    const updated = { ...state.combat, ...combatUpdate } as CombatState;
    if (updated.turnResources.actionsRemaining <= 0 && updated.turnResources.movementUsed) {
      // Delay auto-advance to let animations (movement, damage) finish
      setCombat(updated);
      setTimeout(() => advanceTurn(updated), 400);
    } else {
      setCombat(updated);
    }
  }

  // ─── Player Turn Start: DoT + Status Check ─────────────────

  useEffect(() => {
    if (!state.combat || state.phase !== 'combat') return;
    const current = state.combat.initiativeOrder[state.combat.currentTurnIndex];
    if (!current || current.type !== 'character') return;
    const char = state.party.find(c => c.id === current.id);
    if (!char || !char.isAlive) return;

    const charEffects = state.combat.activeEffects.filter(e => e.targetId === current.id);

    // Blessed Winds: heal 2 HP at turn start
    if (mods.blessedWinds && char.hp < char.maxHp) {
      const heal = Math.min(2, char.maxHp - char.hp);
      updateCharacter(char.id, { hp: char.hp + heal });
    }

    // DoT at turn start
    const dotEffects = charEffects.filter(e => e.damagePerTurn);
    let charDied = false;
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
          charDied = true;
          break;
        }
      }
    }

    // DoT killed the active character (not a TPK) — skip their turn
    if (charDied) { advanceTurn(undefined, [char.id]); return; }

    if (!shouldSkipTurn(charEffects)) return;

    const t = setTimeout(() => {
      const disabling = charEffects.find(e => SKIP_TURN_CONDITIONS.includes(e.condition));
      const label = disabling?.condition || 'status';
      addLog(`${char.name} is ${label} — skips turn.`, 'system');
      const auraBonus = getClericAuraBonus(char.id, char.zone, state.party);
      const { freed } = resolveEndOfTurnSaves(charEffects, char.stats, auraBonus);
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

    const abort = { cancelled: false };
    executeEnemyTurn(enemy, {
      combat: state.combat!,
      party: state.party,
      stats: state.stats,
      mods,
      addLog, updateCharacter, updateStats, setCombat, setPhase, advanceTurn,
      abortSignal: abort,
    });
    return () => { abort.cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.combat?.currentTurnIndex, state.combat?.roundNumber]);

  // ─── Player Actions ────────────────────────────────────────

  async function handleAttack(targetId: string) {
    if (!activeCharacter || !state.combat) return;

    // Capture snapshot before async delay
    const combat = state.combat;
    const attacker = activeCharacter;
    const party = state.party;

    // Swing animation before resolving
    const target = combat.enemies.find(e => e.id === targetId);
    emitCombatFeedback({ type: 'attack-swing', targetId, attackerId: attacker.id, attackerZone: attacker.zone, targetZone: target?.zone ?? 2 });
    await delay(150);

    const result = resolvePlayerAttack(attacker, targetId, combat, party, mods);
    result.logs.forEach(l => addLog(l.message, l.type));

    // Emit visual feedback
    if (result.isImmune) {
      emitCombatFeedback({ type: 'immune', targetId });
    } else if (result.damage > 0) {
      const isCrit = result.logs.some(l => l.message.includes('CRIT') || l.message.includes('critical'));
      emitCombatFeedback({ type: isCrit ? 'crit' : 'damage', targetId, value: result.damage, damageType: attacker.equipment.weapon.damageType });
      emitCombatFeedback({ type: 'impact', targetId, damageType: attacker.equipment.weapon.damageType });
      if (result.isVulnerable) emitCombatFeedback({ type: 'vulnerable', targetId });
      if (result.isResisted) emitCombatFeedback({ type: 'resisted', targetId });
      if (result.enemyUpdates && !result.enemyUpdates.isAlive) {
        emitCombatFeedback({ type: 'kill', targetId, isPartyMember: false });
      }
    } else if (result.enemyUpdates === null) {
      emitCombatFeedback({ type: 'miss', targetId });
    }

    if (result.damage > 0) updateStats({ totalDamageDealt: state.stats.totalDamageDealt + result.damage });

    if (result.enemyUpdates) {
      const newEnemies = combat.enemies.map(e =>
        e.id === result.enemyUpdates!.id ? { ...e, hp: result.enemyUpdates!.hp, isAlive: result.enemyUpdates!.isAlive } : e
      );
      if (!result.enemyUpdates.isAlive) updateStats({ enemiesKilled: state.stats.enemiesKilled + 1 });
      const combatUpdate: Partial<CombatState> = { enemies: newEnemies, turnResources: spendAction() };
      if (result.effectsChanged) combatUpdate.activeEffects = result.effects;
      finishAction(combatUpdate);
    } else {
      finishAction({ turnResources: spendAction() });
    }
  }

  async function handleCast(spellIndex: string, targetId: string, asBonusAction = false) {
    if (!activeCharacter || !state.combat || !activeCharacter.spellcasting) return;
    const meta = spellMeta[spellIndex]; if (!meta) return;

    // Bonus-action spells (Healing Word, Hunter's Mark) spend the bonus action,
    // not the turn's action.
    const castResources = (): TurnResources => asBonusAction
      ? { ...state.combat!.turnResources, bonusActionUsed: true }
      : spendAction();

    // Capture snapshot before async delay
    const caster = activeCharacter;

    // Spell cast glow before resolving
    emitCombatFeedback({ type: 'spell-cast', targetId: caster.id, spellSchool: meta.school });
    await delay(200);
    const rawSc = caster.spellcasting!;
    const sc = mods.thinVeil ? { ...rawSc, spellSaveDC: rawSc.spellSaveDC - 2 } : rawSc;
    const castType = getSpellCastType(spellIndex);
    const isCantrip = meta.level === 0;
    const name = spellIndex.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (!isCantrip) updateCharacter(activeCharacter.id, { spellcasting: { ...rawSc, slotsUsed: rawSc.slotsUsed + 1 } });

    const effects = [...state.combat.activeEffects];

    // ── Healing ──────────────────────────────────────────
    if (castType === 'healing') {
      const ally = state.party.find(c => c.id === targetId); if (!ally) return;
      const modVal = Math.floor((activeCharacter.stats[sc.ability.toLowerCase() as keyof typeof activeCharacter.stats] - 10) / 2);
      let heal = rollDice(meta.damage?.replace(/\+\s*mod/i, '').trim() || '1d8') + modVal;
      if (activeCharacter.features.includes('Disciple of Life') && !isCantrip) heal += 2 + meta.level;
      heal = hallowedHeal(heal, mods);
      const newHp = Math.min(ally.maxHp, ally.hp + heal);
      updateCharacter(ally.id, { hp: newHp });
      addLog(logHeal(activeCharacter.name, name, ally.name, heal, ally.hp, newHp), 'combat');
      emitCombatFeedback({ type: 'heal', targetId, value: heal });
      if (activeCharacter.features.includes('Blessed Healer') && ally.id !== activeCharacter.id && !isCantrip) {
        const selfHeal = 2 + meta.level;
        const selfNewHp = Math.min(activeCharacter.maxHp, activeCharacter.hp + selfHeal);
        updateCharacter(activeCharacter.id, { hp: selfNewHp });
        addLog(logHeal(activeCharacter.name, 'Blessed Healer', activeCharacter.name, selfHeal, activeCharacter.hp, selfNewHp), 'combat');
      }
      finishAction({ turnResources: castResources() });
      return;
    }

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

    // ── Buff ─────────────────────────────────────────────
    if (castType === 'buff') {
      const ally = state.party.find(c => c.id === targetId);
      if (spellIndex === 'bless') {
        const effect: ActiveEffect = { id: makeEffectId(), name: 'Bless', condition: 'blessed', sourceId: activeCharacter.id, targetId, turnsRemaining: -1 };
        if (tryApply(effect, ally?.name || 'ally')) addLog(`${activeCharacter.name} blesses ${ally?.name || 'ally'} — +1d4 on attacks.`, 'combat');
      } else if (spellIndex === 'hunters-mark') {
        const effect: ActiveEffect = { id: makeEffectId(), name: "Hunter's Mark", condition: 'hunterMarked', sourceId: activeCharacter.id, targetId, turnsRemaining: -1 };
        const enemy = state.combat.enemies.find(e => e.id === targetId);
        if (tryApply(effect, enemy?.name || 'target')) addLog(`${activeCharacter.name} marks ${enemy?.name || 'target'} — +1d6 damage on attacks.`, 'combat');
      } else if (spellIndex === 'shield-of-faith') {
        const effect: ActiveEffect = { id: makeEffectId(), name: 'Shield of Faith', condition: 'shielded', sourceId: activeCharacter.id, targetId, turnsRemaining: -1, value: 2 };
        if (tryApply(effect, ally?.name || 'ally')) addLog(`${activeCharacter.name} shields ${ally?.name || 'ally'} with faith — +2 AC.`, 'combat');
      } else if (spellIndex === 'shield') {
        const effect: ActiveEffect = { id: makeEffectId(), name: 'Shield', condition: 'shielded', sourceId: activeCharacter.id, targetId: activeCharacter.id, turnsRemaining: 1, value: 5 };
        if (tryApply(effect, activeCharacter.name)) addLog(`${activeCharacter.name} raises a magical shield — +5 AC.`, 'combat');
      }
      finishAction({ activeEffects: effects, turnResources: castResources() });
      return;
    }

    // ── Condition ────────────────────────────────────────
    if (castType === 'condition') {
      const target = state.combat.enemies.find(e => e.id === targetId);
      if (!target) { finishAction({ turnResources: castResources() }); return; }

      if (spellIndex === 'hold-person') {
        const saveRoll = rollD20() + statMod(target.stats.wis);
        if (saveRoll >= sc.spellSaveDC) { addLog(logConditionResisted(target.name, 'paralyzed', `WIS ${saveRoll} vs DC ${sc.spellSaveDC}`), 'combat'); }
        else { const effect: ActiveEffect = { id: makeEffectId(), name: 'Hold Person', condition: 'paralyzed', sourceId: activeCharacter.id, targetId, turnsRemaining: -1, saveDC: sc.spellSaveDC, saveAbility: 'wis' }; if (tryApply(effect, target.name)) addLog(logConditionApplied(target.name, 'paralyzed', `WIS ${saveRoll} vs DC ${sc.spellSaveDC}`), 'combat'); }
      } else if (spellIndex === 'sleep') {
        const hpPool = rollDice('5d8');
        const zoneEnemies = state.combat.enemies.filter(e => e.isAlive && e.zone === target.zone).sort((a, b) => a.hp - b.hp);
        let remaining = hpPool;
        const slept: string[] = [];
        for (const e of zoneEnemies) {
          if (e.hp <= remaining) {
            remaining -= e.hp;
            const effect: ActiveEffect = { id: makeEffectId(), name: 'Sleep', condition: 'unconscious', sourceId: activeCharacter.id, targetId: e.id, turnsRemaining: 10 };
            const { effects: newEffects, applied } = applyCondition(effects, effect);
            if (applied) { effects.length = 0; effects.push(...newEffects); slept.push(e.name); }
          }
        }
        addLog(slept.length > 0 ? `${activeCharacter.name}'s Sleep washes over the zone (${hpPool} HP) — ${slept.join(', ')} collapse!` : `${activeCharacter.name}'s Sleep has no effect — enemies too strong (${hpPool} HP).`, 'combat');
      } else if (spellIndex === 'web') {
        const saveRoll = rollD20() + statMod(target.stats.dex);
        if (saveRoll >= sc.spellSaveDC) { addLog(logConditionResisted(target.name, 'restrained', `DEX ${saveRoll} vs DC ${sc.spellSaveDC}`), 'combat'); }
        else { const effect: ActiveEffect = { id: makeEffectId(), name: 'Web', condition: 'restrained', sourceId: activeCharacter.id, targetId, turnsRemaining: -1, saveDC: sc.spellSaveDC, saveAbility: 'dex' }; if (tryApply(effect, target.name)) addLog(logConditionApplied(target.name, 'restrained', `DEX ${saveRoll} vs DC ${sc.spellSaveDC}`), 'combat'); }
      } else if (spellIndex === 'spirit-guardians') {
        const effect: ActiveEffect = { id: makeEffectId(), name: 'Spirit Guardians', condition: 'spiritGuarded', sourceId: activeCharacter.id, targetId: activeCharacter.id, turnsRemaining: -1, damagePerTurn: '3d8', damageType: 'radiant', saveDC: sc.spellSaveDC, saveAbility: 'wis' };
        if (tryApply(effect, activeCharacter.name)) addLog(`${activeCharacter.name} summons Spirit Guardians — radiant spirits orbit, dealing 3d8 to enemies in zone!`, 'combat');
      } else if (spellIndex === 'command') {
        const saveRoll = rollD20() + statMod(target.stats.wis);
        if (saveRoll >= sc.spellSaveDC) { addLog(logConditionResisted(target.name, 'commanded', `WIS ${saveRoll} vs DC ${sc.spellSaveDC}`), 'combat'); }
        else { const effect: ActiveEffect = { id: makeEffectId(), name: 'Command', condition: 'commanded', sourceId: activeCharacter.id, targetId, turnsRemaining: 1 }; if (tryApply(effect, target.name)) addLog(logConditionApplied(target.name, 'commanded', `WIS ${saveRoll} vs DC ${sc.spellSaveDC}`), 'combat'); }
      } else if (spellIndex === 'spike-growth') {
        let totalDmg = 0;
        const newEnemies = state.combat.enemies.map(e => {
          if (!e.isAlive || e.zone !== target.zone) return e;
          const dmg = rollDice('2d4'); totalDmg += dmg;
          const newHp = Math.max(0, e.hp - dmg);
          if (newHp <= 0) { addLog(logDeath(e.name, 'Spike Growth'), 'death'); updateStats({ enemiesKilled: state.stats.enemiesKilled + 1 }); }
          return { ...e, hp: newHp, isAlive: newHp > 0 };
        });
        addLog(`${activeCharacter.name} conjures Spike Growth — thorns shred enemies for ${totalDmg} piercing!`, 'combat');
        updateStats({ totalDamageDealt: state.stats.totalDamageDealt + totalDmg });
        finishAction({ enemies: newEnemies, activeEffects: effects, turnResources: castResources() });
        return;
      }
      finishAction({ activeEffects: effects, turnResources: castResources() });
      return;
    }

    // ── Boundary ─────────────────────────────────────────
    if (castType === 'boundary') {
      const boundaryKey = targetId as BoundaryKey;
      const element = 'fire' as const;
      const newBoundary: import('@/data/game-types').BoundaryEffect = {
        id: makeEffectId(), name, element,
        damage: meta.damage || '5d8', damageType: meta.damageType || 'fire',
        saveDC: sc.spellSaveDC, saveAbility: 'dex', sourceId: activeCharacter.id,
      };
      const oldBoundary = state.combat.boundaries[boundaryKey];
      if (oldBoundary) addLog(`${name} erupts across the boundary, consuming ${oldBoundary.name}!`, 'combat');
      const newBoundaries = { ...state.combat.boundaries, [boundaryKey]: newBoundary };
      addLog(`${activeCharacter.name} conjures ${name} across the Zone ${boundaryKey.replace('|', '–')} boundary!`, 'combat');
      finishAction({ boundaries: newBoundaries, turnResources: castResources() });
      return;
    }

    // ── Damage (delegated to pure resolver) ──────────────
    if (castType === 'damage' && meta.damageType) {
      const result = resolveSpellDamage(activeCharacter, spellIndex, targetId, state.combat, sc.spellSaveDC, sc.spellAttackBonus, mods);
      result.logs.forEach(l => addLog(l.message, l.type));

      // Emit visual feedback
      if (result.isImmune) {
        emitCombatFeedback({ type: 'immune', targetId });
      } else if (result.damage > 0) {
        const isCrit = result.logs.some(l => l.message.includes('CRIT') || l.message.includes('critical'));
        emitCombatFeedback({ type: isCrit ? 'crit' : 'damage', targetId, value: result.damage, damageType: meta.damageType });
        emitCombatFeedback({ type: 'impact', targetId, damageType: meta.damageType });
        if (result.isVulnerable) emitCombatFeedback({ type: 'vulnerable', targetId });
        if (result.isResisted) emitCombatFeedback({ type: 'resisted', targetId });
      } else if (result.enemyUpdates === null) {
        emitCombatFeedback({ type: 'miss', targetId });
      }

      if (result.damage > 0) updateStats({ totalDamageDealt: state.stats.totalDamageDealt + result.damage });
      if (result.enemyUpdates) {
        const newEnemies = state.combat.enemies.map(e =>
          e.id === result.enemyUpdates!.id ? { ...e, hp: result.enemyUpdates!.hp, isAlive: result.enemyUpdates!.isAlive } : e
        );
        if (!result.enemyUpdates.isAlive) updateStats({ enemiesKilled: state.stats.enemiesKilled + 1 });
        const combatUpdate: Partial<CombatState> = { enemies: newEnemies, turnResources: castResources() };
        if (result.effectsChanged) combatUpdate.activeEffects = result.effects;
        finishAction(combatUpdate);
      } else {
        finishAction({ turnResources: castResources() });
      }
      return;
    }

    finishAction({ turnResources: castResources() });
  }

  function handleDefend() {
    if (!activeCharacter || !state.combat) return;
    addLog(`${activeCharacter.name} braces for impact — dodging.`, 'combat');
    emitCombatFeedback({ type: 'defend', targetId: activeCharacter.id });
    finishAction({ dodging: [...state.combat.dodging, activeCharacter.id], turnResources: spendAction() });
  }

  function handleUseItem(itemId: string, targetId: string) {
    if (!activeCharacter || !state.combat) return;
    const idx = activeCharacter.consumables.findIndex(c => c.id === itemId);
    if (idx === -1 || activeCharacter.consumables[idx].quantity <= 0) return;
    const item = activeCharacter.consumables[idx];
    const target = state.party.find(c => c.id === targetId); if (!target) return;
    const heal = hallowedHeal(rollDice('2d4') + 2, mods);
    const newHp = Math.min(target.maxHp, target.hp + heal);
    updateCharacter(target.id, { hp: newHp });
    const newConsumables = [...activeCharacter.consumables];
    newConsumables[idx] = { ...item, quantity: item.quantity - 1 };
    updateCharacter(activeCharacter.id, { consumables: newConsumables });
    addLog(logHeal(activeCharacter.name, item.name, target.name, heal, target.hp, newHp), 'combat');
    finishAction({ turnResources: spendAction() });
  }

  function handleBonusAction(actionId: string) {
    if (!activeCharacter || !state.combat) return;

    if (actionId === 'second-wind') {
      const heal = hallowedHeal(rollDice('1d10') + activeCharacter.level, mods);
      const newHp = Math.min(activeCharacter.maxHp, activeCharacter.hp + heal);
      updateCharacter(activeCharacter.id, { hp: newHp, featureUses: { ...activeCharacter.featureUses, 'second-wind': { ...activeCharacter.featureUses['second-wind'], used: activeCharacter.featureUses['second-wind'].used + 1 } } });
      addLog(logHeal(activeCharacter.name, 'Second Wind', activeCharacter.name, heal, activeCharacter.hp, newHp), 'combat');
    }
    if (actionId === 'rage') {
      updateCharacter(activeCharacter.id, { featureUses: { ...activeCharacter.featureUses, 'rage': { ...activeCharacter.featureUses['rage'], used: activeCharacter.featureUses['rage'].used + 1 } }, statusEffects: [...activeCharacter.statusEffects, 'raging'] });
      addLog(`${activeCharacter.name} erupts into a furious Rage!`, 'combat');
    }
    if (actionId === 'action-surge') {
      updateCharacter(activeCharacter.id, { featureUses: { ...activeCharacter.featureUses, 'action-surge': { ...activeCharacter.featureUses['action-surge'], used: activeCharacter.featureUses['action-surge'].used + 1 } } });
      addLog(`${activeCharacter.name} surges with renewed vigor — extra action!`, 'combat');
      setCombat({ ...state.combat, turnResources: { ...state.combat.turnResources, actionsRemaining: state.combat.turnResources.actionsRemaining + 1, bonusActionUsed: true } });
      return;
    }
    if (actionId === 'reckless-attack') {
      updateCharacter(activeCharacter.id, { statusEffects: [...activeCharacter.statusEffects, 'reckless'] });
      addLog(`${activeCharacter.name} throws caution to the wind — reckless attack!`, 'combat');
    }
    if (actionId === 'channel-divinity') {
      const pool = activeCharacter.level * 5;
      let remaining = pool;
      const wounded = state.party.filter(c => c.isAlive && c.hp < c.maxHp).sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
      for (const ally of wounded) {
        if (remaining <= 0) break;
        const maxHeal = Math.floor(ally.maxHp / 2) - ally.hp;
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

    if (mods.unstableGround) {
      addLog(`${activeCharacter.name} can't move — the ground is too unstable!`, 'combat');
      return;
    }

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

    const frozenEffect = state.combat.activeEffects.find(e => e.targetId === activeCharacter.id && e.condition === 'frozen');
    if (frozenEffect) {
      addLog(`${activeCharacter.name} is locked in ice — can't move!`, 'combat');
      return;
    }

    const boundaryKey = getBoundaryKey(activeCharacter.zone, zone);
    const boundary = boundaryKey ? state.combat.boundaries[boundaryKey] : null;

    if (boundary?.blocksMovement) {
      addLog(`${activeCharacter.name} is blocked by ${boundary.name} — impassable!`, 'combat');
      return;
    }

    updateCharacter(activeCharacter.id, { zone });
    addLog(logMove(activeCharacter.name, zoneLabel(zone)), 'combat');

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
        if (state.party.filter(c => c.isAlive && c.id !== activeCharacter.id).length === 0) {
          addLog('Total Party Kill!', 'death');
          setPhase('game-over');
        } else {
          advanceTurn(undefined, [activeCharacter.id]);
        }
        return;
      }
    }

    finishAction({ turnResources: { ...state.combat.turnResources, movementUsed: true } });
  }

  return {
    currentEntity, isPlayerTurn, activeCharacter,
    advanceTurn, handleAttack, handleCast, handleDefend,
    handleUseItem, handleBonusAction, handleMove,
  };
}
