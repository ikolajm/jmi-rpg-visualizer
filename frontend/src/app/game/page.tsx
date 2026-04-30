'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/components/providers/GameProvider';
import { useCombat } from '@/hooks/useCombat';
import { classBuilds } from '@/data/classes';
import { createMockCombat } from '@/data/mock-combat';
import { GameIcon } from '@/components/atoms/GameIcon';
import { Button } from '@/components/atoms/Button';
import { InitiativeBar, ZoneLayout, ActionBar, GameLog, InspectSheet } from '@/components/game';
import type { Character, Enemy, Zone } from '@/data/game-types';

export default function GamePage() {
  const { state, initParty, setPhase, setCombat, addLog, updateCharacter } = useGame();
  const combat = useCombat();
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

  // ─── Inspect ──────────────────────────────────────────────────

  function handleSelectTarget(id: string, type: 'character' | 'enemy') {
    setInspectType(type);
    if (type === 'character') setInspecting(state.party.find(c => c.id === id) || null);
    else if (state.combat) setInspecting(state.combat.enemies.find(e => e.id === id) || null);
  }

  // ─── Render ────────────────────────────────────────────────

  if (state.party.length === 0) {
    return <div className="flex items-center justify-center min-h-dvh bg-surface"><p className="text-body-md text-on-surface-variant">Loading party...</p></div>;
  }

  return (
    <div className="relative h-dvh bg-surface overflow-hidden">
      {/* Zone Board */}
      {state.phase === 'combat' && state.combat ? (
        <ZoneLayout onSelectTarget={handleSelectTarget} />
      ) : state.phase === 'game-over' ? (
        <div className="flex flex-col items-center justify-center h-full gap-6">
          <GameIcon category="ui" name="death" size="xl" className="text-error" />
          <h2 className="font-[family-name:var(--font-heading)] text-title-lg text-error tracking-[0.1em] uppercase">Total Party Kill</h2>
          <div className="text-body-sm text-on-surface-variant text-center">
            <p>Enemies killed: {state.stats.enemiesKilled}</p>
            <p>Damage dealt: {state.stats.totalDamageDealt}</p>
            <p>Damage taken: {state.stats.totalDamageTaken}</p>
          </div>
          <Button onClick={() => window.location.href = '/draft'}>Try Again</Button>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-on-surface-variant">Loading combat...</div>
      )}

      {/* HUD Overlays */}
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

      <InspectSheet inspecting={inspecting} inspectType={inspectType} onClose={() => setInspecting(null)} />
    </div>
  );
}
