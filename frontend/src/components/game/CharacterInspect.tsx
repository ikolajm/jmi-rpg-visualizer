'use client';

import { GameIcon } from '@/components/atoms/GameIcon';
import { SheetHeader, SheetTitle } from '@/components/atoms/Sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/atoms/Tabs';
import {
  HealthBar, AcShield, StatRow, AttackLine, CreatureHeader,
  SpellSlotPips, FeatureItem, SpellListItem, SpellLevelHeader, EquipmentCard,
} from '@/components/molecules';
import { classFeatures } from '@/data/feature-meta';
import { casterProgression } from '@/data/classes';
import { V1_FEATURES, V1_FEATURE_SUMMARIES, getConsumable } from '@/data/v1-roster';
import { getWeaponIcon } from '@/data/weapon-helpers';
import { statMod } from '@/data/dice';
import { XP_THRESHOLDS, proficiencyBonus } from '@/data/progression';
import { CONDITION_VISUALS } from '@/data/condition-visuals';
import { tint } from '@/data/color-utils';
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

type CharacterInspectProps = {
  char: Character;
  mode?: 'draft' | 'combat';
};

export function CharacterInspect({ char, mode = 'combat' }: CharacterInspectProps) {
  const { state } = useGame();
  const isDraft = mode === 'draft';
  const activeEffects = isDraft ? [] : (state.combat?.activeEffects.filter(e => e.targetId === char.id) || []);
  const prof = proficiencyBonus(char.level);
  const strMod_ = statMod(char.stats.str);
  const dexMod_ = statMod(char.stats.dex);
  const weapon = char.equipment.weapon;
  const isRanged = weapon.weaponRange === 'ranged';
  const isFinesse = weapon.properties.includes('finesse');
  const attackMod = isRanged ? dexMod_ : isFinesse ? Math.max(strMod_, dexMod_) : strMod_;
  const toHit = attackMod + prof;

  const xpNext = XP_THRESHOLDS[char.level + 1];
  const xpCurrent = char.xp;
  const xpPrev = XP_THRESHOLDS[char.level] || 0;
  const xpProgress = xpNext ? Math.min(1, (xpCurrent - xpPrev) / (xpNext - xpPrev)) : 1;

  const allFeatures = aggregateFeatures(char.classIndex, char.level);
  const hasCasting = !!char.spellcasting;

  const hasItems = !isDraft && char.consumables.some(c => c.quantity > 0);
  const isTwoHanded = weapon.properties.includes('two-handed');
  const tabs = [
    { id: 'stats', label: 'Stats' },
    { id: 'combat', label: 'Combat' },
    ...(hasCasting ? [{ id: 'spells', label: 'Spells' }] : []),
    ...(hasItems ? [{ id: 'items', label: 'Items' }] : []),
    { id: 'gear', label: 'Gear' },
    ...(isDraft ? [{ id: 'progression', label: 'Progression' }] : []),
  ];

  return (
    <>
      <SheetHeader>
        <SheetTitle className="sr-only">{char.name}</SheetTitle>
        <div className="flex flex-col gap-2">
          <CreatureHeader name={char.name} />
          {/* HP + AC row */}
          <div className="flex items-center gap-1.5">
            <HealthBar current={char.hp} max={char.maxHp} size="md" className="flex-1" />
            <AcShield value={char.ac} size="sm" />
          </div>
          {/* Spell slots (casters only) */}
          {hasCasting && (
            <div className="flex items-center gap-2">
              {/* <span className="text-label-sm text-on-surface-variant">Spell Slots</span> */}
              <SpellSlotPips total={char.spellcasting!.slotsTotal} used={char.spellcasting!.slotsUsed} size="md" />
            </div>
          )}
          {/* Level + XP bar — combat only */}
          {!isDraft && (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-label-sm font-semibold text-primary uppercase tracking-widest shrink-0">Lvl {char.level}</span>
                <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden flex-1">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${xpProgress * 100}%` }} />
                </div>
              </div>
              <span className="text-label-sm tabular-nums text-on-surface-variant self-end">
                {xpCurrent}{xpNext ? ` / ${xpNext}` : ' (max)'}
              </span>
            </div>
          )}
        </div>
      </SheetHeader>

      <Tabs defaultValue="stats" className="mt-4">
        <TabsList size="sm">
          {tabs.map(t => <TabsTrigger key={t.id} value={t.id} size="sm">{t.label}</TabsTrigger>)}
        </TabsList>

        {/* ── Stats ──────────────────────────────────────── */}
        <TabsContent value="stats">
          <div className="flex flex-col gap-4">
            <StatRow stats={char.stats} proficientSaves={char.savingThrows} />

            <div className="h-px bg-primary/30" />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 p-3 rounded-component bg-surface-2">
                <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">Proficiency</span>
                <span className="text-body-md font-bold text-primary">+{prof}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-component bg-surface-2">
                <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">Saving Throws</span>
                <span className="text-body-md font-bold text-on-surface">{char.savingThrows.join(', ')}</span>
              </div>
            </div>

            {hasCasting && (
              <>
              <div className="h-px bg-primary/30" />
              <div className="flex flex-col gap-2">
                <h4 className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">Spellcasting</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center gap-1 p-3 rounded-component bg-surface-2">
                    <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">Ability</span>
                    <span className="text-body-md font-bold text-primary">{char.spellcasting!.ability}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-3 rounded-component bg-surface-2">
                    <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">Save DC</span>
                    <span className="text-body-md font-bold text-on-surface">{char.spellcasting!.spellSaveDC}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-3 rounded-component bg-surface-2">
                    <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">Attack</span>
                    <span className="text-body-md font-bold text-on-surface">+{char.spellcasting!.spellAttackBonus}</span>
                  </div>
                </div>
              </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* ── Combat ─────────────────────────────────────── */}
        <TabsContent value="combat">
          <div className="flex flex-col gap-3">
            {activeEffects.length > 0 && <ConditionList effects={activeEffects} />}

            {/* Attacks */}
            <h4 className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">Attacks</h4>
            <AttackLine
              iconName={getWeaponIcon(weapon.index)}
              label={weapon.name}
              toHit={toHit}
              damage={weapon.damage + (attackMod >= 0 ? '+' : '') + attackMod}
              damageType={weapon.damageType}
              zone={isRanged ? 'any' : 'melee'}
            />
            {weapon.onHit && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-component bg-primary/10 border border-primary/20">
                <span className="text-label-sm font-semibold uppercase tracking-widest text-primary">On-Hit</span>
                <span className="text-label-sm text-on-surface">{weapon.onHit.description}</span>
              </div>
            )}

            {/* Features — explained list items */}
            {(() => {
              const featsWithSummary = allFeatures
                .map(f => ({ index: f.index, name: f.name, summary: V1_FEATURE_SUMMARIES[f.index] }))
                .filter((b): b is { index: string; name: string; summary: NonNullable<typeof b.summary> } => !!b.summary);
              if (featsWithSummary.length === 0) return null;
              return (
                <>
                  <div className="h-px bg-primary/30" />
                  <h4 className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">Features</h4>
                  <div className="flex flex-col gap-2">
                    {featsWithSummary.map(({ index, name, summary }) => (
                      <div key={index} className="flex flex-col gap-0.5 p-2 rounded-component bg-surface-2">
                        <div className="flex items-center justify-between">
                          <span className="text-body-sm font-semibold text-on-surface">{name}</span>
                          <span className="text-label-sm font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                            {typeof summary.badge === 'function' ? summary.badge(char.level) : summary.badge}
                          </span>
                        </div>
                        <span className="text-label-sm text-on-surface-variant">
                          {typeof summary.detail === 'function' ? summary.detail(char.level) : summary.detail}
                        </span>
                      </div>
                    ))}
                    {char.statusEffects.includes('raging') && (
                      <div className="flex items-center gap-2 p-2 rounded-component" style={{ backgroundColor: tint(CONDITION_VISUALS.raging.color, 7) }}>
                        <span className="text-body-sm font-semibold" style={{ color: CONDITION_VISUALS.raging.color }}>Rage Active</span>
                        <span className="text-label-sm text-on-surface-variant">+2 melee damage, resistance to physical damage.</span>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}

            {/* Resources — combat only */}
            {!isDraft && Object.keys(char.featureUses).length > 0 && (
              <>
              <div className="h-px bg-primary/30" />
              <h4 className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">Resources</h4>
              <div className="flex flex-col gap-2">
                {Object.entries(char.featureUses).sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded-component bg-surface-2">
                    <span className="text-body-sm text-on-surface capitalize">{key.replace(/-/g, ' ')}</span>
                    <span className="text-label-sm tabular-nums text-on-surface-variant">{val.max - val.used}/{val.max}</span>
                  </div>
                ))}
              </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* ── Spells ─────────────────────────────────────── */}
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

        {/* ── Gear ───────────────────────────────────────── */}
        <TabsContent value="gear">
          <div className="flex flex-col gap-3">
            {/* Main Hand */}
            <div className="flex flex-col gap-1">
              <h4 className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">
                {isTwoHanded ? 'Both Hands' : 'Main Hand'}
              </h4>
              <EquipmentCard slot="weapon" iconName={getWeaponIcon(weapon.index)}
                label={weapon.name} stats={`${weapon.damage} ${weapon.damageType}`} />
              {weapon.onHit && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-component bg-primary/10 border border-primary/20">
                  <span className="text-label-sm font-semibold uppercase tracking-widest text-primary">On-Hit</span>
                  <span className="text-label-sm text-on-surface">{weapon.onHit.description}</span>
                </div>
              )}
            </div>

            {/* Off Hand (only if not two-handed) */}
            {!isTwoHanded && (
              <div className="flex flex-col gap-1">
                <h4 className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">Off Hand</h4>
                {char.equipment.shield ? (
                  <EquipmentCard slot="shield" iconName="shield" label="Shield" stats="+2 AC" acValue={2} />
                ) : (
                  <div className="flex items-center justify-center h-12 rounded-component border border-dashed border-outline-subtle bg-surface-1">
                    <span className="text-label-sm text-outline-subtle uppercase tracking-widest">Empty</span>
                  </div>
                )}
              </div>
            )}

            <div className="h-px bg-primary/30" />

            {/* Body */}
            <div className="flex flex-col gap-1">
              <h4 className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">Body</h4>
              {char.equipment.armor ? (
                <EquipmentCard slot="armor" iconName="chain-mail"
                  label={char.equipment.armor.name}
                  stats={`AC ${char.equipment.armor.acBase}${char.equipment.armor.acDexCap === 0 ? '' : char.equipment.armor.acDexCap ? ` + DEX (max ${char.equipment.armor.acDexCap})` : ' + DEX'}`} />
              ) : (
                <div className="flex flex-col gap-0.5 p-2 rounded-component bg-surface-2">
                  <span className="text-body-sm font-semibold text-on-surface">
                    {char.classIndex === 'barbarian' ? 'Unarmored Defense' : 'Mage Armor'}
                  </span>
                  <span className="text-label-sm text-on-surface-variant">
                    {char.classIndex === 'barbarian'
                      ? `AC = 10 + DEX + CON = ${char.ac}`
                      : `AC = 13 + DEX = 15 when active`}
                  </span>
                </div>
              )}
            </div>

            <div className="h-px bg-primary/30" />

            {/* AC Summary */}
            <div className="flex items-center justify-center gap-3">
              <AcShield value={char.ac} size="lg" />
              <div className="flex flex-col">
                <span className="text-body-sm font-semibold text-on-surface">Total AC {char.ac}</span>
                <span className="text-label-sm text-on-surface-variant">
                  {char.equipment.armor ? char.equipment.armor.name : (char.classIndex === 'barbarian' ? 'Unarmored Defense' : 'Mage Armor')}
                  {char.equipment.shield ? ' + Shield' : ''}
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Items (combat only) ────────────────────────── */}
        {hasItems && (
          <TabsContent value="items">
            <div className="flex flex-col gap-2">
              {[...char.consumables].filter(c => c.quantity > 0)
                .sort((a, b) => (getConsumable(a.id)?.name ?? '').localeCompare(getConsumable(b.id)?.name ?? ''))
                .map((item) => {
                  const def = getConsumable(item.id);
                  if (!def) return null;
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-component bg-surface-2">
                      <GameIcon category="item" name="consumable-potion" size="md" className="text-on-surface-variant" />
                      <div className="flex flex-col flex-1">
                        <span className="text-body-sm text-on-surface">{def.name}</span>
                        <span className="text-label-sm text-on-surface-variant">{def.effect === 'heal' ? 'Restores HP' : 'Casts a spell'}</span>
                      </div>
                      <span className="text-label-sm tabular-nums text-on-surface-variant">&times;{item.quantity}</span>
                    </div>
                  );
                })}
            </div>
          </TabsContent>
        )}

        {/* ── Progression (draft only) ───────────────────── */}
        {isDraft && (
          <TabsContent value="progression">
            <div className="flex flex-col gap-5">
              {classFeatures[char.classIndex] && (() => {
                const allowed = V1_FEATURES[char.classIndex];
                const levels = Object.entries(classFeatures[char.classIndex])
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([level, feats]) => ({
                    level,
                    feats: feats.filter(f => !f.hasParent && (!allowed || allowed.has(f.index))),
                  }))
                  .filter(l => l.feats.length > 0);

                if (levels.length === 0) return null;
                return (
                  <div className="flex flex-col gap-4">
                    <h4 className="text-label-md uppercase tracking-widest text-on-surface-variant">Features by Level</h4>
                    {levels.map(({ level, feats }) => (
                      <div key={level} className="flex flex-col gap-2">
                        <span className="text-label-sm font-semibold text-primary">Level {level}</span>
                        {feats.map((feat) => (
                          <FeatureItem key={feat.index} name={feat.name} description={feat.description} />
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })()}

              {casterProgression[char.classIndex] && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-label-md uppercase tracking-widest text-on-surface-variant">Spells by Level</h4>
                  {Object.entries(casterProgression[char.classIndex].newSpellsPerLevel).map(([level, spells]) => (
                    <div key={level} className="flex flex-col gap-2">
                      <span className="text-label-sm font-semibold text-primary">Level {level}</span>
                      {spells.map((spell) => (
                        <SpellListItem key={spell} spellIndex={spell} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </>
  );
}
