'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/components/providers/GameProvider';
import { classBuilds } from '@/data/classes';
import { createMockCombat } from '@/data/mock-combat';
import { rollD20, rollDice, statMod } from '@/data/dice';
import { GameIcon } from '@/components/atoms/GameIcon';
import { Button } from '@/components/atoms/Button';
import {
  HealthBar, AcShield, SpellSlotPips, StatusStack, ResistanceRow,
  StatRow, AttackLine, FeatureItem, CreatureHeader,
} from '@/components/molecules';
import { DamageInline } from '@/components/molecules/DamageIcon';
import { ChevronUp, ChevronDown, Scroll, Swords, Shield, ArrowRight } from 'lucide-react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/atoms/Sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/atoms/Tabs';
import type { Character, Enemy, CombatEntity, Zone } from '@/data/game-types';
import { canReach, movableZones, weaponReach, zoneLabel, type Reach } from '@/data/zones';

// ─── Helpers ─────────────────────────────────────────────────

function getWeaponIcon(weapon: string): string {
  const map: Record<string, string> = {
    'longsword': 'sword', 'shortsword': 'sword', 'greataxe': 'axe',
    'mace': 'mace', 'longbow': 'bow', 'quarterstaff': 'orb-wand',
  };
  return map[weapon] || 'sword';
}

function getWeaponDamageType(weapon: string): string {
  const types: Record<string, string> = {
    'longsword': 'slashing', 'shortsword': 'piercing', 'greataxe': 'slashing',
    'mace': 'bludgeoning', 'longbow': 'piercing', 'quarterstaff': 'bludgeoning',
  };
  return types[weapon] || 'slashing';
}

function getWeaponDice(weapon: string): string {
  const dice: Record<string, string> = {
    'longsword': '1d8', 'shortsword': '1d6', 'greataxe': '1d12',
    'mace': '1d6', 'longbow': '1d8', 'quarterstaff': '1d6',
  };
  return dice[weapon] || '1d6';
}

// ─── Initiative Bar ──────────────────────────────────────────

function InitiativeBar({ order, currentIndex, party, enemies }: {
  order: CombatEntity[];
  currentIndex: number;
  party: Character[];
  enemies: Enemy[];
}) {
  return (
    <div className="flex items-center gap-[var(--space-1)] px-[var(--space-3)] py-[var(--space-2)] bg-[var(--surface-1)] border-b border-[var(--outline-subtle)] overflow-x-auto">
      <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--on-surface-variant)] shrink-0 mr-[var(--space-2)]">Initiative</span>
      {order.map((entity, i) => {
        const isActive = i === currentIndex;
        const isChar = entity.type === 'character';
        const char = isChar ? party.find(c => c.id === entity.id) : null;
        const enemy = !isChar ? enemies.find(e => e.id === entity.id) : null;
        const isDead = isChar ? !char?.isAlive : !enemy?.isAlive;

        return (
          <div
            key={entity.id}
            className={`
              flex items-center gap-1 px-[var(--space-2)] py-1 rounded-[var(--radius-component)] shrink-0 transition-all
              ${isActive ? 'bg-[var(--primary-container)] border border-[var(--primary)]' : 'bg-[var(--surface-2)] border border-transparent'}
              ${isDead ? 'opacity-30' : ''}
            `}
          >
            <GameIcon
              category={isChar ? 'class' : 'monster'}
              name={isChar ? (char?.classIndex || 'fighter') : (enemy?.type || 'humanoid')}
              size="xs"
              className={isChar ? 'text-[var(--primary)]' : 'text-[var(--error)]'}
            />
            <span className="text-[10px] font-medium text-[var(--on-surface)] truncate max-w-[60px]">
              {isChar ? char?.name : enemy?.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Zone Token (character or enemy chip in zone) ────────────

function ZoneToken({ isCharacter, name, iconCategory, iconName, hp, maxHp, ac, isActive, isDead, onClick }: {
  isCharacter: boolean;
  name: string;
  iconCategory: 'class' | 'monster';
  iconName: string;
  hp: number;
  maxHp: number;
  ac: number;
  isActive: boolean;
  isDead: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isDead}
      className={`
        flex items-center gap-[var(--space-2)] px-[var(--space-2)] py-[var(--space-1)] rounded-[var(--radius-component)]
        cursor-pointer transition-all w-full text-left
        ${isDead ? 'opacity-25 cursor-not-allowed' : ''}
        ${isActive ? 'ring-2 ring-[var(--primary)]' : ''}
        ${isCharacter
          ? 'bg-[var(--surface-2)] border border-[var(--primary)]/30'
          : 'bg-[var(--error)]/5 border border-[var(--error)]/30'
        }
      `}
    >
      <GameIcon category={iconCategory} name={iconName} size="sm"
        className={isCharacter ? 'text-[var(--primary)]' : 'text-[var(--error)]'} />
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-[10px] font-medium text-[var(--on-surface)] truncate">{name}</span>
        <HealthBar current={hp} max={maxHp} size="sm" />
      </div>
      <AcShield value={ac} size="sm" />
    </button>
  );
}

// ─── Zone Combat Layout ─────────────────────────────────────

function ZoneLayout({ party, enemies, currentEntityId, onSelectTarget }: {
  party: Character[];
  enemies: Enemy[];
  currentEntityId: string;
  onSelectTarget: (id: string, type: 'character' | 'enemy') => void;
}) {
  const zones: Zone[] = [1, 2, 3];

  return (
    <div className="grid grid-cols-3 gap-[var(--space-3)] h-full p-[var(--space-4)]">
      {zones.map((zone) => {
        const zoneChars = party.filter(c => c.zone === zone);
        const zoneEnemies = enemies.filter(e => e.zone === zone);

        return (
          <div key={zone} className="flex flex-col gap-[var(--space-3)] p-[var(--space-3)] rounded-[var(--radius-card)] bg-[var(--surface-1)] border border-[var(--outline-subtle)]">
            <h3 className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[var(--on-surface-variant)] text-center">
              {zoneLabel(zone)}
            </h3>

            {/* Allies */}
            <div className="flex flex-col gap-[var(--space-1)]">
              {zoneChars.map((char) => (
                <ZoneToken
                  key={char.id}
                  isCharacter
                  name={char.name}
                  iconCategory="class"
                  iconName={char.classIndex}
                  hp={char.hp}
                  maxHp={char.maxHp}
                  ac={char.ac}
                  isActive={char.id === currentEntityId}
                  isDead={!char.isAlive}
                  onClick={() => onSelectTarget(char.id, 'character')}
                />
              ))}
            </div>

            {/* Divider if both */}
            {zoneChars.length > 0 && zoneEnemies.length > 0 && (
              <div className="h-px bg-[var(--outline-subtle)]" />
            )}

            {/* Enemies */}
            <div className="flex flex-col gap-[var(--space-1)]">
              {zoneEnemies.map((enemy) => (
                <ZoneToken
                  key={enemy.id}
                  isCharacter={false}
                  name={enemy.name}
                  iconCategory="monster"
                  iconName={enemy.type}
                  hp={enemy.hp}
                  maxHp={enemy.maxHp}
                  ac={enemy.ac}
                  isActive={enemy.id === currentEntityId}
                  isDead={!enemy.isAlive}
                  onClick={() => onSelectTarget(enemy.id, 'enemy')}
                />
              ))}
            </div>

            {/* Empty zone */}
            {zoneChars.length === 0 && zoneEnemies.length === 0 && (
              <div className="flex items-center justify-center flex-1 text-[10px] text-[var(--outline-subtle)] italic">
                Empty
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Action Menu (JRPG style) ────────────────────────────────

function ActionMenu({ character, enemies, onAttack, onMove, onEndTurn }: {
  character: Character;
  enemies: Enemy[];
  onAttack: (targetId: string) => void;
  onMove: (zone: Zone) => void;
  onEndTurn: () => void;
}) {
  const [mode, setMode] = useState<'main' | 'attack' | 'move'>('main');

  const reach = weaponReach(character.equipment.weapon);

  const reachableEnemies = enemies.filter(e =>
    e.isAlive && canReach(character.zone, e.zone, reach)
  );

  const validMoves = movableZones(character.zone);

  return (
    <div className="flex items-stretch gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-3)] bg-[var(--surface-1)] border-t border-[var(--outline-subtle)]">
      {/* Primary menu */}
      <div className="flex flex-col gap-[var(--space-1)] w-[140px] shrink-0">
        <Button size="sm" variant={mode === 'attack' ? 'default' : 'ghost'} onClick={() => setMode('attack')}
          leadingIcon={<Swords className="size-4" />}>Attack</Button>
        <Button size="sm" variant="ghost" onClick={() => setMode('move')}
          leadingIcon={<ArrowRight className="size-4" />}>Move</Button>
        <Button size="sm" variant="ghost" onClick={() => { setMode('main'); onEndTurn(); }}
          leadingIcon={<Shield className="size-4" />}>End Turn</Button>
      </div>

      {/* Sub-menu */}
      <div className="flex-1 flex flex-col gap-[var(--space-1)] border-l border-[var(--outline-subtle)] pl-[var(--space-3)] overflow-y-auto max-h-[120px]">
        {mode === 'main' && (
          <span className="text-body-sm text-[var(--on-surface-variant)] py-[var(--space-2)]">
            {character.name}&apos;s turn — choose an action
          </span>
        )}

        {mode === 'attack' && (
          <>
            <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--on-surface-variant)] mb-1">
              Select Target ({reach === 'melee' ? 'Same zone only' : 'Any zone'})
            </span>
            {reachableEnemies.length === 0 && (
              <span className="text-body-sm text-[var(--on-surface-variant)] italic">No enemies in range — try moving first</span>
            )}
            {reachableEnemies.map((enemy) => (
              <Button key={enemy.id} size="sm" variant="ghost" onClick={() => { onAttack(enemy.id); setMode('main'); }}
                className="justify-start">
                <GameIcon category="monster" name={enemy.type} size="sm" className="text-[var(--error)]" />
                <span className="truncate">{enemy.name}</span>
                <span className="text-[10px] text-[var(--on-surface-variant)] ml-auto">HP {enemy.hp}/{enemy.maxHp}</span>
              </Button>
            ))}
          </>
        )}

        {mode === 'move' && (
          <>
            <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--on-surface-variant)] mb-1">
              Move from {zoneLabel(character.zone)} to:
            </span>
            {validMoves.map((zone) => (
              <Button key={zone} size="sm" variant="ghost" onClick={() => { onMove(zone); setMode('main'); }}
                className="justify-start">{zoneLabel(zone)}</Button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Game Log ────────────────────────────────────────────────

/** Highlight entity names in log messages with color */
function colorizeLog(message: string, partyNames: string[], enemyNames: string[]): React.ReactNode {
  // Build a regex that matches any known name
  const allNames = [...partyNames, ...enemyNames].filter(n => n.length > 0);
  if (allNames.length === 0) return message;

  const pattern = new RegExp(`(${allNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  const parts = message.split(pattern);

  return parts.map((part, i) => {
    if (partyNames.includes(part)) {
      return <span key={i} style={{ color: 'var(--primary)' }} className="font-semibold">{part}</span>;
    }
    if (enemyNames.includes(part)) {
      return <span key={i} style={{ color: 'var(--error)' }} className="font-semibold">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

function GameLog() {
  const { state } = useGame();
  const [expanded, setExpanded] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const logs = expanded ? state.log.slice(-50) : state.log.slice(-5);

  const partyNames = state.party.map(c => c.name);
  const enemyNames = state.combat?.enemies.map(e => e.name) || [];

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.log.length]);

  const typeColors: Record<string, string> = {
    combat: 'text-[var(--on-surface-variant)]',
    death: 'text-[var(--error)]',
    system: 'text-[var(--primary)]',
    loot: 'text-[var(--success)]',
    levelup: 'text-[var(--primary)]',
  };

  return (
    <div className={`absolute bottom-0 left-0 right-0 z-10 flex flex-col transition-all ${expanded ? 'h-[240px]' : 'h-[80px]'}`}>
      {/* Fade gradient at top */}
      <div className="h-6 bg-gradient-to-b from-transparent to-black/60 pointer-events-none" />

      {/* Log body */}
      <div className="flex-1 bg-black/60 backdrop-blur-sm flex flex-col overflow-hidden">
        {/* Toggle bar */}
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-[var(--space-1)] px-[var(--space-3)] py-1 text-[10px] uppercase tracking-[0.1em] text-[var(--on-surface-variant)] cursor-pointer bg-transparent border-none hover:text-[var(--on-surface)] shrink-0">
          <Scroll className="size-3" />
          Combat Log
          {expanded ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />}
        </button>

        {/* Scrollable log entries — newest at bottom */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-[var(--space-3)] pb-[var(--space-2)]">
          <div className="flex flex-col gap-0.5">
            {logs.map((entry) => (
              <span key={entry.id} className={`text-[10px] leading-relaxed ${typeColors[entry.type] || typeColors.combat}`}>
                {colorizeLog(entry.message, partyNames, enemyNames)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Party Strip ─────────────────────────────────────────────

function PartyToken({ char, isActive, onClick }: {
  char: Character; isActive?: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-2)]
        rounded-[var(--radius-component)] transition-all cursor-pointer w-full text-left
        ${isActive ? 'bg-[var(--primary-container)] border border-[var(--primary)]' : 'bg-[var(--surface-2)] border border-transparent hover:border-[var(--outline-subtle)]'}
        ${!char.isAlive ? 'opacity-40' : ''}`}>
      <GameIcon category="class" name={char.classIndex} size="md" className="text-[var(--primary)] shrink-0" />
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-label-sm font-medium text-[var(--on-surface)] truncate">{char.name}</span>
          <AcShield value={char.ac} size="sm" />
        </div>
        <HealthBar current={char.hp} max={char.maxHp} size="sm" />
        <div className="flex items-center gap-[var(--space-2)]">
          {char.spellcasting && <SpellSlotPips total={char.spellcasting.slotsTotal} used={char.spellcasting.slotsUsed} size="sm" />}
          <StatusStack effects={char.statusEffects} size="sm" />
        </div>
      </div>
    </button>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────

export default function GamePage() {
  const { state, initParty, setPhase, setCombat, addLog, updateCharacter, updateStats } = useGame();
  const [inspecting, setInspecting] = useState<Character | Enemy | null>(null);
  const [inspectType, setInspectType] = useState<'character' | 'enemy'>('character');

  // Init party from draft or auto-init for dev
  useEffect(() => {
    if (state.party.length > 0) return;

    const stored = sessionStorage.getItem('party-wipe-draft');
    let indices: string[];

    if (stored) {
      try { indices = JSON.parse(stored); } catch { indices = []; }
      sessionStorage.removeItem('party-wipe-draft');
    } else {
      // Dev auto-init: Fighter, Ranger, Wizard, Cleric
      indices = ['fighter', 'ranger', 'wizard', 'cleric'];
    }

    const builds = indices.map(idx => classBuilds.find(b => b.index === idx)).filter(Boolean);
    if (builds.length === 4) {
      initParty(builds as typeof classBuilds);
    }
  }, [state.party.length, initParty]);

  // Auto-start mock combat once party is loaded (dev only)
  const combatInitRef = React.useRef(false);
  useEffect(() => {
    if (combatInitRef.current) return;
    if (state.party.length !== 4 || state.combat || state.phase !== 'room-preview') return;

    combatInitRef.current = true;

    const zoneMap: Record<string, Zone> = {
      fighter: 1, rogue: 1, barbarian: 1,
      ranger: 2, wizard: 3, cleric: 2,
    };
    state.party.forEach(char => {
      updateCharacter(char.id, { zone: zoneMap[char.classIndex] || 2 });
    });

    setTimeout(() => {
      const combat = createMockCombat(state.party);
      setCombat(combat);
      setPhase('combat');
      addLog('Combat begins! 2 Goblins and 2 Skeletons emerge from the darkness.', 'system');
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.party.length]);

  // Current turn entity
  const currentEntity = state.combat?.initiativeOrder[state.combat.currentTurnIndex];
  const isPlayerTurn = currentEntity?.type === 'character';
  const activeCharacter = isPlayerTurn ? state.party.find(c => c.id === currentEntity.id) : null;

  // ─── Turn Advancement ────────────────────────────────────────

  /** Advance to next living entity. Pass updated combat if enemies were modified this turn. */
  function advanceTurn(combatOverride?: typeof state.combat) {
    const combat = combatOverride || state.combat;
    if (!combat) return;

    // Check for victory
    const allDead = combat.enemies.every(e => !e.isAlive);
    if (allDead) {
      addLog('All enemies defeated! Victory!', 'system');
      setPhase('room-preview');
      setCombat(null);
      updateStats({ roomsCleared: state.stats.roomsCleared + 1 });
      return;
    }

    // Advance to next living entity
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

    const roundAdvanced = nextIndex <= combat.currentTurnIndex;
    setCombat({
      ...combat,
      currentTurnIndex: nextIndex,
      roundNumber: roundAdvanced ? combat.roundNumber + 1 : combat.roundNumber,
    });
  }

  // ─── Enemy Turn Effect ──────────────────────────────────────
  // Fires whenever the turn index changes and it's an enemy's turn.
  // Using useEffect avoids stale closure issues with setTimeout.

  useEffect(() => {
    if (!state.combat || state.phase !== 'combat') return;

    const current = state.combat.initiativeOrder[state.combat.currentTurnIndex];
    if (!current || current.type !== 'enemy') return;

    const enemy = state.combat.enemies.find(e => e.id === current.id);
    if (!enemy || !enemy.isAlive) {
      // Dead enemy, skip
      const timer = setTimeout(() => advanceTurn(), 100);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      // Simple AI: attack nearest alive character
      const aliveChars = state.party.filter(c => c.isAlive);
      if (aliveChars.length === 0) {
        addLog('Total Party Kill! The dungeon claims another group of adventurers...', 'death');
        setPhase('game-over');
        return;
      }

      // Pick target (prefer same zone, then any)
      const sameZone = aliveChars.filter(c => c.zone === enemy.zone);
      const target = sameZone.length > 0 ? sameZone[0] : aliveChars[0];

      // Pick action
      const inMelee = target.zone === enemy.zone;
      const action = inMelee
        ? enemy.actions.find(a => a.reach === 'melee') || enemy.actions[0]
        : enemy.actions.find(a => a.reach === 'any') || enemy.actions[0];

      if (!action?.toHit) {
        addLog(`${enemy.name} has no valid attack.`, 'combat');
        advanceTurn();
        return;
      }

      const attackRoll = rollD20();
      const total = attackRoll + action.toHit;
      const isCrit = attackRoll === 20;
      const isMiss = attackRoll === 1 || total < target.ac;

      if (isMiss) {
        addLog(`${enemy.name} attacks ${target.name} with ${action.name} — ${total} vs AC ${target.ac} — Miss!`, 'combat');
      } else {
        let damage = action.damage ? rollDice(action.damage) : 0;
        if (isCrit) damage = Math.floor(damage * 1.5);

        addLog(`${enemy.name} attacks ${target.name} with ${action.name} — ${isCrit ? 'CRIT! ' : ''}${total} vs AC ${target.ac} — ${damage} ${action.damageType || ''} damage`, 'combat');

        const newHp = Math.max(0, target.hp - damage);
        updateCharacter(target.id, { hp: newHp, isAlive: newHp > 0 });
        updateStats({ totalDamageTaken: state.stats.totalDamageTaken + damage });

        if (newHp <= 0) {
          addLog(`${target.name} has fallen!`, 'death');
          updateStats({ charactersLost: state.stats.charactersLost + 1 });

          const remainingAlive = state.party.filter(c => c.isAlive && c.id !== target.id);
          if (remainingAlive.length === 0) {
            addLog('Total Party Kill! The dungeon claims another group of adventurers...', 'death');
            setPhase('game-over');
            return;
          }
        }
      }

      advanceTurn();
    }, 800);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.combat?.currentTurnIndex, state.combat?.roundNumber]);

  // ─── Player Combat Actions ──────────────────────────────────

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
    const prof = 2;
    const toHit = mod + prof;
    const damageType = getWeaponDamageType(weapon);

    const attackRoll = rollD20();
    const total = attackRoll + toHit;
    const isCrit = attackRoll === 20;
    const isMiss = attackRoll === 1 || total < target.ac;

    if (isMiss && attackRoll !== 1) {
      addLog(`${activeCharacter.name} attacks ${target.name} with ${weapon} — ${total} vs AC ${target.ac} — Miss!`, 'combat');
    } else if (attackRoll === 1) {
      addLog(`${activeCharacter.name} attacks ${target.name} — Natural 1! Critical miss!`, 'combat');
    } else {
      const dice = getWeaponDice(weapon);
      let damage = rollDice(dice) + mod;
      if (isCrit) damage += rollDice(dice);

      if (target.damageVulnerabilities.includes(damageType)) {
        damage = Math.floor(damage * 2);
        addLog(`${activeCharacter.name} attacks ${target.name} — ${isCrit ? 'CRITICAL! ' : ''}${total} vs AC ${target.ac} — ${damage} ${damageType} damage (VULNERABLE!)`, 'combat');
      } else if (target.damageResistances.includes(damageType)) {
        damage = Math.floor(damage / 2);
        addLog(`${activeCharacter.name} attacks ${target.name} — ${total} vs AC ${target.ac} — ${damage} ${damageType} damage (resisted)`, 'combat');
      } else if (target.damageImmunities.includes(damageType)) {
        damage = 0;
        addLog(`${activeCharacter.name} attacks ${target.name} — ${total} vs AC ${target.ac} — IMMUNE to ${damageType}!`, 'combat');
      } else {
        addLog(`${activeCharacter.name} attacks ${target.name} — ${isCrit ? 'CRITICAL! ' : ''}${total} vs AC ${target.ac} — ${damage} ${damageType} damage`, 'combat');
      }

      const newHp = Math.max(0, target.hp - damage);
      const newEnemies = state.combat.enemies.map(e =>
        e.id === targetId ? { ...e, hp: newHp, isAlive: newHp > 0 } : e
      );

      if (newHp <= 0) {
        addLog(`${target.name} is defeated!`, 'death');
        updateStats({ enemiesKilled: state.stats.enemiesKilled + 1 });
      }

      updateStats({ totalDamageDealt: state.stats.totalDamageDealt + damage });

      // Pass updated combat to advanceTurn so it doesn't overwrite enemy HP
      const updatedCombat = { ...state.combat, enemies: newEnemies };
      advanceTurn(updatedCombat);
      return;
    }

    advanceTurn();
  }

  function handleMove(zone: Zone) {
    if (!activeCharacter) return;
    updateCharacter(activeCharacter.id, { zone });
    addLog(`${activeCharacter.name} moves to ${zoneLabel(zone)}.`, 'combat');
    advanceTurn();
  }

  // ─── Inspect Handler ─────────────────────────────────────────

  function handleSelectTarget(id: string, type: 'character' | 'enemy') {
    setInspectType(type);
    if (type === 'character') {
      setInspecting(state.party.find(c => c.id === id) || null);
    } else if (state.combat) {
      setInspecting(state.combat.enemies.find(e => e.id === id) || null);
    }
  }

  // ─── Render ─────────────────────────────────────────────────

  if (state.party.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[var(--surface)]">
        <p className="text-body-md text-[var(--on-surface-variant)]">Loading party...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-[var(--surface)] overflow-hidden">

      {/* Top Bar */}
      <header className="flex items-center justify-between px-[var(--space-4)] py-[var(--space-2)] bg-[var(--surface-1)] border-b border-[var(--outline-subtle)]">
        <div className="flex items-center gap-[var(--space-3)]">
          <span className="font-[family-name:var(--font-heading)] text-label-md tracking-[0.1em] uppercase text-[var(--primary)]">
            Party Wipe
          </span>
          <span className="text-label-sm text-[var(--on-surface-variant)]">
            Floor {state.floor} · Room {state.roomNumber}
          </span>
        </div>
        {state.combat && (
          <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--on-surface-variant)]">
            Round {state.combat.roundNumber}
          </span>
        )}
      </header>

      {/* Initiative Bar (combat only) */}
      {state.combat && (
        <InitiativeBar
          order={state.combat.initiativeOrder}
          currentIndex={state.combat.currentTurnIndex}
          party={state.party}
          enemies={state.combat.enemies}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Party Strip */}
        <aside className="flex flex-col gap-[var(--space-2)] w-[220px] shrink-0 p-[var(--space-3)] bg-[var(--surface-1)] border-r border-[var(--outline-subtle)] overflow-y-auto">
          {state.party.map((char) => (
            <PartyToken key={char.id} char={char}
              isActive={char.id === currentEntity?.id}
              onClick={() => handleSelectTarget(char.id, 'character')} />
          ))}
        </aside>

        {/* Center Stage */}
        <main className="flex-1 overflow-hidden relative">
          {state.phase === 'combat' && state.combat ? (
            <ZoneLayout
              party={state.party}
              enemies={state.combat.enemies}
              currentEntityId={currentEntity?.id || ''}
              onSelectTarget={handleSelectTarget}
            />
          ) : state.phase === 'game-over' ? (
            <div className="flex flex-col items-center justify-center h-full gap-[var(--space-6)]">
              <GameIcon category="ui" name="death" size="xl" className="text-[var(--error)]" />
              <h2 className="font-[family-name:var(--font-heading)] text-title-lg text-[var(--error)] tracking-[0.1em] uppercase">
                Total Party Kill
              </h2>
              <div className="text-body-sm text-[var(--on-surface-variant)] text-center">
                <p>Enemies killed: {state.stats.enemiesKilled}</p>
                <p>Damage dealt: {state.stats.totalDamageDealt}</p>
                <p>Damage taken: {state.stats.totalDamageTaken}</p>
              </div>
              <Button onClick={() => window.location.href = '/draft'}>Try Again</Button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--on-surface-variant)]">
              Loading combat...
            </div>
          )}

          {/* Game Log — WoW-style overlay pinned to bottom */}
          <GameLog />
        </main>
      </div>

      {/* Action Bar (player turn only) */}
      {state.phase === 'combat' && isPlayerTurn && activeCharacter && state.combat && (
        <ActionMenu
          character={activeCharacter}
          enemies={state.combat.enemies}
          onAttack={handleAttack}
          onMove={handleMove}
          onEndTurn={advanceTurn}
        />
      )}

      {/* Inspect Sheet */}
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
                <ResistanceRow
                  resistances={(inspecting as Enemy).damageResistances}
                  immunities={(inspecting as Enemy).damageImmunities}
                  vulnerabilities={(inspecting as Enemy).damageVulnerabilities}
                />
                <div className="flex flex-col gap-[var(--space-2)]">
                  <h4 className="text-label-md uppercase tracking-[0.08em] text-[var(--on-surface-variant)]">Actions</h4>
                  {(inspecting as Enemy).actions.map((action) => (
                    <AttackLine
                      key={action.name}
                      iconName="sword"
                      label={action.name}
                      toHit={action.toHit || 0}
                      damage={action.damage || ''}
                      damageType={action.damageType}
                      zone={action.reach}
                    />
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
