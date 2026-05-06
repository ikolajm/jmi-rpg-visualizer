'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/components/providers/GameProvider';
import { useCombat } from '@/hooks/useCombat';
import { classBuilds } from '@/data/classes';
import { generateRoom, floorFromRoom } from '@/data/room-generator';
import { generateEncounter } from '@/data/encounter-generator';
import { shouldDropLoot, generateLootChoices } from '@/data/loot-generator';
import { awardXP, checkLevelUp, applyLevelUp, type LevelUpResult } from '@/data/progression';
import { statMod } from '@/data/dice';
import { rarityColors } from '@/data/game-colors';
import { GameIcon } from '@/components/atoms/GameIcon';
import { Button } from '@/components/atoms/Button';
import { InitiativeBar, ZoneLayout, ActionBar, GameLog, InspectSheet } from '@/components/game';
import type { Character, Enemy, Zone, RoomType } from '@/data/game-types';
import type { LootItem } from '@/data/loot-generator';

export default function GamePage() {
  const { state, initParty, setPhase, setRoom, setCombat, addLog, updateCharacter, updateStats, advanceRoom } = useGame();

  const router = useRouter();
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [inspectType, setInspectType] = useState<'character' | 'enemy'>('character');
  const [lootChoices, setLootChoices] = useState<LootItem[]>([]);
  const [selectedLoot, setSelectedLoot] = useState<LootItem | null>(null);
  const [levelUpResults, setLevelUpResults] = useState<LevelUpResult[]>([]);



  // ─── Victory Handler ──────────────────────────────────────────

  const handleVictory = useCallback((defeatedEnemies: Enemy[]) => {
    const xpTotal = defeatedEnemies.reduce((sum, e) => sum + (e.xp || 0), 0);
    const updatedParty = awardXP(state.party, xpTotal);
    const aliveCount = updatedParty.filter(c => c.isAlive).length;
    if (aliveCount > 0) {
      const xpEach = Math.floor(xpTotal / aliveCount);
      addLog(`Party gains ${xpTotal} XP (${xpEach} each).`, 'system');
    }
    updatedParty.forEach(c => updateCharacter(c.id, { xp: c.xp }));

    // Check loot drop
    const roomType = state.currentRoom?.type || 'combat';
    if (shouldDropLoot(roomType)) {
      const choices = generateLootChoices(state.floor);
      setLootChoices(choices);
      setSelectedLoot(null);
      setPhase('loot');
    } else {
      checkAndQueueLevelUps(updatedParty);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.party, state.currentRoom, state.floor]);

  const combat = useCombat({ onVictory: handleVictory });

  // ─── Level-Up ──────────────────────────────────────────────────

  function checkAndQueueLevelUps(party: Character[]) {
    const eligible = party.filter(c => c.isAlive && checkLevelUp(c));
    if (eligible.length === 0) { advanceRoom(); return; }

    // Apply all level-ups immediately, collect results for recap
    const results: LevelUpResult[] = [];
    for (const char of eligible) {
      const result = applyLevelUp(char);
      updateCharacter(char.id, result.character);
      addLog(`${result.character.name} reached level ${result.newLevel}!`, 'levelup');
      results.push(result);
    }
    setLevelUpResults(results);
    setPhase('level-up');
  }

  function handleLevelUpDismiss() {
    setLevelUpResults([]);
    advanceRoom();
  }

  // ─── Room Generation ──────────────────────────────────────────

  useEffect(() => {
    if (state.party.length !== 4 || state.phase !== 'room-preview') return;
    if (state.currentRoom) return; // room already set, waiting for player

    const nextRoomNumber = state.roomNumber + 1;
    const floor = floorFromRoom(nextRoomNumber);
    const room = generateRoom(floor, nextRoomNumber);
    setRoom(room);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.party.length, state.phase, state.currentRoom]);

  // ─── Init ─────────────────────────────────────────────────────

  const initRef = React.useRef(false);
  useEffect(() => {
    if (state.party.length > 0 || initRef.current) return;
    const stored = sessionStorage.getItem('party-wipe-draft');
    if (!stored) {
      router.replace('/draft');
      return;
    }
    initRef.current = true;
    let indices: string[];
    try { indices = JSON.parse(stored); } catch { router.replace('/draft'); return; }
    sessionStorage.removeItem('party-wipe-draft');
    const builds = indices.map(idx => classBuilds.find(b => b.index === idx)).filter(Boolean);
    if (builds.length === 4) initParty(builds as typeof classBuilds);
    else router.replace('/draft');
  }, [state.party.length, initParty, router]);

  // ─── Enter Room ───────────────────────────────────────────────

  function enterRoom() {
    const room = state.currentRoom;
    if (!room) return;

    if (room.type === 'combat' || room.type === 'elite_combat' || room.type === 'boss') {
      const zoneMap: Record<string, Zone> = { fighter: 1, rogue: 1, barbarian: 1, ranger: 2, wizard: 3, cleric: 2 };
      state.party.forEach(char => updateCharacter(char.id, { zone: zoneMap[char.classIndex] || 2 }));

      const encounter = generateEncounter(state.floor, room.type, state.party, room.roomNumber);
      setCombat(encounter);
      setPhase('combat');

      const enemyNames = encounter.enemies.map(e => e.name).join(', ');
      addLog(`Combat begins! ${enemyNames} ${encounter.enemies.length === 1 ? 'appears' : 'appear'}!`, 'system');
    } else if (room.type === 'rest') {
      setPhase('rest');
    } else if (room.type === 'treasure') {
      const choices = generateLootChoices(state.floor);
      setLootChoices(choices);
      setSelectedLoot(null);
      setPhase('loot');
      addLog('The party finds treasure!', 'loot');
    }
  }

  // ─── Rest ─────────────────────────────────────────────────────

  function handleRest() {
    for (const char of state.party) {
      if (!char.isAlive) continue;
      const healAmount = Math.floor(char.maxHp * 0.25);
      const newHp = Math.min(char.maxHp, char.hp + healAmount);

      const updates: Partial<Character> = { hp: newHp };

      // Restore 1 spell slot
      if (char.spellcasting && char.spellcasting.slotsUsed > 0) {
        updates.spellcasting = { ...char.spellcasting, slotsUsed: Math.max(0, char.spellcasting.slotsUsed - 1) };
      }

      // Reset feature uses
      const resetFeatures: Record<string, { used: number; max: number }> = {};
      for (const [key, val] of Object.entries(char.featureUses)) {
        resetFeatures[key] = { ...val, used: 0 };
      }
      updates.featureUses = resetFeatures;

      updateCharacter(char.id, updates);
    }

    addLog('The party rests. HP restored, abilities refreshed.', 'system');
    advanceRoom();
  }

  // ─── Loot ─────────────────────────────────────────────────────

  function handleLootPick(item: LootItem, charId: string) {
    const char = state.party.find(c => c.id === charId);
    if (!char) return;

    if (item.category === 'weapon' && item.damage) {
      updateCharacter(charId, {
        equipment: {
          ...char.equipment,
          weapon: {
            index: item.index,
            name: item.name,
            damage: item.damage,
            damageType: item.damageType || 'slashing',
            weaponRange: item.weaponRange || 'melee',
            properties: item.properties || [],
          },
        },
      });
      addLog(`${char.name} equips ${item.name}.`, 'loot');
    } else if (item.category === 'armor' && item.acBase !== undefined) {
      const dexMod = statMod(char.stats.dex);
      const dexBonus = item.acDexCap !== undefined ? Math.min(dexMod, item.acDexCap) : dexMod;
      const newAc = item.acBase + dexBonus + (char.equipment.shield ? 2 : 0);
      updateCharacter(charId, {
        ac: newAc,
        acSource: item.name,
        equipment: {
          ...char.equipment,
          armor: { index: item.index, name: item.name, acBase: item.acBase, acDexCap: item.acDexCap },
        },
      });
      addLog(`${char.name} equips ${item.name}. AC is now ${newAc}.`, 'loot');
    } else if (item.category === 'consumable') {
      const existing = char.consumables.find(c => c.id === item.index);
      if (existing) {
        updateCharacter(charId, {
          consumables: char.consumables.map(c => c.id === item.index ? { ...c, quantity: c.quantity + 1 } : c),
        });
      } else {
        updateCharacter(charId, {
          consumables: [...char.consumables, { id: item.index, name: item.name, quantity: 1, effect: 'heal', value: 7 }],
        });
      }
      addLog(`${char.name} receives ${item.name}.`, 'loot');
    }

    setLootChoices([]);
    setSelectedLoot(null);
    checkAndQueueLevelUps(state.party);
  }

  function handleSkipLoot() {
    setLootChoices([]);
    setSelectedLoot(null);
    checkAndQueueLevelUps(state.party);
  }

  // ─── Inspect ──────────────────────────────────────────────────

  const inspecting: Character | Enemy | null = inspectId
    ? (inspectType === 'character'
      ? state.party.find(c => c.id === inspectId) || null
      : state.combat?.enemies.find(e => e.id === inspectId) || null)
    : null;

  function handleSelectTarget(id: string, type: 'character' | 'enemy') {
    setInspectType(type);
    setInspectId(id);
  }

  // ─── Render ───────────────────────────────────────────────────

  if (state.party.length === 0) {
    return <div className="flex items-center justify-center min-h-dvh bg-surface"><p className="text-body-md text-on-surface-variant">Loading party...</p></div>;
  }

  const roomIcon = (type: RoomType) => {
    const map: Record<string, string> = { combat: 'combat', elite_combat: 'combat', boss: 'boss', rest: 'rest', treasure: 'treasure', trap: 'trap' };
    return map[type] || 'combat';
  };

  return (
    <div className="relative h-dvh bg-surface overflow-hidden">

      {/* ─── Combat ──────────────────────────────────────── */}
      {state.phase === 'combat' && state.combat && (
        <ZoneLayout onSelectTarget={handleSelectTarget} />
      )}

      {/* ─── Room Preview ────────────────────────────────── */}
      {state.phase === 'room-preview' && state.currentRoom && (
        <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
          <GameIcon category="room" name={roomIcon(state.currentRoom.type)} size="xl" className="text-primary" />
          <h2 className="font-[family-name:var(--font-heading)] text-title-lg text-on-surface tracking-[0.1em] uppercase">
            {state.currentRoom.type === 'elite_combat' ? 'Elite Combat' : state.currentRoom.type.replace('_', ' ')}
          </h2>
          <p className="text-body-md text-on-surface-variant text-center max-w-md italic">
            {state.currentRoom.flavorText}
          </p>
          <Button onClick={enterRoom}>Enter Room</Button>
        </div>
      )}

      {state.phase === 'room-preview' && !state.currentRoom && (
        <div className="flex items-center justify-center h-full text-on-surface-variant">Preparing next room...</div>
      )}

      {/* ─── Loot ────────────────────────────────────────── */}
      {state.phase === 'loot' && (
        <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
          <h2 className="font-[family-name:var(--font-heading)] text-title-lg text-primary tracking-[0.1em] uppercase">
            Choose Your Loot
          </h2>
          <div className="flex gap-4 flex-wrap justify-center">
            {lootChoices.map((item) => {
              const rarityColor = rarityColors[item.rarity.toLowerCase()] || rarityColors.common;
              const isSelected = selectedLoot?.index === item.index;
              return (
                <button key={item.index}
                  onClick={() => setSelectedLoot(item)}
                  className={`flex flex-col items-start gap-2 p-4 rounded-card bg-surface-2 border-2 transition-colors w-56 text-left
                    ${isSelected ? 'border-primary' : 'border-outline-subtle hover:border-outline'}`}
                  style={isSelected ? undefined : { borderLeftColor: rarityColor, borderLeftWidth: 3 }}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: rarityColor }}>
                    {item.rarity} {item.category}
                  </span>
                  <span className="text-body-md text-on-surface font-semibold">{item.name}</span>
                  {item.damage && (
                    <span className="text-label-sm text-on-surface-variant">{item.damage} {item.damageType} damage</span>
                  )}
                  {item.acBase !== undefined && (
                    <span className="text-label-sm text-on-surface-variant">AC {item.acBase}{item.acDexCap === undefined ? ' + DEX' : item.acDexCap > 0 ? ` + DEX (max ${item.acDexCap})` : ''}</span>
                  )}
                  {item.description && (
                    <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-3 mt-1">{item.description}</p>
                  )}
                </button>
              );
            })}
          </div>
          {selectedLoot && (
            <div className="flex gap-3 flex-wrap justify-center">
              <p className="text-body-sm text-on-surface-variant w-full text-center">Assign to:</p>
              {state.party.filter(c => c.isAlive).map(c => (
                <Button key={c.id} onClick={() => handleLootPick(selectedLoot, c.id)}>
                  {c.name}
                </Button>
              ))}
            </div>
          )}
          <button onClick={handleSkipLoot} className="text-label-md text-on-surface-variant hover:text-on-surface underline">
            Skip
          </button>
        </div>
      )}

      {/* ─── Rest ────────────────────────────────────────── */}
      {state.phase === 'rest' && (
        <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
          <GameIcon category="room" name="rest" size="xl" className="text-primary" />
          <h2 className="font-[family-name:var(--font-heading)] text-title-lg text-on-surface tracking-[0.1em] uppercase">
            Rest
          </h2>
          <p className="text-body-md text-on-surface-variant text-center max-w-md italic">
            {state.currentRoom?.flavorText || 'A moment of respite.'}
          </p>
          <p className="text-body-sm text-on-surface-variant text-center">
            Heal 25% max HP. Restore 1 spell slot. Reset abilities.
          </p>
          <Button onClick={handleRest}>Rest</Button>
        </div>
      )}

      {/* ─── Level-Up Recap ─────────────────────────────── */}
      {state.phase === 'level-up' && levelUpResults.length > 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
          <h2 className="font-[family-name:var(--font-heading)] text-title-lg text-primary tracking-[0.1em] uppercase">
            Level Up!
          </h2>
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
                      <span className="text-body-sm text-primary">
                        +{r.statBoost.amount} {r.statBoost.stat}
                      </span>
                    )}
                    {r.newFeatures.length > 0 && (
                      <span className="text-body-sm text-on-surface-variant">
                        New: {r.newFeatures.join(', ')}
                      </span>
                    )}
                    {r.newSpells.length > 0 && (
                      <span className="text-body-sm text-on-surface-variant">
                        Spells: {r.newSpells.map(formatSpell).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <Button onClick={handleLevelUpDismiss}>Continue</Button>
        </div>
      )}

      {/* ─── Game Over ───────────────────────────────────── */}
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

      {/* ─── HUD Overlays ────────────────────────────────── */}
      <div className="absolute top-3 left-3 z-20">
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
