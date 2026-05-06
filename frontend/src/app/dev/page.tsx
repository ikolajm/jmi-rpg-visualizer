'use client';

import React, { useState } from 'react';
import { GameProvider, useGame } from '@/components/providers/GameProvider';
import { useCombat } from '@/hooks/useCombat';
import { classBuilds } from '@/data/classes';
import { generateRoom } from '@/data/room-generator';
import { generateEncounter } from '@/data/encounter-generator';
import { generateLootChoices } from '@/data/loot-generator';
import { GameIcon } from '@/components/atoms/GameIcon';
import { Button } from '@/components/atoms/Button';
import { InitiativeBar, ZoneLayout, ActionBar, GameLog, InspectSheet } from '@/components/game';
import type { Character, Enemy, Zone, GamePhase } from '@/data/game-types';
import type { LootItem } from '@/data/loot-generator';
import { statMod } from '@/data/dice';
import { awardXP, checkLevelUp, applyLevelUp, type LevelUpResult } from '@/data/progression';
import { useRest } from '@/hooks/useRest';
import { applyCondition, makeEffectId, type GameCondition } from '@/data/status-effects';
import { FLOOR_MODIFIERS } from '@/data/floor-modifiers';

const PHASES: { id: GamePhase | 'room-preview-boss'; label: string }[] = [
  { id: 'room-preview', label: 'Room Preview' },
  { id: 'room-preview-boss', label: 'Room Preview (Boss)' },
  { id: 'combat', label: 'Combat' },
  { id: 'loot', label: 'Loot' },
  { id: 'rest', label: 'Rest' },
  { id: 'level-up', label: 'Level Up' },
  { id: 'game-over', label: 'Game Over' },
];

function DevHarness() {
  const { state, initParty, setPhase, setRoom, setCombat, addLog, updateCharacter, updateStats, advanceRoom, setFloorModifier } = useGame();
  const [activePhase, setActivePhase] = useState<string>('room-preview');
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [inspectType, setInspectType] = useState<'character' | 'enemy'>('character');
  const [lootChoices, setLootChoices] = useState<LootItem[]>([]);
  const [selectedLoot, setSelectedLoot] = useState<LootItem | null>(null);
  const [levelUpResults, setLevelUpResults] = useState<LevelUpResult[]>([]);
  const { handleFullRest, handleQuickRest, handleTrain } = useRest();

  // Init default party on first load
  React.useEffect(() => {
    if (state.party.length > 0) return;
    const defaults = ['fighter', 'ranger', 'wizard', 'cleric'];
    const builds = defaults.map(idx => classBuilds.find(b => b.index === idx)).filter(Boolean);
    if (builds.length === 4) initParty(builds as typeof classBuilds);
  }, [state.party.length, initParty]);

  function jumpTo(phaseId: string) {
    setActivePhase(phaseId);

    if (phaseId === 'room-preview') {
      const room = generateRoom(state.floor || 1, (state.roomNumber || 0) + 1);
      setRoom(room);
      setPhase('room-preview');
    } else if (phaseId === 'room-preview-boss') {
      const room = generateRoom(1, 5); // boss room
      setRoom(room);
      setPhase('room-preview');
    } else if (phaseId === 'combat') {
      const room = generateRoom(1, 1);
      setRoom(room);
      const zoneMap: Record<string, Zone> = { fighter: 1, rogue: 1, barbarian: 1, ranger: 2, wizard: 3, cleric: 2 };
      state.party.forEach(char => updateCharacter(char.id, { zone: zoneMap[char.classIndex] || 2 }));
      const encounter = generateEncounter(state.floor || 1, 'combat', state.party, 1);
      setCombat(encounter);
      setPhase('combat');
      addLog('Dev: Combat started.', 'system');
    } else if (phaseId === 'loot') {
      const choices = generateLootChoices(state.floor || 1);
      setLootChoices(choices);
      setSelectedLoot(null);
      setPhase('loot');
    } else if (phaseId === 'rest') {
      const room = generateRoom(1, 2);
      room.type = 'rest';
      room.flavorText = 'A quiet alcove, untouched by corruption. The party catches their breath.';
      setRoom(room);
      setPhase('rest');
    } else if (phaseId === 'level-up') {
      // Force XP and apply level-ups
      const results: LevelUpResult[] = [];
      for (const c of state.party) {
        if (!c.isAlive) continue;
        updateCharacter(c.id, { xp: 300 });
        const result = applyLevelUp({ ...c, xp: 300 });
        updateCharacter(c.id, result.character);
        results.push(result);
      }
      setLevelUpResults(results);
      setPhase('level-up');
    } else if (phaseId === 'game-over') {
      updateStats({ roomsCleared: 7, enemiesKilled: 12, totalDamageDealt: 340, totalDamageTaken: 180 });
      setPhase('game-over');
    }
  }

  // ─── Handlers (same as game page) ─────────────────────────────

  const handleVictory = React.useCallback((defeatedEnemies: Enemy[]) => {
    const xpTotal = defeatedEnemies.reduce((sum, e) => sum + (e.xp || 0), 0);
    const updatedParty = awardXP(state.party, xpTotal);
    const aliveCount = updatedParty.filter(c => c.isAlive).length;
    if (aliveCount > 0) {
      const xpEach = Math.floor(xpTotal / aliveCount);
      addLog(`Party gains ${xpTotal} XP (${xpEach} each).`, 'system');
    }
    updatedParty.forEach(c => updateCharacter(c.id, { xp: c.xp }));
    addLog('Dev: Victory! Use nav to jump to next phase.', 'system');
    setPhase('room-preview');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.party]);

  const combat = useCombat({ onVictory: handleVictory });

  function handleLootPick(item: LootItem, charId: string) {
    const char = state.party.find(c => c.id === charId);
    if (!char) return;
    if (item.category === 'weapon' && item.damage) {
      updateCharacter(charId, {
        equipment: {
          ...char.equipment,
          weapon: { index: item.index, name: item.name, damage: item.damage, damageType: item.damageType || 'slashing', weaponRange: item.weaponRange || 'melee', properties: item.properties || [], onHit: item.onHit },
        },
      });
      addLog(`${char.name} equips ${item.name}.`, 'loot');
    } else if (item.category === 'armor' && item.acBase !== undefined) {
      const dexMod = statMod(char.stats.dex);
      const dexBonus = item.acDexCap !== undefined ? Math.min(dexMod, item.acDexCap) : dexMod;
      const newAc = item.acBase + dexBonus + (char.equipment.shield ? 2 : 0);
      updateCharacter(charId, {
        ac: newAc, acSource: item.name,
        equipment: { ...char.equipment, armor: { index: item.index, name: item.name, acBase: item.acBase, acDexCap: item.acDexCap } },
      });
      addLog(`${char.name} equips ${item.name}. AC is now ${newAc}.`, 'loot');
    } else if (item.category === 'consumable') {
      const existing = char.consumables.find(c => c.id === item.index);
      if (existing) {
        updateCharacter(charId, { consumables: char.consumables.map(c => c.id === item.index ? { ...c, quantity: c.quantity + 1 } : c) });
      } else {
        updateCharacter(charId, { consumables: [...char.consumables, { id: item.index, name: item.name, quantity: 1, effect: 'heal', value: 7 }] });
      }
      addLog(`${char.name} receives ${item.name}.`, 'loot');
    }
    setLootChoices([]);
    setSelectedLoot(null);
  }

  function handleLevelUpDismiss() {
    setLevelUpResults([]);
  }

  const inspecting: Character | Enemy | null = inspectId
    ? (inspectType === 'character'
      ? state.party.find(c => c.id === inspectId) || null
      : state.combat?.enemies.find(e => e.id === inspectId) || null)
    : null;

  function handleSelectTarget(id: string, type: 'character' | 'enemy') {
    setInspectType(type);
    setInspectId(id);
  }

  const roomIcon = (type: string) => {
    const map: Record<string, string> = { combat: 'combat', elite_combat: 'combat', boss: 'boss', rest: 'rest', treasure: 'treasure', trap: 'trap' };
    return map[type] || 'combat';
  };

  if (state.party.length === 0) {
    return <div className="flex items-center justify-center min-h-dvh bg-surface"><p className="text-body-md text-on-surface-variant">Loading...</p></div>;
  }

  return (
    <div className="relative h-dvh bg-surface overflow-hidden">

      {/* ─── Dev Nav Bar ─────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center gap-1 px-3 py-2 bg-black/80 backdrop-blur-sm overflow-x-auto">
        <span className="text-[10px] text-primary font-semibold uppercase tracking-wider mr-2 shrink-0">DEV</span>
        {PHASES.map(p => (
          <button key={p.id} onClick={() => jumpTo(p.id)}
            className={`text-[11px] px-2 py-1 rounded-full shrink-0 transition-colors
              ${activePhase === p.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-2'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ─── Dev Condition Injector (combat only) ──────── */}
      {state.phase === 'combat' && state.combat && (
        <div className="absolute top-10 left-0 right-0 z-50 flex items-center gap-1 px-3 py-1.5 bg-black/70 backdrop-blur-sm overflow-x-auto">
          <span className="text-[9px] text-error font-semibold uppercase tracking-wider mr-2 shrink-0">Inflict</span>
          {(['paralyzed', 'unconscious', 'restrained', 'poisoned', 'frightened', 'prone', 'petrified', 'burning', 'frozen', 'commanded', 'staggered', 'hunterMarked'] as GameCondition[]).map(cond => (
            <button key={cond} onClick={() => {
              // Apply to first alive enemy
              const target = state.combat!.enemies.find(e => e.isAlive);
              if (!target) return;
              const effect = {
                id: makeEffectId(), name: cond, condition: cond,
                sourceId: state.party[0]?.id || 'dev', targetId: target.id,
                turnsRemaining: cond === 'unconscious' ? 10 : cond === 'staggered' ? 1 : cond === 'commanded' ? 1 : -1,
                ...(cond === 'paralyzed' ? { saveDC: 12, saveAbility: 'wis' } : {}),
                ...(cond === 'restrained' ? { saveDC: 12, saveAbility: 'dex' } : {}),
                ...(cond === 'shielded' ? { value: 5 } : {}),
                ...(cond === 'spiritGuarded' ? { damagePerTurn: '3d8', damageType: 'radiant', saveDC: 12, saveAbility: 'wis' } : {}),
                ...(cond === 'burning' ? { damagePerTurn: '1d6', damageType: 'fire', turnsRemaining: 3 } : {}),
              };
              const { effects: newEffects, applied, reason } = applyCondition(state.combat!.activeEffects, effect);
              if (applied) {
                setCombat({ ...state.combat!, activeEffects: newEffects });
                addLog(`DEV: Applied ${cond} to ${target.name}${reason === 'refreshed' ? ' (refreshed)' : ''}`, 'system');
              } else {
                addLog(`DEV: ${target.name} already ${reason || 'affected'}`, 'system');
              }
            }}
              className="text-[10px] px-2 py-0.5 rounded-full shrink-0 text-error hover:bg-error/20 transition-colors"
            >
              {cond}
            </button>
          ))}
          <span className="text-[9px] text-primary font-semibold uppercase tracking-wider mx-2 shrink-0">Buff Ally</span>
          {(['blessed', 'shielded', 'spiritGuarded'] as GameCondition[]).map(cond => (
            <button key={`ally-${cond}`} onClick={() => {
              const target = state.party.find(c => c.isAlive);
              if (!target) return;
              const effect = {
                id: makeEffectId(), name: cond, condition: cond,
                sourceId: 'dev', targetId: target.id, turnsRemaining: -1,
                ...(cond === 'shielded' ? { value: 2 } : {}),
              };
              const { effects: newEffects, applied, reason } = applyCondition(state.combat!.activeEffects, effect);
              if (applied) {
                setCombat({ ...state.combat!, activeEffects: newEffects });
                addLog(`DEV: Applied ${cond} to ${target.name}${reason === 'refreshed' ? ' (refreshed)' : ''}`, 'system');
              } else {
                addLog(`DEV: ${target.name} already ${reason || 'affected'}`, 'system');
              }
            }}
              className="text-[10px] px-2 py-0.5 rounded-full shrink-0 text-primary hover:bg-primary/20 transition-colors"
            >
              {cond}
            </button>
          ))}
          <button onClick={() => {
            setCombat({ ...state.combat!, activeEffects: [] });
            addLog('DEV: Cleared all effects', 'system');
          }} className="text-[10px] px-2 py-0.5 rounded-full shrink-0 text-on-surface-variant hover:bg-surface-2 transition-colors ml-auto">
            Clear All
          </button>
        </div>
      )}

      {/* ─── Dev Floor Modifier Selector ────────────────── */}
      <div className="absolute top-[calc(2.25rem)] left-0 right-0 z-40 flex items-center gap-1 px-3 py-1 bg-black/60 backdrop-blur-sm overflow-x-auto">
        <span className="text-[9px] text-primary font-semibold uppercase tracking-wider mr-2 shrink-0">Floor Mod</span>
        <button onClick={() => { setFloorModifier(null); addLog('DEV: Cleared floor modifier', 'system'); }}
          className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 transition-colors ${!state.floorModifier ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-2'}`}>
          None
        </button>
        {FLOOR_MODIFIERS.map(m => (
          <button key={m.id} onClick={() => { setFloorModifier(m); addLog(`DEV: Set floor modifier — ${m.name}`, 'system'); }}
            className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 transition-colors ${state.floorModifier?.id === m.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-2'}`}>
            {m.name}
          </button>
        ))}
      </div>

      {/* ─── Phase Content (offset for nav bar) ──────────── */}
      <div className={`h-full ${state.phase === 'combat' ? 'pt-[72px]' : 'pt-10'}`}>

        {/* Combat */}
        {state.phase === 'combat' && state.combat && (
          <ZoneLayout onSelectTarget={handleSelectTarget} />
        )}

        {/* Room Preview */}
        {state.phase === 'room-preview' && state.currentRoom && (
          <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
            <GameIcon category="room" name={roomIcon(state.currentRoom.type)} size="xl" className="text-primary" />
            <h2 className="font-[family-name:var(--font-heading)] text-title-lg text-on-surface tracking-[0.1em] uppercase">
              {state.currentRoom.type === 'elite_combat' ? 'Elite Combat' : state.currentRoom.type.replace('_', ' ')}
            </h2>
            <p className="text-body-md text-on-surface-variant text-center max-w-md italic">
              {state.currentRoom.flavorText}
            </p>
            <p className="text-label-sm text-on-surface-variant">Floor {state.currentRoom.floor} · Room {state.currentRoom.roomNumber}</p>
            <Button onClick={() => jumpTo('combat')}>Enter Room</Button>
          </div>
        )}

        {/* Loot */}
        {state.phase === 'loot' && (
          <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
            <h2 className="font-[family-name:var(--font-heading)] text-title-lg text-primary tracking-[0.1em] uppercase">
              Choose Your Loot
            </h2>
            <div className="flex gap-4 flex-wrap justify-center">
              {lootChoices.map((item) => (
                <button key={item.index} onClick={() => setSelectedLoot(item)}
                  className={`flex flex-col items-start gap-2 p-4 rounded-card bg-surface-2 border-2 transition-colors w-52
                    ${selectedLoot?.index === item.index ? 'border-primary' : 'border-outline-subtle hover:border-outline'}`}
                >
                  <span className="text-label-md text-on-surface-variant uppercase tracking-wider">{item.rarity}</span>
                  <span className="text-body-md text-on-surface font-semibold">{item.name}</span>
                  <span className="text-label-sm text-on-surface-variant capitalize">{item.category}</span>
                  {item.damage && <span className="text-label-sm text-on-surface-variant">{item.damage} {item.damageType}</span>}
                  {item.acBase !== undefined && <span className="text-label-sm text-on-surface-variant">AC {item.acBase}</span>}
                </button>
              ))}
            </div>
            {selectedLoot && (
              <div className="flex gap-3 flex-wrap justify-center">
                <p className="text-body-sm text-on-surface-variant w-full text-center">Assign to:</p>
                {state.party.filter(c => c.isAlive).map(c => (
                  <Button key={c.id} onClick={() => handleLootPick(selectedLoot, c.id)}>{c.name}</Button>
                ))}
              </div>
            )}
            <button onClick={() => { setLootChoices([]); setSelectedLoot(null); }}
              className="text-label-md text-on-surface-variant hover:text-on-surface underline">Skip</button>
          </div>
        )}

        {/* Rest */}
        {state.phase === 'rest' && (
          <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
            <GameIcon category="room" name="rest" size="xl" className="text-primary" />
            <h2 className="font-[family-name:var(--font-heading)] text-title-lg text-on-surface tracking-[0.1em] uppercase">Rest</h2>
            <p className="text-body-md text-on-surface-variant text-center max-w-md italic">
              {state.currentRoom?.flavorText || 'A moment of respite.'}
            </p>

            <div className="flex gap-4 flex-wrap justify-center">
              <button onClick={handleFullRest}
                className="flex flex-col items-start gap-2 p-4 rounded-card bg-surface-2 border-2 border-outline-subtle hover:border-primary transition-colors w-56 text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Full Rest</span>
                <span className="text-body-md text-on-surface font-semibold">Deep Recovery</span>
                <ul className="text-label-sm text-on-surface-variant space-y-1">
                  <li>Heal 50% max HP</li>
                  <li>Restore all spell slots</li>
                  <li>Reset all abilities</li>
                </ul>
              </button>

              <button onClick={handleQuickRest}
                className="flex flex-col items-start gap-2 p-4 rounded-card bg-surface-2 border-2 border-outline-subtle hover:border-primary transition-colors w-56 text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">Quick Rest</span>
                <span className="text-body-md text-on-surface font-semibold">Brief Respite</span>
                <ul className="text-label-sm text-on-surface-variant space-y-1">
                  <li>Heal 25% max HP</li>
                  <li>Restore 1 spell slot</li>
                  <li>Reset all abilities</li>
                </ul>
              </button>

              <button onClick={handleTrain}
                className="flex flex-col items-start gap-2 p-4 rounded-card bg-surface-2 border-2 border-outline-subtle hover:border-primary transition-colors w-56 text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-error">Train</span>
                <span className="text-body-md text-on-surface font-semibold">Hone Your Edge</span>
                <ul className="text-label-sm text-on-surface-variant space-y-1">
                  <li>No healing</li>
                  <li>No spell slot restore</li>
                  <li className="text-primary font-semibold">+3 primary stat until next rest</li>
                </ul>
              </button>
            </div>
          </div>
        )}

        {/* Level-Up Recap */}
        {state.phase === 'level-up' && levelUpResults.length > 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
            <h2 className="font-[family-name:var(--font-heading)] text-title-lg text-primary tracking-[0.1em] uppercase">Level Up!</h2>
            <div className="flex flex-col gap-4 w-full max-w-lg">
              {levelUpResults.map((r) => {
                const formatSpell = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                return (
                  <div key={r.character.id} className="flex items-start gap-3 p-4 rounded-card bg-surface-2">
                    <GameIcon category="class" name={r.character.classIndex} size="lg" className="text-primary shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-body-md font-semibold text-on-surface">{r.character.name}</span>
                        <span className="text-label-sm text-primary">Level {r.newLevel}</span>
                      </div>
                      <span className="text-body-sm text-on-surface-variant">
                        +{r.hpGained} HP ({r.character.maxHp - r.hpGained} → {r.character.maxHp})
                      </span>
                      {r.statBoost && (
                        <span className="text-body-sm text-primary">+{r.statBoost.amount} {r.statBoost.stat}</span>
                      )}
                      {r.newFeatures.length > 0 && (
                        <span className="text-body-sm text-on-surface-variant">New: {r.newFeatures.join(', ')}</span>
                      )}
                      {r.newSpells.length > 0 && (
                        <span className="text-body-sm text-on-surface-variant">Spells: {r.newSpells.map(formatSpell).join(', ')}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <Button onClick={handleLevelUpDismiss}>Continue</Button>
          </div>
        )}

        {/* Game Over */}
        {state.phase === 'game-over' && (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <GameIcon category="ui" name="death" size="xl" className="text-error" />
            <h2 className="font-[family-name:var(--font-heading)] text-title-lg text-error tracking-[0.1em] uppercase">Total Party Kill</h2>
            <div className="text-body-sm text-on-surface-variant text-center">
              <p>Rooms cleared: {state.stats.roomsCleared}</p>
              <p>Floor reached: {state.floor}</p>
              <p>Enemies killed: {state.stats.enemiesKilled}</p>
              <p>Damage dealt: {state.stats.totalDamageDealt}</p>
              <p>Damage taken: {state.stats.totalDamageTaken}</p>
            </div>
            <Button onClick={() => window.location.href = '/draft'}>Try Again</Button>
          </div>
        )}
      </div>

      {/* ─── HUD Overlays ────────────────────────────────── */}
      <div className="absolute top-12 left-3 z-20">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm">
          <span className="font-[family-name:var(--font-heading)] text-[10px] tracking-[0.1em] uppercase text-primary">Party Wipe</span>
          <span className="text-[10px] text-on-surface-variant">F{state.floor} · R{state.roomNumber}</span>
        </div>
      </div>

      {state.combat && <InitiativeBar />}
      <GameLog />

      {state.phase === 'combat' && combat.isPlayerTurn && combat.activeCharacter && (
        <ActionBar
          onAttack={combat.handleAttack}
          onCast={combat.handleCast}
          onDefend={combat.handleDefend}
          onUseItem={combat.handleUseItem}
          onBonusAction={combat.handleBonusAction}
          onMove={combat.handleMove}
          onEndTurn={() => combat.advanceTurn()}
        />
      )}

      <InspectSheet inspecting={inspecting} inspectType={inspectType} onClose={() => setInspectId(null)} />
    </div>
  );
}

export default function DevPage() {
  return (
    <GameProvider>
      <DevHarness />
    </GameProvider>
  );
}
