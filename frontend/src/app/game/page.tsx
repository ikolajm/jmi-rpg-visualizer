'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/components/providers/GameProvider';
import { classBuilds } from '@/data/classes';
import { createMockCombat } from '@/data/mock-combat';
import { rollD20, rollDice, statMod } from '@/data/dice';
import { spellMeta } from '@/data/spell-meta';
import { getWeaponDamageType, getWeaponDice } from '@/data/weapon-helpers';
import { weaponReach, zoneLabel } from '@/data/zones';
import { GameIcon } from '@/components/atoms/GameIcon';
import { Button } from '@/components/atoms/Button';
import { HealthBar, AcShield, StatRow, ResistanceRow, AttackLine, CreatureHeader } from '@/components/molecules';
import { Sheet, SheetContent, SheetHeader } from '@/components/atoms/Sheet';
import { InitiativeBar, ZoneLayout, ActionBar, GameLog, PartyToken } from '@/components/game';
import type { Character, Enemy, Zone } from '@/data/game-types';

// ─── Main Dashboard ──────────────────────────────────────────

export default function GamePage() {
  const { state, initParty, setPhase, setCombat, addLog, updateCharacter, updateStats } = useGame();
  const [inspecting, setInspecting] = useState<Character | Enemy | null>(null);
  const [inspectType, setInspectType] = useState<'character' | 'enemy'>('character');

  // ─── Init ────────────────────────────────────────────────────

  useEffect(() => {
    if (state.party.length > 0) return;
    const stored = sessionStorage.getItem('party-wipe-draft');
    let indices: string[];
    if (stored) {
      try { indices = JSON.parse(stored); } catch { indices = []; }
      sessionStorage.removeItem('party-wipe-draft');
    } else {
      indices = ['fighter', 'ranger', 'wizard', 'cleric'];
    }
    const builds = indices.map(idx => classBuilds.find(b => b.index === idx)).filter(Boolean);
    if (builds.length === 4) initParty(builds as typeof classBuilds);
  }, [state.party.length, initParty]);

  const combatInitRef = React.useRef(false);
  useEffect(() => {
    if (combatInitRef.current || state.party.length !== 4 || state.combat || state.phase !== 'room-preview') return;
    combatInitRef.current = true;
    const zoneMap: Record<string, Zone> = { fighter: 1, rogue: 1, barbarian: 1, ranger: 2, wizard: 3, cleric: 2 };
    state.party.forEach(char => updateCharacter(char.id, { zone: zoneMap[char.classIndex] || 2 }));
    setTimeout(() => {
      setCombat(createMockCombat(state.party));
      setPhase('combat');
      addLog('Combat begins! 2 Goblins and 2 Skeletons emerge from the darkness.', 'system');
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.party.length]);

  // ─── Turn State ──────────────────────────────────────────────

  const currentEntity = state.combat?.initiativeOrder[state.combat.currentTurnIndex];
  const isPlayerTurn = currentEntity?.type === 'character';
  const activeCharacter = isPlayerTurn ? state.party.find(c => c.id === currentEntity.id) : null;

  // ─── Turn Advancement ──────────────────────────────────────

  function advanceTurn(combatOverride?: typeof state.combat) {
    const combat = combatOverride || state.combat;
    if (!combat) return;

    if (combat.enemies.every(e => !e.isAlive)) {
      addLog('All enemies defeated! Victory!', 'system');
      setPhase('room-preview');
      setCombat(null);
      updateStats({ roomsCleared: state.stats.roomsCleared + 1 });
      return;
    }

    let nextIndex = (combat.currentTurnIndex + 1) % combat.initiativeOrder.length;
    let attempts = 0;
    while (attempts < combat.initiativeOrder.length) {
      const next = combat.initiativeOrder[nextIndex];
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

    setCombat({
      ...combat,
      currentTurnIndex: nextIndex,
      roundNumber: nextIndex <= combat.currentTurnIndex ? combat.roundNumber + 1 : combat.roundNumber,
      turnResources: { actionUsed: false, bonusActionUsed: false, movementUsed: false },
      dodging: newDodging,
    });
  }

  /** Helper: mark resources used + advance if both action and movement spent */
  function finishAction(combatUpdate: Partial<typeof state.combat>) {
    if (!state.combat) return;
    const updated = { ...state.combat, ...combatUpdate };
    if (updated.turnResources.actionUsed && updated.turnResources.movementUsed) {
      advanceTurn(updated as typeof state.combat);
    } else {
      setCombat(updated as typeof state.combat);
    }
  }

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

      const sameZone = aliveChars.filter(c => c.zone === enemy.zone);
      const target = sameZone.length > 0 ? sameZone[0] : aliveChars[0];
      const inMelee = target.zone === enemy.zone;
      const action = inMelee
        ? enemy.actions.find(a => a.reach === 'melee') || enemy.actions[0]
        : enemy.actions.find(a => a.reach === 'any') || enemy.actions[0];
      if (!action?.toHit) { advanceTurn(); return; }

      const isDodging = state.combat!.dodging.includes(target.id);
      const roll1 = rollD20(), roll2 = isDodging ? rollD20() : roll1;
      const attackRoll = isDodging ? Math.min(roll1, roll2) : roll1;
      const total = attackRoll + action.toHit;
      const isCrit = attackRoll === 20;
      const tag = isDodging ? ' (disadvantage)' : '';

      if (attackRoll === 1 || total < target.ac) {
        addLog(`${enemy.name} attacks ${target.name} with ${action.name} — ${total} vs AC ${target.ac}${tag} — Miss!`, 'combat');
      } else {
        let damage = action.damage ? rollDice(action.damage) : 0;
        if (isCrit) damage = Math.floor(damage * 1.5);
        addLog(`${enemy.name} attacks ${target.name} — ${isCrit ? 'CRIT! ' : ''}${total} vs AC ${target.ac}${tag} — ${damage} ${action.damageType || ''} damage`, 'combat');
        const newHp = Math.max(0, target.hp - damage);
        updateCharacter(target.id, { hp: newHp, isAlive: newHp > 0 });
        updateStats({ totalDamageTaken: state.stats.totalDamageTaken + damage });
        if (newHp <= 0) {
          addLog(`${target.name} has fallen!`, 'death');
          updateStats({ charactersLost: state.stats.charactersLost + 1 });
          if (state.party.filter(c => c.isAlive && c.id !== target.id).length === 0) {
            addLog('Total Party Kill!', 'death'); setPhase('game-over'); return;
          }
        }
      }
      advanceTurn();
    }, 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.combat?.currentTurnIndex, state.combat?.roundNumber]);

  // ─── Player Actions ────────────────────────────────────────

  function handleAttack(targetId: string) {
    if (!activeCharacter || !state.combat) return;
    const target = state.combat.enemies.find(e => e.id === targetId);
    if (!target) return;

    const weapon = activeCharacter.equipment.weapon;
    const strMod_ = statMod(activeCharacter.stats.str);
    const dexMod_ = statMod(activeCharacter.stats.dex);
    const isRanged = ['longbow', 'shortbow'].includes(weapon);
    const isFinesse = ['shortsword', 'dagger'].includes(weapon);
    const mod = isRanged ? dexMod_ : isFinesse ? Math.max(strMod_, dexMod_) : strMod_;
    const toHit = mod + 2;
    const damageType = getWeaponDamageType(weapon);

    const attackRoll = rollD20();
    const total = attackRoll + toHit;
    const isCrit = attackRoll === 20;
    let damageDealt = 0;

    if (attackRoll === 1) {
      addLog(`${activeCharacter.name} attacks ${target.name} — Natural 1! Critical miss!`, 'combat');
    } else if (total < target.ac) {
      addLog(`${activeCharacter.name} attacks ${target.name} — ${total} vs AC ${target.ac} — Miss!`, 'combat');
    } else {
      let damage = rollDice(getWeaponDice(weapon)) + mod;
      if (isCrit) damage += rollDice(getWeaponDice(weapon));

      if (target.damageVulnerabilities.includes(damageType)) { damage *= 2; addLog(`${activeCharacter.name} attacks ${target.name} — ${isCrit ? 'CRIT! ' : ''}${total} vs AC ${target.ac} — ${damage} ${damageType} (VULNERABLE!)`, 'combat'); }
      else if (target.damageImmunities.includes(damageType)) { damage = 0; addLog(`${activeCharacter.name} attacks ${target.name} — IMMUNE to ${damageType}!`, 'combat'); }
      else if (target.damageResistances.some(r => r.includes(damageType))) { damage = Math.floor(damage / 2); addLog(`${activeCharacter.name} attacks ${target.name} — ${total} vs AC ${target.ac} — ${damage} ${damageType} (resisted)`, 'combat'); }
      else { addLog(`${activeCharacter.name} attacks ${target.name} — ${isCrit ? 'CRIT! ' : ''}${total} vs AC ${target.ac} — ${damage} ${damageType}`, 'combat'); }

      damageDealt = damage;
      const newHp = Math.max(0, target.hp - damage);
      const newEnemies = state.combat.enemies.map(e => e.id === targetId ? { ...e, hp: newHp, isAlive: newHp > 0 } : e);
      if (newHp <= 0) { addLog(`${target.name} is defeated!`, 'death'); updateStats({ enemiesKilled: state.stats.enemiesKilled + 1 }); }
      updateStats({ totalDamageDealt: state.stats.totalDamageDealt + damageDealt });
      finishAction({ enemies: newEnemies, turnResources: { ...state.combat.turnResources, actionUsed: true } });
      return;
    }
    finishAction({ turnResources: { ...state.combat.turnResources, actionUsed: true } });
  }

  function handleCast(spellIndex: string, targetId: string) {
    if (!activeCharacter || !state.combat || !activeCharacter.spellcasting) return;
    const meta = spellMeta[spellIndex];
    if (!meta) return;
    const sc = activeCharacter.spellcasting;
    const isCantrip = meta.level === 0;
    const isHealing = meta.damageType === 'healing';
    const name = spellIndex.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    if (!isCantrip) updateCharacter(activeCharacter.id, { spellcasting: { ...sc, slotsUsed: sc.slotsUsed + 1 } });

    if (isHealing) {
      const ally = state.party.find(c => c.id === targetId);
      if (!ally) return;
      const modVal = Math.floor((activeCharacter.stats[sc.ability.toLowerCase() as keyof typeof activeCharacter.stats] - 10) / 2);
      const heal = rollDice(meta.damage?.replace(/\+\s*mod/i, '').trim() || '1d8') + modVal;
      const newHp = Math.min(ally.maxHp, ally.hp + heal);
      updateCharacter(ally.id, { hp: newHp });
      addLog(`${activeCharacter.name} casts ${name} on ${ally.name} — heals ${heal} HP (${ally.hp}→${newHp})`, 'combat');
    } else if (meta.damageType) {
      const target = state.combat.enemies.find(e => e.id === targetId);
      if (!target) return;
      const isAutoHit = spellIndex === 'magic-missile';
      let hit = true, isCrit = false;

      if (!isAutoHit) {
        const roll = rollD20(); const total = roll + sc.spellAttackBonus;
        isCrit = roll === 20; hit = roll !== 1 && (isCrit || total >= target.ac);
        if (!hit) addLog(`${activeCharacter.name} casts ${name} at ${target.name} — ${total} vs AC ${target.ac} — Miss!`, 'combat');
      }

      if (hit) {
        let damage = rollDice((meta.damage || '1d6').replace(/[×x].*/, '').trim());
        if (isCrit) damage += rollDice((meta.damage || '1d6').replace(/[×x].*/, '').trim());
        if (spellIndex === 'magic-missile') damage *= 3;

        if (target.damageVulnerabilities.includes(meta.damageType)) damage *= 2;
        else if (target.damageImmunities.includes(meta.damageType)) damage = 0;

        addLog(`${activeCharacter.name} casts ${name} at ${target.name} — ${damage} ${meta.damageType}${damage === 0 ? ' (IMMUNE!)' : ''}`, 'combat');

        const newHp = Math.max(0, target.hp - damage);
        const newEnemies = state.combat.enemies.map(e => e.id === targetId ? { ...e, hp: newHp, isAlive: newHp > 0 } : e);
        if (newHp <= 0) { addLog(`${target.name} is defeated!`, 'death'); updateStats({ enemiesKilled: state.stats.enemiesKilled + 1 }); }
        updateStats({ totalDamageDealt: state.stats.totalDamageDealt + damage });
        finishAction({ enemies: newEnemies, turnResources: { ...state.combat.turnResources, actionUsed: true } });
        return;
      }
    } else {
      addLog(`${activeCharacter.name} casts ${name}.`, 'combat');
    }
    finishAction({ turnResources: { ...state.combat.turnResources, actionUsed: true } });
  }

  function handleDefend() {
    if (!activeCharacter || !state.combat) return;
    addLog(`${activeCharacter.name} takes the Dodge action — attacks against them have disadvantage.`, 'combat');
    finishAction({
      dodging: [...state.combat.dodging, activeCharacter.id],
      turnResources: { ...state.combat.turnResources, actionUsed: true },
    });
  }

  function handleUseItem(itemId: string, targetId: string) {
    if (!activeCharacter || !state.combat) return;
    const idx = activeCharacter.consumables.findIndex(c => c.id === itemId);
    if (idx === -1 || activeCharacter.consumables[idx].quantity <= 0) return;
    const item = activeCharacter.consumables[idx];
    const target = state.party.find(c => c.id === targetId);
    if (!target) return;

    const heal = rollDice('2d4') + 2;
    const newHp = Math.min(target.maxHp, target.hp + heal);
    updateCharacter(target.id, { hp: newHp });
    const newConsumables = [...activeCharacter.consumables];
    newConsumables[idx] = { ...item, quantity: item.quantity - 1 };
    updateCharacter(activeCharacter.id, { consumables: newConsumables });
    addLog(`${activeCharacter.name} uses ${item.name}${activeCharacter.id === targetId ? '' : ` on ${target.name}`} — heals ${heal} HP`, 'combat');
    finishAction({ turnResources: { ...state.combat.turnResources, actionUsed: true } });
  }

  function handleBonusAction(actionId: string) {
    if (!activeCharacter || !state.combat) return;
    if (actionId === 'second-wind') {
      const heal = rollDice('1d10') + activeCharacter.level;
      const newHp = Math.min(activeCharacter.maxHp, activeCharacter.hp + heal);
      updateCharacter(activeCharacter.id, {
        hp: newHp,
        featureUses: { ...activeCharacter.featureUses, 'second-wind': { ...activeCharacter.featureUses['second-wind'], used: activeCharacter.featureUses['second-wind'].used + 1 } },
      });
      addLog(`${activeCharacter.name} uses Second Wind — heals ${heal} HP (${activeCharacter.hp}→${newHp})`, 'combat');
    }
    if (actionId === 'rage') {
      updateCharacter(activeCharacter.id, {
        featureUses: { ...activeCharacter.featureUses, 'rage': { ...activeCharacter.featureUses['rage'], used: activeCharacter.featureUses['rage'].used + 1 } },
        statusEffects: [...activeCharacter.statusEffects, 'raging'],
      });
      addLog(`${activeCharacter.name} enters a Rage!`, 'combat');
    }
    setCombat({ ...state.combat, turnResources: { ...state.combat.turnResources, bonusActionUsed: true } });
  }

  function handleMove(zone: Zone) {
    if (!activeCharacter || !state.combat) return;
    updateCharacter(activeCharacter.id, { zone });
    addLog(`${activeCharacter.name} moves to ${zoneLabel(zone)}.`, 'combat');
    finishAction({ turnResources: { ...state.combat.turnResources, movementUsed: true } });
  }

  function handleEndTurn() { advanceTurn(); }

  function handleSelectTarget(id: string, type: 'character' | 'enemy') {
    setInspectType(type);
    if (type === 'character') setInspecting(state.party.find(c => c.id === id) || null);
    else if (state.combat) setInspecting(state.combat.enemies.find(e => e.id === id) || null);
  }

  // ─── Render ────────────────────────────────────────────────

  if (state.party.length === 0) {
    return <div className="flex items-center justify-center min-h-dvh bg-[var(--surface)]">
      <p className="text-body-md text-[var(--on-surface-variant)]">Loading party...</p>
    </div>;
  }

  return (
    <div className="flex flex-col h-dvh bg-[var(--surface)] overflow-hidden">
      <header className="flex items-center justify-between px-[var(--space-4)] py-[var(--space-2)] bg-[var(--surface-1)] border-b border-[var(--outline-subtle)]">
        <div className="flex items-center gap-[var(--space-3)]">
          <span className="font-[family-name:var(--font-heading)] text-label-md tracking-[0.1em] uppercase text-[var(--primary)]">Party Wipe</span>
          <span className="text-label-sm text-[var(--on-surface-variant)]">Floor {state.floor} · Room {state.roomNumber}</span>
        </div>
      </header>

      {state.combat && <InitiativeBar />}

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex flex-col gap-[var(--space-2)] w-[200px] shrink-0 p-[var(--space-3)] bg-[var(--surface-1)] border-r border-[var(--outline-subtle)] overflow-y-auto">
          {state.party.map((char) => (
            <PartyToken key={char.id} char={char} isActive={char.id === currentEntity?.id}
              onClick={() => handleSelectTarget(char.id, 'character')} />
          ))}
        </aside>

        <main className="flex-1 overflow-hidden relative">
          {state.phase === 'combat' && state.combat ? (
            <ZoneLayout onSelectTarget={handleSelectTarget} />
          ) : state.phase === 'game-over' ? (
            <div className="flex flex-col items-center justify-center h-full gap-[var(--space-6)]">
              <GameIcon category="ui" name="death" size="xl" className="text-[var(--error)]" />
              <h2 className="font-[family-name:var(--font-heading)] text-title-lg text-[var(--error)] tracking-[0.1em] uppercase">Total Party Kill</h2>
              <div className="text-body-sm text-[var(--on-surface-variant)] text-center">
                <p>Enemies killed: {state.stats.enemiesKilled}</p>
                <p>Damage dealt: {state.stats.totalDamageDealt}</p>
                <p>Damage taken: {state.stats.totalDamageTaken}</p>
              </div>
              <Button onClick={() => window.location.href = '/draft'}>Try Again</Button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--on-surface-variant)]">Loading combat...</div>
          )}
          <GameLog />
        </main>
      </div>

      {state.phase === 'combat' && isPlayerTurn && activeCharacter && (
        <ActionBar onAttack={handleAttack} onCast={handleCast} onDefend={handleDefend}
          onUseItem={handleUseItem} onBonusAction={handleBonusAction} onMove={handleMove} onEndTurn={handleEndTurn} />
      )}

      <Sheet open={!!inspecting} onOpenChange={(open) => !open && setInspecting(null)}>
        <SheetContent side="right" size="lg" className="overflow-y-auto">
          {inspecting && inspectType === 'character' && (
            <>
              <SheetHeader>
                <CreatureHeader iconCategory="class" iconName={(inspecting as Character).classIndex}
                  name={inspecting.name} level={(inspecting as Character).level} />
              </SheetHeader>
              <div className="flex flex-col gap-[var(--space-4)] mt-[var(--space-4)]">
                <div className="flex items-center gap-[var(--space-3)]">
                  <AcShield value={inspecting.ac} size="md" />
                  <HealthBar current={inspecting.hp} max={inspecting.maxHp} size="md" className="flex-1" />
                </div>
                <StatRow stats={inspecting.stats} proficientSaves={(inspecting as Character).savingThrows} />
              </div>
            </>
          )}
          {inspecting && inspectType === 'enemy' && (
            <>
              <SheetHeader>
                <CreatureHeader iconCategory="monster" iconName={(inspecting as Enemy).type}
                  name={inspecting.name} type={(inspecting as Enemy).type} cr={(inspecting as Enemy).cr} />
              </SheetHeader>
              <div className="flex flex-col gap-[var(--space-4)] mt-[var(--space-4)]">
                <div className="flex items-center gap-[var(--space-3)]">
                  <AcShield value={inspecting.ac} size="md" />
                  <HealthBar current={inspecting.hp} max={inspecting.maxHp} size="md" className="flex-1" />
                </div>
                <StatRow stats={inspecting.stats} />
                <ResistanceRow resistances={(inspecting as Enemy).damageResistances}
                  immunities={(inspecting as Enemy).damageImmunities} vulnerabilities={(inspecting as Enemy).damageVulnerabilities} />
                <div className="flex flex-col gap-[var(--space-2)]">
                  <h4 className="text-label-md uppercase tracking-[0.08em] text-[var(--on-surface-variant)]">Actions</h4>
                  {(inspecting as Enemy).actions.map((a) => (
                    <AttackLine key={a.name} iconName="sword" label={a.name}
                      toHit={a.toHit || 0} damage={a.damage || ''} damageType={a.damageType} zone={a.reach} />
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
