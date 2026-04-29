'use client';

import { useState } from 'react';
import { useGame } from '@/components/providers/GameProvider';
import { GameIcon } from '@/components/atoms/GameIcon';
import { ResourceTracker, SpellSlotPips } from '@/components/molecules';
import { DamageIcon } from '@/components/molecules/DamageIcon';
import { Swords, Shield, ArrowRight, Sparkles, SkipForward } from 'lucide-react';
import { spellMeta } from '@/data/spell-meta';
import { canReach, movableZones, weaponReach, spellReach, zoneLabel } from '@/data/zones';
import { hasBonusActions, getBonusActions } from '@/data/bonus-actions';
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

  const reachableEnemies = state.combat.enemies.filter(e =>
    e.isAlive && canReach(character.zone, e.zone, reach)
  );
  const validMoves = movableZones(character.zone);
  const canAttack = !resources.actionUsed && reachableEnemies.length > 0;

  return (
    <div className="flex flex-col bg-[var(--surface-1)] border-t border-[var(--outline-subtle)]">
      <div className="px-[var(--space-4)] py-[var(--space-2)] border-b border-[var(--outline-subtle)]">
        <ResourceTracker
          actionUsed={resources.actionUsed}
          bonusUsed={resources.bonusActionUsed}
          moveUsed={resources.movementUsed}
          spellSlotsTotal={character.spellcasting?.slotsTotal}
          spellSlotsUsed={character.spellcasting?.slotsUsed}
        />
      </div>

      <div className="flex items-stretch">
        <div className="flex items-center gap-[var(--space-2)] px-[var(--space-4)] py-[var(--space-3)]">
          <ActionTile icon={<Swords className="size-6" />} label="Attack" color="var(--primary)"
            active={mode === 'attack-target'} disabled={resources.actionUsed}
            onClick={() => setMode(mode === 'attack-target' ? 'idle' : 'attack-target')} />

          {character.spellcasting && (
            <ActionTile icon={<Sparkles className="size-6" />} label="Cast" color="#9b7fd4"
              active={mode === 'cast-select' || mode === 'cast-target'} disabled={resources.actionUsed}
              onClick={() => { setMode(mode === 'cast-select' ? 'idle' : 'cast-select'); setSelectedSpell(null); }} />
          )}

          <ActionTile icon={<ArrowRight className="size-6" />} label="Move" color="#5bad5a"
            active={mode === 'move-target'} disabled={resources.movementUsed}
            onClick={() => setMode(mode === 'move-target' ? 'idle' : 'move-target')} />

          <ActionTile icon={<Shield className="size-6" />} label="Defend" color="#e8c263"
            disabled={resources.actionUsed}
            onClick={() => { onDefend(); setMode('idle'); }} />

          {character.consumables.length > 0 && (
            <ActionTile icon={<GameIcon category="item" name="consumable-potion" size="lg" />} label="Item" color="#5b9bd5"
              active={mode === 'item-select' || mode === 'item-target'} disabled={resources.actionUsed}
              onClick={() => { setMode(mode === 'item-select' ? 'idle' : 'item-select'); setSelectedItem(null); }} />
          )}

          {hasBonusActions(character) && (
            <ActionTile
              icon={<svg width={24} height={24} viewBox="0 0 16 16"><polygon points="8,2 14.5,13 1.5,13" fill="currentColor" /></svg>}
              label="Bonus" color="#e8723a"
              active={mode === 'bonus-select'} disabled={resources.bonusActionUsed}
              onClick={() => setMode(mode === 'bonus-select' ? 'idle' : 'bonus-select')} />
          )}
        </div>

        {/* Selection panel */}
        <div className="flex-1 flex flex-col gap-[var(--space-1)] px-[var(--space-3)] py-[var(--space-2)] border-l border-[var(--outline-subtle)] overflow-y-auto max-h-[120px]">
          {mode === 'idle' && (
            <span className="text-body-sm text-[var(--on-surface-variant)]">{character.name}&apos;s turn — choose an action</span>
          )}

          {mode === 'attack-target' && (
            <TargetList label="Select Target" isEmpty={!canAttack} emptyText="No enemies in range">
              {reachableEnemies.map((e) => (
                <TargetButton key={e.id} onClick={() => { onAttack(e.id); setMode('idle'); }} variant="enemy"
                  icon={<GameIcon category="monster" name={e.type} size="md" className="text-[var(--error)]" />}
                  name={e.name} detail={`${e.hp}/${e.maxHp} HP`} />
              ))}
            </TargetList>
          )}

          {mode === 'cast-select' && character.spellcasting && (
            <>
              <span className="text-[9px] uppercase tracking-[0.1em] text-[var(--on-surface-variant)]">
                Select Spell
                <SpellSlotPips total={character.spellcasting.slotsTotal} used={character.spellcasting.slotsUsed} size="sm" className="inline-flex ml-2" />
              </span>
              <div className="flex flex-wrap gap-[var(--space-1)]">
                {character.spellcasting.cantrips.map((spell) => {
                  const meta = spellMeta[spell];
                  return (
                    <SpellButton key={spell} spell={spell} meta={meta} available onClick={() => { setSelectedSpell(spell); setMode('cast-target'); }}>
                      <span className="text-[9px] text-[var(--primary)] italic">At Will</span>
                    </SpellButton>
                  );
                })}
                {character.spellcasting.preparedSpells.map((spell) => {
                  const meta = spellMeta[spell];
                  const hasSlots = (character.spellcasting!.slotsTotal - character.spellcasting!.slotsUsed) > 0;
                  return (
                    <SpellButton key={spell} spell={spell} meta={meta} available={hasSlots}
                      onClick={() => { if (hasSlots) { setSelectedSpell(spell); setMode('cast-target'); } }}>
                      {!hasSlots && <span className="text-[9px] text-[var(--error)]">No slots</span>}
                    </SpellButton>
                  );
                })}
              </div>
            </>
          )}

          {mode === 'cast-target' && selectedSpell && (() => {
            const meta = spellMeta[selectedSpell];
            const isHealing = meta?.damageType === 'healing';
            const reach_ = meta?.range ? spellReach(meta.range) : 'any';

            return (
              <TargetList label={`Cast ${selectedSpell.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} — select target`}>
                {isHealing
                  ? state.party.filter(c => c.isAlive).map((ally) => (
                    <TargetButton key={ally.id} variant="ally"
                      onClick={() => { onCast(selectedSpell, ally.id); setMode('idle'); setSelectedSpell(null); }}
                      icon={<GameIcon category="class" name={ally.classIndex} size="md" className="text-[var(--primary)]" />}
                      name={ally.name} detail={`${ally.hp}/${ally.maxHp} HP`} />
                  ))
                  : (() => {
                    const targets = state.combat!.enemies.filter(e => e.isAlive && canReach(character.zone, e.zone, reach_ as any));
                    if (targets.length === 0) return <span className="text-[10px] text-[var(--on-surface-variant)] italic">No targets in range</span>;
                    return targets.map((e) => (
                      <TargetButton key={e.id} variant="enemy"
                        onClick={() => { onCast(selectedSpell, e.id); setMode('idle'); setSelectedSpell(null); }}
                        icon={<GameIcon category="monster" name={e.type} size="md" className="text-[var(--error)]" />}
                        name={e.name} detail={`${e.hp}/${e.maxHp} HP`} />
                    ));
                  })()
                }
              </TargetList>
            );
          })()}

          {mode === 'item-select' && (
            <TargetList label="Select Item">
              {character.consumables.map((item) => (
                <button key={item.id}
                  onClick={() => { if (item.quantity > 0) { setSelectedItem(item.id); setMode('item-target'); } }}
                  disabled={item.quantity <= 0}
                  className={`flex items-center gap-[var(--space-2)] px-[var(--space-2)] py-1 rounded-[var(--radius-component)] border border-transparent transition-all
                    ${item.quantity > 0 ? 'bg-[var(--surface-2)] hover:bg-[var(--surface-3)] cursor-pointer' : 'bg-[var(--surface-2)] opacity-30 cursor-not-allowed'}`}>
                  <GameIcon category="item" name="consumable-potion" size="sm" />
                  <span className="text-[10px] font-medium text-[var(--on-surface)]">{item.name}</span>
                  <span className="text-[9px] text-[var(--on-surface-variant)]">×{item.quantity}</span>
                </button>
              ))}
            </TargetList>
          )}

          {mode === 'item-target' && selectedItem && (
            <TargetList label="Use on whom?">
              {state.party.filter(c => c.isAlive).map((ally) => (
                <TargetButton key={ally.id} variant="ally"
                  onClick={() => { onUseItem(selectedItem, ally.id); setMode('idle'); setSelectedItem(null); }}
                  icon={<GameIcon category="class" name={ally.classIndex} size="md" className="text-[var(--primary)]" />}
                  name={ally.name} detail={`${ally.hp}/${ally.maxHp} HP`} />
              ))}
            </TargetList>
          )}

          {mode === 'bonus-select' && (
            <TargetList label="Bonus Action">
              {getBonusActions(character).map((ba) => (
                <button key={ba.id}
                  onClick={() => {
                    if (!ba.available) return;
                    if (ba.id === 'healing-word') { setSelectedSpell('healing-word'); setMode('cast-target'); }
                    else { onBonusAction(ba.id); setMode('idle'); }
                  }}
                  disabled={!ba.available}
                  className={`flex items-center gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-component)] border border-transparent transition-all
                    ${ba.available ? 'bg-[var(--surface-2)] hover:bg-[var(--surface-3)] cursor-pointer' : 'bg-[var(--surface-2)] opacity-30 cursor-not-allowed'}`}>
                  <svg width={12} height={12} viewBox="0 0 16 16"><polygon points="8,2 14.5,13 1.5,13" fill="#e8723a" /></svg>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium text-[var(--on-surface)]">{ba.name}</span>
                    <span className="text-[9px] text-[var(--on-surface-variant)]">{ba.available ? ba.description : ba.reason}</span>
                  </div>
                </button>
              ))}
            </TargetList>
          )}

          {mode === 'move-target' && (
            <div className="flex flex-wrap gap-[var(--space-2)]">
              {validMoves.map((zone) => (
                <button key={zone} onClick={() => { onMove(zone); setMode('idle'); }}
                  className="flex items-center gap-[var(--space-2)] px-[var(--space-4)] py-[var(--space-2)] rounded-[var(--radius-component)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] cursor-pointer border border-transparent hover:border-[var(--primary)]/50 transition-all">
                  <ArrowRight className="size-4" style={{ color: '#5bad5a' }} />
                  <span className="text-body-sm font-medium text-[var(--on-surface)]">{zoneLabel(zone)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* End Turn */}
        <div className="flex items-center px-[var(--space-3)] border-l border-[var(--outline-subtle)]">
          <button onClick={() => { setMode('idle'); onEndTurn(); }}
            className="flex flex-col items-center gap-1 px-[var(--space-4)] py-[var(--space-2)] rounded-[var(--radius-component)] bg-[var(--surface-3)] hover:bg-[var(--on-surface-variant)]/20 cursor-pointer transition-all border border-[var(--outline-subtle)]">
            <SkipForward className="size-6 text-[var(--on-surface-variant)]" />
            <span className="text-[9px] font-semibold text-[var(--on-surface-variant)] uppercase tracking-[0.08em]">End Turn</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function ActionTile({ icon, label, color, active, disabled, onClick }: {
  icon: React.ReactNode; label: string; color: string;
  active?: boolean; disabled?: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex flex-col items-center gap-1 px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-component)] transition-all
        ${active ? 'bg-[var(--primary-container)] border border-[var(--primary)]' : 'bg-[var(--surface-2)] border border-transparent hover:border-[var(--outline-subtle)]'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}>
      <span style={{ color: disabled ? 'var(--on-surface-variant)' : color }}>{icon}</span>
      <span className="text-[9px] font-medium text-[var(--on-surface)]">{label}</span>
    </button>
  );
}

function TargetList({ label, isEmpty, emptyText, children }: {
  label: string; isEmpty?: boolean; emptyText?: string; children: React.ReactNode;
}) {
  return (
    <>
      <span className="text-[9px] uppercase tracking-[0.1em] text-[var(--on-surface-variant)]">{label}</span>
      {isEmpty && <span className="text-[10px] text-[var(--on-surface-variant)] italic">{emptyText}</span>}
      <div className="flex flex-wrap gap-[var(--space-2)]">{children}</div>
    </>
  );
}

function TargetButton({ icon, name, detail, variant, onClick }: {
  icon: React.ReactNode; name: string; detail: string;
  variant: 'ally' | 'enemy'; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-component)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] cursor-pointer border border-transparent transition-all
        ${variant === 'enemy' ? 'hover:border-[var(--error)]/50' : 'hover:border-[var(--primary)]/50'}`}>
      {icon}
      <div className="flex flex-col">
        <span className="text-[10px] font-medium text-[var(--on-surface)]">{name}</span>
        <span className="text-[9px] text-[var(--on-surface-variant)]">{detail}</span>
      </div>
    </button>
  );
}

function SpellButton({ spell, meta, available, onClick, children }: {
  spell: string; meta: any; available: boolean; onClick: () => void; children?: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={!available}
      className={`flex items-center gap-[var(--space-2)] px-[var(--space-2)] py-1 rounded-[var(--radius-component)] border border-transparent transition-all
        ${available ? 'bg-[var(--surface-2)] hover:bg-[var(--surface-3)] cursor-pointer hover:border-[var(--primary)]/50' : 'bg-[var(--surface-2)] opacity-30 cursor-not-allowed'}`}>
      <GameIcon category="spell-school" name={meta?.school || 'evocation'} size="sm" />
      <span className="text-[10px] font-medium text-[var(--on-surface)]">{spell.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
      {meta?.damageType && <DamageIcon type={meta.damageType} size="size-3" />}
      {children}
    </button>
  );
}
