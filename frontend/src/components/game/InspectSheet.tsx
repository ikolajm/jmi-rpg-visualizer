'use client';

import { GameIcon } from '@/components/atoms/GameIcon';
import { Sheet, SheetContent, SheetHeader } from '@/components/atoms/Sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/atoms/Tabs';
import {
  HealthBar, AcShield, StatRow, ResistanceRow, AttackLine, CreatureHeader,
  SpellSlotPips, FeatureItem, SpellListItem, SpellLevelHeader, EquipmentCard,
} from '@/components/molecules';
import { classFeatures } from '@/data/feature-meta';
import { getWeaponIcon, getWeaponDice, getWeaponDamageType } from '@/data/weapon-helpers';
import { statMod } from '@/data/dice';
import type { Character, Enemy } from '@/data/game-types';

function formatName(index: string) {
  return index.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function CharacterInspect({ char }: { char: Character }) {
  return (
    <>
      <SheetHeader>
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-2">
            <GameIcon category="class" name={char.classIndex} size="xl" className="text-primary" />
            <AcShield value={char.ac} size="md" />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <CreatureHeader iconCategory="class" iconName={char.classIndex} name={char.name} level={char.level} />
            <HealthBar current={char.hp} max={char.maxHp} size="md" />
            {char.spellcasting && (
              <div className="flex items-center gap-2">
                <span className="text-label-sm text-on-surface-variant">Spell Slots</span>
                <SpellSlotPips total={char.spellcasting.slotsTotal} used={char.spellcasting.slotsUsed} size="md" />
              </div>
            )}
          </div>
        </div>
      </SheetHeader>

      <Tabs defaultValue="stats" className="mt-4">
        <TabsList size="sm">
          <TabsTrigger value="stats" size="sm">Stats</TabsTrigger>
          <TabsTrigger value="combat" size="sm">Combat</TabsTrigger>
          <TabsTrigger value="spells" size="sm">Spells</TabsTrigger>
          <TabsTrigger value="gear" size="sm">Gear</TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <div className="flex flex-col gap-4">
            <StatRow stats={char.stats} proficientSaves={char.savingThrows} />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 p-3 rounded-component bg-surface-2">
                <span className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">Proficiency</span>
                <span className="text-body-md font-bold text-primary">+2</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-component bg-surface-2">
                <span className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">Saves</span>
                <span className="text-body-md font-bold text-on-surface">{char.savingThrows.join(', ')}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="combat">
          <div className="flex flex-col gap-3">
            <AttackLine
              iconName={getWeaponIcon(char.equipment.weapon)}
              label={formatName(char.equipment.weapon)}
              toHit={statMod(Math.max(char.stats.str, char.stats.dex)) + 2}
              damage={getWeaponDice(char.equipment.weapon) + '+' + statMod(Math.max(char.stats.str, char.stats.dex))}
              damageType={getWeaponDamageType(char.equipment.weapon)}
              zone={['longbow', 'shortbow'].includes(char.equipment.weapon) ? 'any' : 'melee'}
            />
            {(classFeatures[char.classIndex]?.[1] || []).filter(f => !f.hasParent).map((feat) => (
              <FeatureItem key={feat.index} name={feat.name} description={feat.description} />
            ))}
            {char.consumables.filter(c => c.quantity > 0).length > 0 && (
              <>
                <h4 className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant mt-2">Items</h4>
                {char.consumables.filter(c => c.quantity > 0).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-component bg-surface-2">
                    <GameIcon category="item" name="consumable-potion" size="md" className="text-on-surface-variant" />
                    <span className="text-body-sm text-on-surface">{item.name}</span>
                    <span className="text-label-sm text-on-surface-variant ml-auto">×{item.quantity}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="spells">
          {char.spellcasting ? (
            <div className="flex flex-col gap-3">
              <SpellLevelHeader level="cantrip" />
              {char.spellcasting.cantrips.map((spell) => (
                <SpellListItem key={spell} spellIndex={spell} />
              ))}
              <div className="flex items-center justify-between mt-2">
                <SpellLevelHeader level={1} className="flex-1" />
                <SpellSlotPips total={char.spellcasting.slotsTotal} used={char.spellcasting.slotsUsed} size="md" className="ml-3" />
              </div>
              {char.spellcasting.preparedSpells.map((spell) => (
                <SpellListItem key={spell} spellIndex={spell} />
              ))}
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant py-4 text-center">No spellcasting</p>
          )}
        </TabsContent>

        <TabsContent value="gear">
          <div className="flex flex-col gap-3">
            <EquipmentCard slot="weapon" iconName={getWeaponIcon(char.equipment.weapon)}
              label={formatName(char.equipment.weapon)} stats={getWeaponDamageType(char.equipment.weapon)} />
            {char.equipment.armor !== 'none' && (
              <EquipmentCard slot="armor" iconName="chain-mail"
                label={formatName(char.equipment.armor)} stats={char.acSource} acValue={char.ac} />
            )}
            {char.equipment.shield && (
              <EquipmentCard slot="shield" iconName="shield" label="Shield" stats="+2 AC" acValue={2} />
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2 rounded-component bg-surface-2 min-h-[48px]">
                <span className="text-[10px] text-outline-subtle">💍</span>
                <span className="text-label-sm text-on-surface-variant">
                  {char.equipment.ring1 ? formatName(char.equipment.ring1) : 'Ring 1 — Empty'}
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-component bg-surface-2 min-h-[48px]">
                <span className="text-[10px] text-outline-subtle">💍</span>
                <span className="text-label-sm text-on-surface-variant">
                  {char.equipment.ring2 ? formatName(char.equipment.ring2) : 'Ring 2 — Empty'}
                </span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

function EnemyInspect({ enemy }: { enemy: Enemy }) {
  return (
    <>
      <SheetHeader>
        <CreatureHeader iconCategory="monster" iconName={enemy.type}
          name={enemy.name} type={enemy.type} cr={enemy.cr} />
      </SheetHeader>
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-3">
          <AcShield value={enemy.ac} size="md" />
          <HealthBar current={enemy.hp} max={enemy.maxHp} size="md" className="flex-1" />
        </div>
        <StatRow stats={enemy.stats} />
        <ResistanceRow resistances={enemy.damageResistances}
          immunities={enemy.damageImmunities} vulnerabilities={enemy.damageVulnerabilities} />
        <div className="flex flex-col gap-2">
          <h4 className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant">Actions</h4>
          {enemy.actions.map((a) => (
            <AttackLine key={a.name} iconName="sword" label={a.name}
              toHit={a.toHit || 0} damage={a.damage || ''} damageType={a.damageType} zone={a.reach} />
          ))}
        </div>
      </div>
    </>
  );
}

export function InspectSheet({ inspecting, inspectType, onClose }: {
  inspecting: Character | Enemy | null;
  inspectType: 'character' | 'enemy';
  onClose: () => void;
}) {
  return (
    <Sheet open={!!inspecting} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" size="lg" className="overflow-y-auto">
        {inspecting && inspectType === 'character' && (
          <CharacterInspect char={inspecting as Character} />
        )}
        {inspecting && inspectType === 'enemy' && (
          <EnemyInspect enemy={inspecting as Enemy} />
        )}
      </SheetContent>
    </Sheet>
  );
}
