'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { classBuilds, casterProgression, type ClassBuild } from '@/data/classes';
import { classFeatures } from '@/data/feature-meta';
import { Button } from '@/components/atoms/Button';
import { GameIcon } from '@/components/atoms/GameIcon';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription, SheetFooter, SheetClose,
} from '@/components/atoms/Sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/atoms/Tabs';
import {
  HealthBar, SpellSlotPips, AcShield, StatRow, AttackLine,
  FeatureItem, SpellListItem, SpellLevelHeader, EquipmentCard,
} from '@/components/molecules';

function formatIndex(index: string) {
  return index.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getHp(build: ClassBuild) {
  return build.hitDie + Math.floor((build.stats.con - 10) / 2);
}

function getToHit(build: ClassBuild) {
  const prof = 2;
  // Melee uses STR, ranged uses DEX, finesse uses higher
  const strMod = Math.floor((build.stats.str - 10) / 2);
  const dexMod = Math.floor((build.stats.dex - 10) / 2);
  const weapon = build.startingEquipment.weapon;
  const isRanged = ['longbow', 'shortbow', 'light-crossbow', 'hand-crossbow'].includes(weapon);
  const isFinesse = ['shortsword', 'dagger', 'rapier'].includes(weapon);
  const mod = isRanged ? dexMod : isFinesse ? Math.max(strMod, dexMod) : strMod;
  return prof + mod;
}

function getWeaponDamage(build: ClassBuild): string {
  const strMod = Math.floor((build.stats.str - 10) / 2);
  const dexMod = Math.floor((build.stats.dex - 10) / 2);
  const weapon = build.startingEquipment.weapon;
  const isRanged = ['longbow', 'shortbow', 'light-crossbow', 'hand-crossbow'].includes(weapon);
  const isFinesse = ['shortsword', 'dagger', 'rapier'].includes(weapon);
  const mod = isRanged ? dexMod : isFinesse ? Math.max(strMod, dexMod) : strMod;

  const dice: Record<string, string> = {
    'longsword': '1d8', 'shortsword': '1d6', 'greataxe': '1d12',
    'mace': '1d6', 'longbow': '1d8', 'quarterstaff': '1d6',
  };
  const die = dice[weapon] || '1d6';
  const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
  return `${die}${modStr}`;
}

function getWeaponIcon(weapon: string): string {
  const map: Record<string, string> = {
    'longsword': 'sword', 'shortsword': 'sword', 'greataxe': 'axe',
    'mace': 'mace', 'longbow': 'bow', 'quarterstaff': 'orb-wand',
  };
  return map[weapon] || 'sword';
}

function getWeaponZone(weapon: string): string {
  const ranged = ['longbow', 'shortbow', 'light-crossbow', 'hand-crossbow'];
  const thrown = ['handaxe', 'javelin', 'dagger'];
  if (ranged.includes(weapon)) return 'any';
  if (thrown.includes(weapon)) return 'melee+adjacent';
  return 'melee';
}

function isTwoHanded(weapon: string): boolean {
  return ['greataxe', 'greatsword', 'longbow', 'shortbow', 'light-crossbow',
    'hand-crossbow', 'quarterstaff', 'pike', 'halberd', 'glaive', 'heavy-crossbow',
    'maul'].includes(weapon);
}

function getWeaponDamageType(weapon: string): string {
  const types: Record<string, string> = {
    'longsword': 'slashing', 'shortsword': 'piercing', 'greataxe': 'slashing',
    'mace': 'bludgeoning', 'longbow': 'piercing', 'quarterstaff': 'bludgeoning',
  };
  return types[weapon] || 'slashing';
}

export default function DraftPage() {
  const router = useRouter();
  const [party, setParty] = useState<(ClassBuild | null)[]>([null, null, null, null]);
  const [inspecting, setInspecting] = useState<ClassBuild | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filledCount = party.filter(Boolean).length;
  const partyFull = filledCount === 4;

  function inspectClass(build: ClassBuild) {
    setInspecting(build);
    setSheetOpen(true);
  }

  function confirmSelection() {
    if (!inspecting) return;
    const nextSlot = party.indexOf(null);
    if (nextSlot === -1) return;
    const next = [...party];
    next[nextSlot] = inspecting;
    setParty(next);
    setSheetOpen(false);
    setInspecting(null);
  }

  function removeFromSlot(index: number) {
    const next = [...party];
    next[index] = null;
    setParty(next);
  }

  function handleEmbark() {
    const selected = party.filter(Boolean) as ClassBuild[];
    if (selected.length !== 4) return;
    sessionStorage.setItem('party-wipe-draft', JSON.stringify(selected.map(b => b.index)));
    router.push('/game');
  }

  return (
    <div className="flex flex-col min-h-dvh bg-surface px-6 py-8 gap-8 animate-[fade-in_0.5s_ease-out]">

      {/* Header */}
      <header className="text-center flex flex-col items-center gap-1">
        <h1 className="font-[family-name:var(--font-heading)] text-[clamp(1.25rem,3vw,1.75rem)] font-normal tracking-[0.12em] uppercase text-primary">
          Assemble Your Party
        </h1>
        <p className="text-body-sm text-on-surface-variant tracking-[0.08em]">
          {partyFull ? 'Party assembled. Ready to embark.' : `Select ${4 - filledCount} more class${4 - filledCount !== 1 ? 'es' : ''}`}
        </p>
      </header>

      {/* Party Placards — 4 slots */}
      <section className="grid grid-cols-4 gap-4 max-w-[960px] w-full mx-auto">
        {party.map((member, i) => (
          <div
            key={i}
            className={`
              relative flex flex-col items-center justify-center gap-2 min-h-[180px] px-3
              rounded-card transition-all duration-200
              ${member
                ? 'border-[var(--bw-2)] border-solid border-primary bg-surface-2'
                : 'border-[var(--bw-2)] border-dashed border-outline-subtle bg-surface-1'
              }
            `}
          >
            {member ? (
              <>
                <button
                  onClick={() => removeFromSlot(i)}
                  className="absolute top-2 right-2 bg-transparent border-none text-on-surface-variant cursor-pointer p-1 rounded-component transition-colors hover:text-error hover:bg-error-container"
                >
                  <X className="size-4" />
                </button>
                <GameIcon category="class" name={member.index} size="xl" className="text-primary" />
                <span className="font-[family-name:var(--font-heading)] text-body-sm font-medium tracking-[0.08em] text-primary">
                  {member.name}
                </span>
                <HealthBar current={getHp(member)} max={getHp(member)} size="sm" />
                <div className="flex items-center gap-3">
                  <AcShield value={member.ac} size="sm" />
                  {member.spellcasting && (
                    <SpellSlotPips total={member.spellcasting.spellSlotsLevel1} size="sm" />
                  )}
                </div>
              </>
            ) : (
              <span className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4vw,3rem)] font-semibold text-outline-subtle leading-none">
                {i + 1}
              </span>
            )}
          </div>
        ))}
      </section>

      {/* Class Cards — 6 options (simplified: icon + name only) */}
      <section className="grid grid-cols-3 md:grid-cols-6 gap-4 max-w-[960px] w-full mx-auto">
        {classBuilds.map((build) => (
          <button
            key={build.index}
            onClick={() => inspectClass(build)}
            disabled={partyFull}
            className="flex flex-col items-center gap-2 px-3 py-4 border border-outline-subtle rounded-card bg-surface-1 cursor-pointer transition-all duration-200 hover:border-primary hover:bg-surface-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:border-outline-subtle"
          >
            <GameIcon category="class" name={build.index} size="xl" className="text-on-surface-variant" />
            <span className="font-[family-name:var(--font-heading)] text-body-sm font-medium tracking-[0.06em] text-on-surface">
              {build.name}
            </span>
          </button>
        ))}
      </section>

      {/* Embark button */}
      {partyFull && (
        <div className="flex justify-center animate-[fade-in_0.4s_ease-out]">
          <Button size="lg" onClick={handleEmbark}>
            Embark
          </Button>
        </div>
      )}

      {/* Class Inspection Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" size="lg" className="overflow-y-auto">
          {inspecting && (
            <>
              {/* Sheet Header — BG3-style: icon + name + vitals */}
              <SheetHeader>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <GameIcon category="class" name={inspecting.index} size="xl" className="text-primary" />
                    <AcShield value={inspecting.ac} size="md" />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div>
                      <SheetTitle>{inspecting.name}</SheetTitle>
                      <SheetDescription>{inspecting.role} · d{inspecting.hitDie} Hit Die</SheetDescription>
                    </div>
                    <HealthBar current={getHp(inspecting)} max={getHp(inspecting)} size="md" />
                    {inspecting.spellcasting && (
                      <div className="flex items-center gap-2">
                        <span className="text-label-sm text-on-surface-variant">Spell Slots</span>
                        <SpellSlotPips total={inspecting.spellcasting.spellSlotsLevel1} size="md" />
                      </div>
                    )}
                  </div>
                </div>
              </SheetHeader>

              <Tabs defaultValue="stats">
                <TabsList size="sm">
                  <TabsTrigger value="stats" size="sm">Stats</TabsTrigger>
                  <TabsTrigger value="movesets" size="sm">Movesets</TabsTrigger>
                  <TabsTrigger value="spells" size="sm">Spells</TabsTrigger>
                  <TabsTrigger value="equipment" size="sm">Equipment</TabsTrigger>
                  <TabsTrigger value="progression" size="sm">Progression</TabsTrigger>
                </TabsList>

                {/* Stats Tab — BG3-style horizontal stat row + derived values */}
                <TabsContent value="stats">
                  <div className="flex flex-col gap-5">
                    <StatRow stats={inspecting.stats} proficientSaves={inspecting.savingThrows} />

                    <div className="flex flex-col gap-3">
                      <h4 className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant">Derived Stats</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1 p-3 rounded-component bg-surface-2">
                          <span className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">Armor Class</span>
                          <span className="text-body-md font-bold text-on-surface">{inspecting.ac}</span>
                          <span className="text-[10px] text-on-surface-variant">{inspecting.acSource}</span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 rounded-component bg-surface-2">
                          <span className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">Hit Points</span>
                          <span className="text-body-md font-bold text-on-surface">{getHp(inspecting)}</span>
                          <span className="text-[10px] text-on-surface-variant">d{inspecting.hitDie} + CON</span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 rounded-component bg-surface-2">
                          <span className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">Proficiency Bonus</span>
                          <span className="text-body-md font-bold text-primary">+2</span>
                          <span className="text-[10px] text-on-surface-variant">Level 1</span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 rounded-component bg-surface-2">
                          <span className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">Saving Throws</span>
                          <span className="text-body-md font-bold text-on-surface">{inspecting.savingThrows.join(', ')}</span>
                          <span className="text-[10px] text-on-surface-variant">Proficient</span>
                        </div>
                      </div>
                    </div>

                    {inspecting.spellcasting && (
                      <div className="flex flex-col gap-3">
                        <h4 className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant">Spellcasting</h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="flex flex-col items-center gap-1 p-3 rounded-component bg-surface-2">
                            <span className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">Ability</span>
                            <span className="text-body-md font-bold text-primary">{inspecting.spellcasting.ability}</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 p-3 rounded-component bg-surface-2">
                            <span className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">Save DC</span>
                            <span className="text-body-md font-bold text-on-surface">{inspecting.spellcasting.spellSaveDC}</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 p-3 rounded-component bg-surface-2">
                            <span className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">Attack</span>
                            <span className="text-body-md font-bold text-on-surface">+{inspecting.spellcasting.spellAttackBonus}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Movesets Tab */}
                <TabsContent value="movesets">
                  <div className="flex flex-col gap-4">
                    <AttackLine
                      iconName={getWeaponIcon(inspecting.startingEquipment.weapon)}
                      label={formatIndex(inspecting.startingEquipment.weapon)}
                      toHit={getToHit(inspecting)}
                      damage={getWeaponDamage(inspecting)}
                      damageType={getWeaponDamageType(inspecting.startingEquipment.weapon)}
                      zone={getWeaponZone(inspecting.startingEquipment.weapon)}
                    />

                    <div className="flex flex-col gap-2">
                      <h4 className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant">Features</h4>
                      {(classFeatures[inspecting.index]?.[1] || [])
                        .filter(f => !f.hasParent)
                        .map((feat) => (
                          <FeatureItem
                            key={feat.index}
                            name={feat.name}
                            description={feat.description}
                          />
                        ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Spells Tab */}
                <TabsContent value="spells">
                  {inspecting.spellcasting ? (
                    <div className="flex flex-col gap-3">
                      <SpellLevelHeader level="cantrip" />
                      {inspecting.spellcasting.cantrips.map((spell) => (
                        <SpellListItem key={spell} spellIndex={spell} />
                      ))}

                      <div className="flex items-center justify-between mt-2">
                        <SpellLevelHeader level={1} className="flex-1" />
                        <SpellSlotPips total={inspecting.spellcasting.spellSlotsLevel1} size="md" className="ml-3" />
                      </div>
                      {inspecting.spellcasting.preparedSpells.map((spell) => (
                        <SpellListItem key={spell} spellIndex={spell} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8 text-on-surface-variant">
                      <span className="text-body-md">No spellcasting at Level 1</span>
                      {inspecting.index === 'ranger' && (
                        <span className="text-body-sm">Ranger unlocks spellcasting at Level 2</span>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Equipment Tab */}
                <TabsContent value="equipment">
                  <div className="flex flex-col gap-4">
                    {/* Hands — side by side or full-width for two-handed */}
                    {isTwoHanded(inspecting.startingEquipment.weapon) ? (
                      <div className="flex flex-col gap-2">
                        <h4 className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant">Both Hands</h4>
                        <AttackLine
                          iconName={getWeaponIcon(inspecting.startingEquipment.weapon)}
                          label={formatIndex(inspecting.startingEquipment.weapon)}
                          toHit={getToHit(inspecting)}
                          damage={getWeaponDamage(inspecting)}
                          damageType={getWeaponDamageType(inspecting.startingEquipment.weapon)}
                          zone={getWeaponZone(inspecting.startingEquipment.weapon)}
                        />
                        <span className="text-[10px] text-on-surface-variant italic pl-1">
                          Two-handed — cannot equip a shield
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-2">
                          <h4 className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant">Main Hand</h4>
                          <EquipmentCard
                            slot="weapon"
                            iconName={getWeaponIcon(inspecting.startingEquipment.weapon)}
                            label={formatIndex(inspecting.startingEquipment.weapon)}
                            stats={`${getWeaponDamage(inspecting)} ${getWeaponDamageType(inspecting.startingEquipment.weapon)}`}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <h4 className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant">Off Hand</h4>
                          {inspecting.startingEquipment.shield ? (
                            <EquipmentCard
                              slot="shield"
                              iconName="shield"
                              label="Shield"
                              stats="+2 AC"
                              acValue={2}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full min-h-[60px] rounded-component border border-dashed border-outline-subtle bg-surface-1">
                              <span className="text-[10px] text-outline-subtle uppercase tracking-[0.1em]">Empty</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Body — Armor */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant">Body</h4>
                      {inspecting.startingEquipment.armor !== 'none' ? (
                        <EquipmentCard
                          slot="armor"
                          iconName="chain-mail"
                          label={formatIndex(inspecting.startingEquipment.armor)}
                          stats={inspecting.acSource}
                          acValue={inspecting.startingEquipment.shield ? inspecting.ac - 2 : inspecting.ac}
                        />
                      ) : (
                        <FeatureItem
                          name={inspecting.index === 'barbarian' ? 'Unarmored Defense' : 'Mage Armor'}
                          description={inspecting.index === 'barbarian'
                            ? `AC = 10 + DEX + CON = ${inspecting.ac}. No armor needed.`
                            : `AC = 13 + DEX = 15 when active. Costs one spell slot, lasts 8 hours.`
                          }
                        />
                      )}
                    </div>

                    {/* Total AC summary */}
                    <div className="flex items-center justify-center gap-3 pt-2 border-t border-outline-subtle">
                      <AcShield value={inspecting.ac} size="lg" />
                      <div className="flex flex-col">
                        <span className="text-body-sm font-semibold text-on-surface">Total Armor Class</span>
                        <span className="text-[10px] text-on-surface-variant">{inspecting.acSource}{inspecting.startingEquipment.shield ? ' + Shield' : ''}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Progression Tab */}
                <TabsContent value="progression">
                  <div className="flex flex-col gap-5">
                    {/* Features by level from SRD */}
                    {classFeatures[inspecting.index] && (
                      <div className="flex flex-col gap-4">
                        <h4 className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant">Features by Level</h4>
                        {Object.entries(classFeatures[inspecting.index])
                          .sort(([a], [b]) => Number(a) - Number(b))
                          .map(([level, feats]) => (
                            <div key={level} className="flex flex-col gap-2">
                              <span className="text-label-sm font-semibold text-primary">Level {level}</span>
                              {feats.filter(f => !f.hasParent).map((feat) => (
                                <FeatureItem
                                  key={feat.index}
                                  name={feat.name}
                                  description={feat.description}
                                />
                              ))}
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Spell progression for casters */}
                    {casterProgression[inspecting.index] && (
                      <div className="flex flex-col gap-3">
                        <h4 className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant">New Spells Unlocked</h4>
                        {Object.entries(casterProgression[inspecting.index].newSpellsPerLevel).map(([level, spells]) => (
                          <div key={level} className="flex flex-col gap-2">
                            <span className="text-label-sm font-semibold text-primary">Class Level {level}</span>
                            {spells.map((spell) => (
                              <SpellListItem key={spell} spellIndex={spell} />
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="ghost" size="md">Cancel</Button>
                </SheetClose>
                <Button
                  size="md"
                  onClick={confirmSelection}
                  disabled={partyFull}
                >
                  {partyFull ? 'Party Full' : `Add ${inspecting.name}`}
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
