'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Heart, Shield } from 'lucide-react';
import { classBuilds, type ClassBuild } from '@/data/classes';
import { GameProvider } from '@/components/providers/GameProvider';
import { createCharacter } from '@/data/character-factory';
import { statMod } from '@/data/dice';
import { Button } from '@/components/atoms/Button';
import { GameIcon } from '@/components/atoms/GameIcon';
import {
  Sheet, SheetContent, SheetFooter, SheetClose,
} from '@/components/atoms/Sheet';
import { SpellSlotPips } from '@/components/molecules';
import { CharacterInspect } from '@/components/game/CharacterInspect';

function getHp(build: ClassBuild) {
  return build.hitDie + statMod(build.stats.con);
}

export default function DraftPage() {
  const router = useRouter();
  const [party, setParty] = useState<(ClassBuild | null)[]>([null, null, null, null]);
  const [inspecting, setInspecting] = useState<ClassBuild | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [exiting, setExiting] = useState(false);

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
    setExiting(true);
    setTimeout(() => router.push('/game'), 600);
  }

  return (
    <div className={`flex flex-col min-h-dvh bg-surface px-6 py-8 gap-8 transition-opacity duration-500 ${exiting ? 'opacity-0' : 'animate-[fade-in_0.5s_ease-out]'}`}>

      {/* Header */}
      <header className="text-center flex flex-col items-center gap-1">
        <h1 className="font-heading text-[clamp(1.25rem,3vw,1.75rem)] font-normal tracking-widest uppercase text-primary">
          Assemble Your Party
        </h1>
        <p className="text-body-sm text-on-surface-variant tracking-widest">
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
                ? 'border-2 border-solid border-primary bg-surface-2'
                : 'border-2 border-dashed border-outline-subtle bg-surface-1'
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
                <span className="font-heading text-body-sm font-medium tracking-widest text-primary">
                  {member.name}
                </span>
                <span className="text-label-sm text-on-surface-variant">{member.role}</span>
                <div className="flex items-center justify-center gap-3">
                  <span className="inline-flex items-center gap-1 text-label-md tabular-nums text-on-surface-variant">
                    <Heart className="size-5 fill-current text-error" />{getHp(member)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-label-md tabular-nums text-on-surface-variant">
                    <Shield className="size-5 text-primary" />{member.ac}
                  </span>
                </div>
                {member.spellcasting && (
                  <SpellSlotPips total={member.spellcasting.spellSlotsLevel1} size="sm" />
                )}
              </>
            ) : (
              <span className="font-heading text-[clamp(2rem,4vw,3rem)] font-semibold text-outline-subtle leading-none">
                {i + 1}
              </span>
            )}
          </div>
        ))}
      </section>

      {/* Class Cards — 6 options */}
      <section className="grid grid-cols-3 md:grid-cols-6 gap-4 max-w-[960px] w-full mx-auto">
        {classBuilds.map((build) => {
          const draftedCount = party.filter(m => m?.index === build.index).length;
          return (
            <button
              key={build.index}
              onClick={() => inspectClass(build)}
              disabled={partyFull}
              className={`flex flex-col items-center gap-2 px-3 py-4 border rounded-card bg-surface-1 cursor-pointer transition-all duration-200 hover:border-primary hover:bg-surface-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:border-outline-subtle
                ${draftedCount > 0 ? 'border-primary/40' : 'border-outline-subtle'}`}
            >
              <GameIcon category="class" name={build.index} size="xl" className={draftedCount > 0 ? 'text-primary' : 'text-on-surface-variant'} />
              <span className="font-heading text-body-sm font-medium tracking-wider text-on-surface">
                {build.name}
              </span>
              <span className="text-label-sm text-on-surface-variant">{build.role}</span>
              {draftedCount > 0 && (
                <span className="text-label-sm font-semibold text-primary">{draftedCount}× drafted</span>
              )}
            </button>
          );
        })}
      </section>

      {/* Embark */}
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
            <GameProvider>
              {(() => {
                const previewChar = createCharacter(inspecting, 0);
                return (
                  <>
                    <CharacterInspect char={previewChar} mode="draft" />
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
                );
              })()}
            </GameProvider>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
