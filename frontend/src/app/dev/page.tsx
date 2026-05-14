'use client';

import React, { useState } from 'react';
import { GameProvider, useGame } from '@/components/providers/GameProvider';
import { useCombat } from '@/hooks/useCombat';
import { classBuilds } from '@/data/classes';
import { generateRoom } from '@/data/room-generator';
import { generateEncounter } from '@/data/encounter-generator';
import { generateLootChoices } from '@/data/loot-generator';
import { InitiativeBar, ZoneLayout, ActionBar, GameLog, InspectSheet } from '@/components/game';
import { RoomPreview } from '@/components/game/RoomPreview';
import { LootScreen } from '@/components/game/LootScreen';
import { LevelUpScreen } from '@/components/game/LevelUpScreen';
import { RestScreen } from '@/components/game/RestScreen';
import { GameOverScreen } from '@/components/game/GameOverScreen';
import { CombatFeedback } from '@/components/game/CombatFeedback';
import { CombatOverlays } from '@/components/game/CombatOverlays';
import { PhaseBanner } from '@/components/game/PhaseBanner';
import type { Character, Enemy, Zone, GamePhase } from '@/data/game-types';
import type { LootItem } from '@/data/loot-generator';
import { statMod } from '@/data/dice';
import { awardXP, applyLevelUp, XP_THRESHOLDS, type LevelUpResult } from '@/data/progression';
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
  const { state, initParty, setPhase, setRoom, setCombat, addLog, updateCharacter, updateStats, setFloorModifier } = useGame();
  const [activePhase, setActivePhase] = useState<string>('room-preview');
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [inspectType, setInspectType] = useState<'character' | 'enemy'>('character');
  const [lootChoices, setLootChoices] = useState<LootItem[]>([]);
  const [, setSelectedLoot] = useState<LootItem | null>(null);
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
      // Force level-up: repeatedly apply until all characters gain a level
      const results: LevelUpResult[] = [];
      for (const c of state.party) {
        if (!c.isAlive) continue;
        // Give enough XP to guarantee next level, then apply
        const char = { ...c, xp: (XP_THRESHOLDS[c.level + 1] || 999999) };
        const result = applyLevelUp(char);
        updateCharacter(c.id, { ...result.character, xp: char.xp });
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


  if (state.party.length === 0) {
    return <div className="flex items-center justify-center min-h-dvh bg-surface"><p className="text-body-md text-on-surface-variant">Loading...</p></div>;
  }

  return (
    <div className="relative h-dvh bg-surface overflow-hidden">

      {/* ─── Dev Nav Bar ─────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center gap-1 px-3 py-2 bg-black/80 backdrop-blur-sm overflow-x-auto">
        <span className="text-label-sm text-primary font-semibold uppercase tracking-wider mr-2 shrink-0">DEV</span>
        {PHASES.map(p => (
          <button key={p.id} onClick={() => jumpTo(p.id)}
            className={`text-label-sm px-2 py-1 rounded-full shrink-0 transition-colors
              ${activePhase === p.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-2'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ─── Dev Condition Injector (combat only) ──────── */}
      {state.phase === 'combat' && state.combat && (
        <div className="absolute top-10 left-0 right-0 z-50 flex items-center gap-1 px-3 py-1.5 bg-black/70 backdrop-blur-sm overflow-x-auto">
          <span className="text-label-sm text-error font-semibold uppercase tracking-wider mr-2 shrink-0">Inflict</span>
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
              className="text-label-sm px-2 py-0.5 rounded-full shrink-0 text-error hover:bg-error/20 transition-colors"
            >
              {cond}
            </button>
          ))}
          <span className="text-label-sm text-primary font-semibold uppercase tracking-wider mx-2 shrink-0">Buff Ally</span>
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
              className="text-label-sm px-2 py-0.5 rounded-full shrink-0 text-primary hover:bg-primary/20 transition-colors"
            >
              {cond}
            </button>
          ))}
          <button onClick={() => {
            setCombat({ ...state.combat!, activeEffects: [] });
            addLog('DEV: Cleared all effects', 'system');
          }} className="text-label-sm px-2 py-0.5 rounded-full shrink-0 text-on-surface-variant hover:bg-surface-2 transition-colors ml-auto">
            Clear All
          </button>
        </div>
      )}

      {/* ─── Dev Floor Modifier Selector ────────────────── */}
      <div className="absolute top-[calc(2.25rem)] left-0 right-0 z-40 flex items-center gap-1 px-3 py-1 bg-black/60 backdrop-blur-sm overflow-x-auto">
        <span className="text-label-sm text-primary font-semibold uppercase tracking-wider mr-2 shrink-0">Floor Mod</span>
        <button onClick={() => { setFloorModifier(null); addLog('DEV: Cleared floor modifier', 'system'); }}
          className={`text-label-sm px-2 py-0.5 rounded-full shrink-0 transition-colors ${!state.floorModifier ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-2'}`}>
          None
        </button>
        {FLOOR_MODIFIERS.map(m => (
          <button key={m.id} onClick={() => { setFloorModifier(m); addLog(`DEV: Set floor modifier — ${m.name}`, 'system'); }}
            className={`text-label-sm px-2 py-0.5 rounded-full shrink-0 transition-colors ${state.floorModifier?.id === m.id ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-2'}`}>
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
          <RoomPreview key={`room-${state.currentRoom.roomNumber}`} room={state.currentRoom} floorModifier={state.floorModifier} onEnter={() => jumpTo('combat')} />
        )}

        {/* Loot */}
        {state.phase === 'loot' && lootChoices.length > 0 && (
          <LootScreen
            choices={lootChoices}
            party={state.party}
            onPick={(item, charId) => { handleLootPick(item, charId); }}
            onSkip={() => { setLootChoices([]); }}
          />
        )}

        {/* Rest */}
        {state.phase === 'rest' && (
          <RestScreen
            flavorText={state.currentRoom?.flavorText}
            onFullRest={handleFullRest}
            onQuickRest={handleQuickRest}
            onTrain={handleTrain}
          />
        )}

        {/* Level-Up Recap */}
        {state.phase === 'level-up' && levelUpResults.length > 0 && (
          <LevelUpScreen results={levelUpResults} onContinue={handleLevelUpDismiss} />
        )}

        {/* Game Over */}
        {state.phase === 'game-over' && (
          <GameOverScreen
            stats={state.stats}
            floor={state.floor}
            onRetry={() => window.location.href = '/draft'}
          />
        )}
      </div>

      {/* ─── HUD Overlays ────────────────────────────────── */}
      <div className="absolute top-12 left-3 z-20">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm">
          <span className="font-heading text-label-sm tracking-widest uppercase text-primary">Party Wipe</span>
          <span className="text-label-sm text-on-surface-variant">F{state.floor} · R{state.roomNumber}</span>
        </div>
      </div>

      {state.combat && <InitiativeBar />}
      <GameLog />
      {state.phase === 'combat' && <CombatFeedback />}
      {state.phase === 'combat' && <CombatOverlays />}
      {state.phase === 'combat' && <PhaseBanner />}

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
