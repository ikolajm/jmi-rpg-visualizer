'use client';

import { GameIcon } from '@/components/atoms/GameIcon';
import { SheetHeader } from '@/components/atoms/Sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/atoms/Tabs';
import {
  HealthBar, AcShield, StatRow, AttackLine, CreatureHeader,
  SpellSlotPips, FeatureItem, SpellListItem, SpellLevelHeader, EquipmentCard,
} from '@/components/molecules';
import { classFeatures } from '@/data/feature-meta';
import { V1_FEATURES } from '@/data/v1-roster';
import { getWeaponIcon } from '@/data/weapon-helpers';
import { statMod } from '@/data/dice';
import { XP_THRESHOLDS, proficiencyBonus } from '@/data/progression';
import { statusColors } from '@/data/game-colors';
import { ConditionList } from '@/components/molecules/ConditionList';
import { useGame } from '@/components/providers/GameProvider';
import type { Character } from '@/data/game-types';

/** Collect combat-relevant features from level 1 through current level */
function aggregateFeatures(classIndex: string, level: number) {
  const allowed = V1_FEATURES[classIndex];
  if (!allowed) return [];
  const features: { index: string; name: string; description: string; hasParent: boolean }[] = [];
  const allLevels = classFeatures[classIndex] || {};
  for (let l = 1; l <= level; l++) {
    const lvlFeats = allLevels[l] || [];
    features.push(...lvlFeats.filter(f => !f.hasParent && allowed.has(f.index)));
  }
  return features.sort((a, b) => a.name.localeCompare(b.name));
}

export function CharacterInspect({ char }: { char: Character }) {
  const { state } = useGame();
  const activeEffects = state.combat?.activeEffects.filter(e => e.targetId === char.id) || [];
  const prof = proficiencyBonus(char.level);
  const strMod = statMod(char.stats.str);
  const dexMod = statMod(char.stats.dex);
  const weapon = char.equipment.weapon;
  const isRanged = weapon.weaponRange === 'ranged';
  const isFinesse = weapon.properties.includes('finesse');
  const attackMod = isRanged ? dexMod : isFinesse ? Math.max(strMod, dexMod) : strMod;
  const toHit = attackMod + prof;

  const xpNext = XP_THRESHOLDS[char.level + 1];
  const xpCurrent = char.xp;
  const xpPrev = XP_THRESHOLDS[char.level] || 0;
  const xpProgress = xpNext ? Math.min(1, (xpCurrent - xpPrev) / (xpNext - xpPrev)) : 1;

  const allFeatures = aggregateFeatures(char.classIndex, char.level);
  const hasCasting = !!char.spellcasting;

  // Build tab list dynamically — skip tabs with no content
  const tabs = [
    { id: 'stats', label: 'Stats' },
    { id: 'combat', label: 'Combat' },
    ...(hasCasting ? [{ id: 'spells', label: 'Spells' }] : []),
    { id: 'gear', label: 'Gear' },
  ];

  return (
    <>
      <SheetHeader>
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-2">
            <GameIcon category="class" name={char.classIndex} size="xl" className="text-primary" />
            <AcShield value={char.ac} size="md" />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <CreatureHeader name={char.name} level={char.level} />
            <HealthBar current={char.hp} max={char.maxHp} size="md" />
            {/* XP progress */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">XP</span>
                <span className="text-[10px] tabular-nums text-on-surface-variant">
                  {xpCurrent}{xpNext ? ` / ${xpNext}` : ' (max)'}
                </span>
              </div>
              <div className="h-1 rounded-full bg-surface-3 overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${xpProgress * 100}%` }} />
              </div>
            </div>
            {hasCasting && (
              <div className="flex items-center gap-2">
                <span className="text-label-sm text-on-surface-variant">Spell Slots</span>
                <SpellSlotPips total={char.spellcasting!.slotsTotal} used={char.spellcasting!.slotsUsed} size="md" />
              </div>
            )}
          </div>
        </div>
      </SheetHeader>

      <Tabs defaultValue="stats" className="mt-4">
        <TabsList size="sm">
          {tabs.map(t => <TabsTrigger key={t.id} value={t.id} size="sm">{t.label}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="stats">
          <div className="flex flex-col gap-4">
            <StatRow stats={char.stats} proficientSaves={char.savingThrows} />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 p-3 rounded-component bg-surface-2">
                <span className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">Proficiency</span>
                <span className="text-body-md font-bold text-primary">+{prof}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-component bg-surface-2">
                <span className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">Saves</span>
                <span className="text-body-md font-bold text-on-surface">{char.savingThrows.join(', ')}</span>
              </div>
            </div>

            {hasCasting && (
              <div className="flex flex-col gap-2">
                <h4 className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant">Spellcasting</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center gap-1 p-3 rounded-component bg-surface-2">
                    <span className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">Ability</span>
                    <span className="text-body-md font-bold text-primary">{char.spellcasting!.ability}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-3 rounded-component bg-surface-2">
                    <span className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">Save DC</span>
                    <span className="text-body-md font-bold text-on-surface">{char.spellcasting!.spellSaveDC}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-3 rounded-component bg-surface-2">
                    <span className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">Attack</span>
                    <span className="text-body-md font-bold text-on-surface">+{char.spellcasting!.spellAttackBonus}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="combat">
          <div className="flex flex-col gap-3">
            {activeEffects.length > 0 && <ConditionList effects={activeEffects} />}

            <AttackLine
              iconName={getWeaponIcon(weapon.index)}
              label={weapon.name}
              toHit={toHit}
              damage={weapon.damage + (attackMod >= 0 ? '+' : '') + attackMod}
              damageType={weapon.damageType}
              zone={isRanged ? 'any' : 'melee'}
            />

            {/* Combat modifiers */}
            {(char.features.includes('Extra Attack') || char.features.includes('Sneak Attack') || char.statusEffects.includes('raging') || char.features.includes('Divine Strike') || char.features.includes("Hunter's Prey")) && (
              <div className="flex flex-wrap gap-2">
                {char.features.includes('Extra Attack') && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">2 Attacks</span>
                )}
                {char.features.includes('Sneak Attack') && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">Sneak +{Math.ceil(char.level / 2)}d6</span>
                )}
                {char.statusEffects.includes('raging') && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: statusColors.raging, backgroundColor: `${statusColors.raging}1f` }}>Rage +2 dmg</span>
                )}
                {char.features.includes('Divine Strike') && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">+1d8 radiant</span>
                )}
                {char.features.includes("Hunter's Prey") && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">+1d8 wounded</span>
                )}
              </div>
            )}

            {/* Resources */}
            {Object.keys(char.featureUses).length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant">Resources</h4>
                {Object.entries(char.featureUses).sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded-component bg-surface-2">
                    <span className="text-body-sm text-on-surface capitalize">{key.replace(/-/g, ' ')}</span>
                    <span className="text-label-sm tabular-nums text-on-surface-variant">{val.max - val.used}/{val.max}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Features (alphabetical) */}
            {allFeatures.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant">Features</h4>
                {allFeatures.map((feat) => (
                  <FeatureItem key={feat.index} name={feat.name} description={feat.description} />
                ))}
              </div>
            )}

            {/* Consumables (alphabetical) */}
            {char.consumables.filter(c => c.quantity > 0).length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant">Items</h4>
                {[...char.consumables].filter(c => c.quantity > 0).sort((a, b) => a.name.localeCompare(b.name)).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-component bg-surface-2">
                    <GameIcon category="item" name="consumable-potion" size="md" className="text-on-surface-variant" />
                    <span className="text-body-sm text-on-surface">{item.name}</span>
                    <span className="text-label-sm text-on-surface-variant ml-auto">&times;{item.quantity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {hasCasting && (
          <TabsContent value="spells">
            <div className="flex flex-col gap-3">
              <SpellLevelHeader level="cantrip" />
              {[...char.spellcasting!.cantrips].sort().map((spell) => (
                <SpellListItem key={spell} spellIndex={spell} />
              ))}
              <div className="flex items-center justify-between mt-2">
                <SpellLevelHeader level={1} className="flex-1" />
                <SpellSlotPips total={char.spellcasting!.slotsTotal} used={char.spellcasting!.slotsUsed} size="md" className="ml-3" />
              </div>
              {[...char.spellcasting!.preparedSpells].sort().map((spell) => (
                <SpellListItem key={spell} spellIndex={spell} />
              ))}
            </div>
          </TabsContent>
        )}

        <TabsContent value="gear">
          <div className="flex flex-col gap-3">
            <EquipmentCard slot="weapon" iconName={getWeaponIcon(weapon.index)}
              label={weapon.name} stats={weapon.damageType} />
            {char.equipment.armor && (
              <EquipmentCard slot="armor" iconName="chain-mail"
                label={char.equipment.armor.name} stats={char.acSource}
                acValue={char.equipment.shield ? char.ac - 2 : char.ac} />
            )}
            {char.equipment.shield && (
              <EquipmentCard slot="shield" iconName="shield" label="Shield" stats="+2 AC" acValue={2} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
