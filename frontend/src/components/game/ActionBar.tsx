'use client';

import { useState } from 'react';
import { useGame } from '@/components/providers/GameProvider';
import { GameIcon } from '@/components/atoms/GameIcon';
import { ResourceTracker, SpellSlotPips } from '@/components/molecules';
import { DamageIcon } from '@/components/molecules/DamageIcon';
import { Swords, Shield, ArrowRight, Sparkles, SkipForward } from 'lucide-react';
import { spellMeta } from '@/data/spell-meta';
import { isSpellCastable, getSpellCastType } from '@/data/spell-engine';
import { canReach, movableZones, weaponReach, spellReach, reachLabels, zoneLabel } from '@/data/zones';
import { hasBonusActions, getBonusActions } from '@/data/bonus-actions';
import { actionColors, resourceColors } from '@/data/game-colors';
import type { Zone } from '@/data/game-types';

export function ActionBar({ onAttack, onCast, onDefend, onUseItem, onBonusAction, onMove, onEndTurn }: {
  onAttack: (targetId: string) => void;
  onCast: (spellIndex: string, targetId: string) => void;
  onDefend: () => void;
  onUseItem: (itemId: string, targetId: string) => void;
  onBonusAction: (action: string, targetId?: string) => void;
  onMove: (zone: Zone) => void;
  onEndTurn: () => void;
}) {
  const { state } = useGame();
  const [mode, setMode] = useState<'idle' | 'attack-target' | 'cast-select' | 'cast-target' | 'item-select' | 'item-target' | 'bonus-select' | 'move-target'>('idle');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedSpell, setSelectedSpell] = useState<string | null>(null);

  const currentEntity = state.combat?.initiativeOrder[state.combat.currentTurnIndex];
  const character = currentEntity?.type === 'character'
    ? state.party.find(c => c.id === currentEntity.id) : null;

  if (!character || !state.combat) return null;

  const resources = state.combat.turnResources;
  const reach = weaponReach(character.equipment.weapon);
  const reachableEnemies = state.combat.enemies.filter(e => e.isAlive && canReach(character.zone, e.zone, reach));
  const validMoves = movableZones(character.zone);
  const hasSubMenu = mode !== 'idle';

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 w-[min(90vw,680px)]">

      {/* Selection panel — expands UPWARD */}
      {hasSubMenu && (
        <div className="w-full rounded-card bg-black/70 backdrop-blur-md border border-outline-subtle p-3 max-h-[240px] overflow-y-auto animate-[fade-in_0.15s_ease-out]">
          {mode === 'attack-target' && (
            <PanelSection label="Select Target">
              {reachableEnemies.length === 0 && <EmptyHint>No enemies in range — try moving first</EmptyHint>}
              <div className="flex flex-wrap gap-2">
                {reachableEnemies.map((e) => (
                  <TargetButton key={e.id} variant="enemy" onClick={() => { onAttack(e.id); setMode('idle'); }}
                    icon={<GameIcon category="monster" name={e.type} size="lg" className="text-error" />}
                    name={e.name} detail={`${e.hp}/${e.maxHp} HP`} />
                ))}
              </div>
            </PanelSection>
          )}

          {mode === 'cast-select' && character.spellcasting && (
            <PanelSection label="Select Spell">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 py-1">
                  <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-on-surface-variant">At Will</span>
                  <div className="flex-1 h-px bg-outline-subtle" />
                </div>
                {[...character.spellcasting.cantrips].filter(isSpellCastable).sort().map((spell) => (
                  <SpellRow key={spell} spell={spell} available onClick={() => { setSelectedSpell(spell); setMode('cast-target'); }} />
                ))}
                {(() => {
                  const castableSlotSpells = [...character.spellcasting.preparedSpells].filter(isSpellCastable).sort();
                  if (castableSlotSpells.length === 0) return null;
                  const hasSlots = (character.spellcasting!.slotsTotal - character.spellcasting!.slotsUsed) > 0;
                  return (
                    <>
                      <div className="flex items-center gap-2 py-1 mt-1">
                        <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-on-surface-variant">Level I</span>
                        <div className="flex-1 h-px bg-outline-subtle" />
                        <SpellSlotPips total={character.spellcasting!.slotsTotal} used={character.spellcasting!.slotsUsed} size="md" />
                      </div>
                      {castableSlotSpells.map((spell) => (
                        <SpellRow key={spell} spell={spell} available={hasSlots}
                          onClick={() => { if (hasSlots) { setSelectedSpell(spell); setMode('cast-target'); } }}>
                          {!hasSlots && <span className="text-[10px] text-error">No slots</span>}
                        </SpellRow>
                      ))}
                    </>
                  );
                })()}
              </div>
            </PanelSection>
          )}

          {mode === 'cast-target' && selectedSpell && (() => {
            const meta = spellMeta[selectedSpell];
            const castType = getSpellCastType(selectedSpell);
            const r = meta?.range ? spellReach(meta.range) : 'any';
            const spellName = selectedSpell.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            const isEnemyBuff = selectedSpell === 'hunters-mark';
            const targetsAllies = (castType === 'healing' || castType === 'buff') && !isEnemyBuff;
            const targetsEnemies = castType === 'damage' || castType === 'condition' || isEnemyBuff;
            const targetsBoundary = castType === 'boundary';

            return (
              <PanelSection label={`Cast ${spellName}${targetsBoundary ? ' — select wall' : ' — select target'}`}>
                <div className="flex flex-wrap gap-2">
                  {targetsBoundary && (['1|2', '2|3'] as const).map(key => {
                    const [a, b] = key.split('|');
                    const existing = state.combat!.boundaries[key];
                    return (
                      <TargetButton key={key} variant="ally"
                        onClick={() => { onCast(selectedSpell, key); setMode('idle'); setSelectedSpell(null); }}
                        icon={<span className="text-lg">🔥</span>}
                        name={`Zone ${a} | Zone ${b}`}
                        detail={existing ? `${existing.name} (replace)` : 'Empty'} />
                    );
                  })}
                  {targetsAllies && state.party.filter(c => c.isAlive).map((ally) => (
                    <TargetButton key={ally.id} variant="ally"
                      onClick={() => { onCast(selectedSpell, ally.id); setMode('idle'); setSelectedSpell(null); }}
                      icon={<GameIcon category="class" name={ally.classIndex} size="lg" className="text-primary" />}
                      name={ally.name} detail={`${ally.hp}/${ally.maxHp} HP`} />
                  ))}
                  {targetsEnemies && (() => {
                    const targets = state.combat!.enemies.filter(e => e.isAlive && canReach(character.zone, e.zone, r));
                    if (targets.length === 0) return <EmptyHint>No targets in range</EmptyHint>;
                    return targets.map((e) => (
                      <TargetButton key={e.id} variant="enemy"
                        onClick={() => { onCast(selectedSpell, e.id); setMode('idle'); setSelectedSpell(null); }}
                        icon={<GameIcon category="monster" name={e.type} size="lg" className="text-error" />}
                        name={e.name} detail={`${e.hp}/${e.maxHp} HP`} />
                    ));
                  })()}
                </div>
              </PanelSection>
            );
          })()}

          {mode === 'item-select' && (
            <PanelSection label="Select Item">
              <div className="flex flex-col gap-1">
                {character.consumables.map((item) => (
                  <button key={item.id}
                    onClick={() => { if (item.quantity > 0) { setSelectedItem(item.id); setMode('item-target'); } }}
                    disabled={item.quantity <= 0}
                    className={`flex items-center gap-3 px-3 py-2 rounded-component transition-all text-left
                      ${item.quantity > 0 ? 'bg-white/5 hover:bg-white/10 cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}>
                    <GameIcon category="item" name="consumable-potion" size="md" className="text-on-surface-variant" />
                    <span className="text-body-sm font-medium text-on-surface">{item.name}</span>
                    <span className="text-label-sm text-on-surface-variant ml-auto">×{item.quantity}</span>
                  </button>
                ))}
              </div>
            </PanelSection>
          )}

          {mode === 'item-target' && selectedItem && (
            <PanelSection label="Use on whom?">
              <div className="flex flex-wrap gap-2">
                {state.party.filter(c => c.isAlive).map((ally) => (
                  <TargetButton key={ally.id} variant="ally"
                    onClick={() => { onUseItem(selectedItem, ally.id); setMode('idle'); setSelectedItem(null); }}
                    icon={<GameIcon category="class" name={ally.classIndex} size="lg" className="text-primary" />}
                    name={ally.name} detail={`${ally.hp}/${ally.maxHp} HP`} />
                ))}
              </div>
            </PanelSection>
          )}

          {mode === 'bonus-select' && (
            <PanelSection label="Bonus Action">
              <div className="flex flex-col gap-1">
                {getBonusActions(character).map((ba) => (
                  <button key={ba.id}
                    onClick={() => {
                      if (!ba.available) return;
                      if (ba.id === 'healing-word') { setSelectedSpell('healing-word'); setMode('cast-target'); }
                      else { onBonusAction(ba.id); setMode('idle'); }
                    }}
                    disabled={!ba.available}
                    className={`flex items-center gap-3 px-3 py-2 rounded-component transition-all text-left
                      ${ba.available ? 'bg-white/5 hover:bg-white/10 cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}>
                    <svg width={16} height={16} viewBox="0 0 16 16"><polygon points="8,2 14.5,13 1.5,13" fill={actionColors.bonusAction} /></svg>
                    <div className="flex flex-col">
                      <span className="text-body-sm font-medium text-on-surface">{ba.name}</span>
                      <span className="text-label-sm text-on-surface-variant">{ba.available ? ba.description : ba.reason}</span>
                    </div>
                  </button>
                ))}
              </div>
            </PanelSection>
          )}

          {mode === 'move-target' && (
            <PanelSection label={`Move from ${zoneLabel(character.zone)}`}>
              <div className="flex gap-3">
                {validMoves.map((zone) => (
                  <button key={zone} onClick={() => { onMove(zone); setMode('idle'); }}
                    className="flex items-center gap-2 px-4 py-3 rounded-component bg-white/5 hover:bg-white/10 cursor-pointer transition-all">
                    <ArrowRight className="size-5" style={{ color: actionColors.free }} />
                    <span className="text-body-md font-medium text-on-surface">{zoneLabel(zone)}</span>
                  </button>
                ))}
              </div>
            </PanelSection>
          )}
        </div>
      )}

      {/* Resource tracker */}
      <div className="rounded-t-component bg-black/50 backdrop-blur-sm px-4 py-1">
        <ResourceTracker
          actionUsed={resources.actionUsed}
          bonusUsed={resources.bonusActionUsed}
          moveUsed={resources.movementUsed}
          spellSlotsTotal={character.spellcasting?.slotsTotal}
          spellSlotsUsed={character.spellcasting?.slotsUsed}
        />
      </div>

      {/* Action tiles row */}
      <div className="flex items-center gap-2 rounded-card bg-black/70 backdrop-blur-md border border-outline-subtle px-3 py-2">
        <ActionTile icon={<Swords className="size-6" />} label="Attack" color={actionColors.action}
          active={mode === 'attack-target'} disabled={resources.actionUsed}
          onClick={() => setMode(mode === 'attack-target' ? 'idle' : 'attack-target')} />

        {character.spellcasting && (
          <ActionTile icon={<Sparkles className="size-6" />} label="Cast" color={schoolColors.illusion}
            active={mode === 'cast-select' || mode === 'cast-target'} disabled={resources.actionUsed}
            onClick={() => { setMode(mode === 'cast-select' ? 'idle' : 'cast-select'); setSelectedSpell(null); }} />
        )}

        <ActionTile icon={<ArrowRight className="size-6" />} label="Move" color={actionColors.free}
          active={mode === 'move-target'} disabled={resources.movementUsed}
          onClick={() => setMode(mode === 'move-target' ? 'idle' : 'move-target')} />

        <ActionTile icon={<Shield className="size-6" />} label="Defend" color={actionColors.action}
          disabled={resources.actionUsed}
          onClick={() => { onDefend(); setMode('idle'); }} />

        {character.consumables.some(c => c.quantity > 0) && (
          <ActionTile icon={<GameIcon category="item" name="consumable-potion" size="lg" />} label="Item" color={resourceColors.spellSlot}
            active={mode === 'item-select' || mode === 'item-target'} disabled={resources.actionUsed}
            onClick={() => { setMode(mode === 'item-select' ? 'idle' : 'item-select'); setSelectedItem(null); }} />
        )}

        {hasBonusActions(character) && (
          <ActionTile
            icon={<svg width={24} height={24} viewBox="0 0 16 16"><polygon points="8,2 14.5,13 1.5,13" fill="currentColor" /></svg>}
            label="Bonus" color={actionColors.bonusAction}
            active={mode === 'bonus-select'} disabled={resources.bonusActionUsed}
            onClick={() => setMode(mode === 'bonus-select' ? 'idle' : 'bonus-select')} />
        )}

        {/* Separator + End Turn */}
        <div className="w-px h-8 bg-outline-subtle mx-1" />

        <button onClick={() => { setMode('idle'); onEndTurn(); }}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-component bg-white/5 hover:bg-white/10 cursor-pointer transition-all">
          <SkipForward className="size-5 text-on-surface-variant" />
          <span className="text-[9px] font-semibold text-on-surface-variant uppercase tracking-[0.06em]">End</span>
        </button>
      </div>

      {/* Turn indicator */}
      {!hasSubMenu && (
        <span className="text-[10px] text-on-surface-variant bg-black/40 px-3 py-0.5 rounded-full">
          {character.name}&apos;s turn
        </span>
      )}
    </div>
  );
}

// Need this import for the action tiles
import { schoolColors } from '@/data/game-colors';

// ─── Sub-components ──────────────────────────────────────────

function ActionTile({ icon, label, color, active, disabled, onClick }: {
  icon: React.ReactNode; label: string; color: string;
  active?: boolean; disabled?: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-component transition-all min-w-[52px]
        ${active ? 'bg-white/15 ring-1 ring-white/30' : 'bg-transparent hover:bg-white/10'}
        ${disabled ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'}`}>
      <span style={{ color: disabled ? 'var(--on-surface-variant)' : color }}>{icon}</span>
      <span className="text-[9px] font-medium text-on-surface">{label}</span>
    </button>
  );
}

function PanelSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-on-surface-variant">{label}</span>
      {children}
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <span className="text-body-sm text-on-surface-variant italic">{children}</span>;
}

function TargetButton({ icon, name, detail, variant, onClick }: {
  icon: React.ReactNode; name: string; detail: string;
  variant: 'ally' | 'enemy'; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-component bg-white/5 hover:bg-white/10 cursor-pointer transition-all
        ${variant === 'enemy' ? 'hover:ring-1 hover:ring-error/50' : 'hover:ring-1 hover:ring-primary/50'}`}>
      {icon}
      <div className="flex flex-col">
        <span className="text-body-sm font-medium text-on-surface">{name}</span>
        <span className="text-label-sm text-on-surface-variant">{detail}</span>
      </div>
    </button>
  );
}

function SpellRow({ spell, available, onClick, children }: {
  spell: string; available: boolean; onClick: () => void; children?: React.ReactNode;
}) {
  const meta = spellMeta[spell];
  const reach = meta?.range ? spellReach(meta.range) : null;
  const reachLabel = reach ? reachLabels[reach] : null;
  return (
    <button onClick={onClick} disabled={!available}
      className={`flex items-center gap-3 px-3 py-2 rounded-component transition-all text-left
        ${available ? 'bg-white/5 hover:bg-white/10 cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}>
      <GameIcon category="spell-school" name={meta?.school || 'evocation'} size="md"
        style={{ color: schoolColors[meta?.school || 'evocation'] || schoolColors.evocation }} />
      <span className="text-body-sm font-medium text-on-surface flex-1">
        {spell.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
      </span>
      {meta?.damageType && <DamageIcon type={meta.damageType} size="size-4" />}
      {reachLabel && <span className="text-[10px] text-on-surface-variant">{reachLabel}</span>}
      {children}
    </button>
  );
}
