'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameIcon } from '@/components/atoms/GameIcon';
import { Button } from '@/components/atoms/Button';
import { DamageInline } from '@/components/molecules/DamageIcon';
import { rarityColors } from '@/data/game-colors';
import { statMod } from '@/data/dice';
import type { LootItem } from '@/data/loot-generator';
import type { Character } from '@/data/game-types';

// ─── Animation Variants ──────────────────────────────────────

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const cardDrop = {
  hidden: { opacity: 0, y: -40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

// ─── Stat Comparison Helpers ─────────────────────────────────

function getWeaponCompare(item: LootItem, char: Character) {
  const current = char.equipment.weapon;
  return {
    current: `${current.damage} ${current.damageType}`,
    next: `${item.damage} ${item.damageType}`,
    currentName: current.name,
  };
}

function getArmorCompare(item: LootItem, char: Character) {
  const dexMod_ = statMod(char.stats.dex);
  const dexBonus = item.acDexCap !== undefined ? Math.min(dexMod_, item.acDexCap) : dexMod_;
  const newAc = (item.acBase || 0) + dexBonus + (char.equipment.shield ? 2 : 0);
  return {
    currentAc: char.ac,
    newAc,
    currentName: char.equipment.armor?.name || 'None',
    diff: newAc - char.ac,
  };
}

// ─── Component ───────────────────────────────────────────────

type LootScreenProps = {
  choices: LootItem[];
  party: Character[];
  onPick: (item: LootItem, charId: string) => void;
  onSkip: () => void;
};

type Step = 'choose' | 'assign';

export function LootScreen({ choices, party, onPick, onSkip }: LootScreenProps) {
  const [selected, setSelected] = useState<LootItem | null>(null);
  const [step, setStep] = useState<Step>('choose');
  const aliveParty = party.filter(c => c.isAlive);

  function handleSelect(item: LootItem) {
    setSelected(item);
    setStep('assign');
  }

  function handleBack() {
    setSelected(null);
    setStep('choose');
  }

  function handleConfirm(charId: string) {
    if (!selected) return;
    onPick(selected, charId);
  }

  return (
    <div className="relative h-full overflow-hidden">
      {/* Background — chest watermark */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none text-primary"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.05, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <GameIcon category="room" name="treasure" size="xl" className="w-[50%] h-[50%] max-w-[350px] max-h-[350px]" />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6 px-6">
        {/* Title */}
        <motion.h2
          className="font-heading text-title-lg text-primary tracking-widest uppercase"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {step === 'choose' ? 'Choose Your Loot' : selected?.name}
        </motion.h2>

        {/* Step 1: Card selection */}
        <AnimatePresence mode="wait">
          {step === 'choose' && (
            <motion.div
              key="cards"
              className="flex gap-4 flex-wrap justify-center"
              variants={container}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            >
              {choices.map((item) => {
                const rarityColor = rarityColors[item.rarity.toLowerCase()] || rarityColors.common;
                return (
                  <motion.button
                    key={item.index}
                    variants={cardDrop}
                    onClick={() => handleSelect(item)}
                    className="flex flex-col items-start gap-2 p-4 rounded-card bg-surface-2 border-2 border-outline-subtle hover:border-primary transition-colors w-56 text-left"
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-label-sm font-semibold uppercase tracking-widest" style={{ color: rarityColor }}>
                        {item.rarity}
                      </span>
                      <span className="text-label-sm text-on-surface-variant capitalize">{item.category}</span>
                    </div>
                    <span className="text-body-md text-on-surface font-semibold">{item.name}</span>
                    {item.damage && item.damageType && (
                      <DamageInline type={item.damageType} damage={item.damage} />
                    )}
                    {item.acBase !== undefined && (
                      <span className="text-label-sm text-on-surface-variant">
                        AC {item.acBase}{item.acDexCap === undefined ? ' + DEX' : item.acDexCap > 0 ? ` + DEX (max ${item.acDexCap})` : ''}
                      </span>
                    )}
                    {item.onHit && (
                      <span className="text-label-sm text-primary">{item.onHit.description}</span>
                    )}
                    {item.category === 'consumable' && item.description && (
                      <span className="text-label-sm text-on-surface-variant">{item.description}</span>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {/* Step 2: Assign to character with comparison */}
          {step === 'assign' && selected && (
            <motion.div
              key="assign"
              className="flex flex-col items-center gap-5 w-full max-w-lg"
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              variants={container}
            >
              {/* Selected item summary */}
              <motion.div
                className="flex flex-col items-center gap-1 px-5 py-3 rounded-card bg-surface-2 border border-primary/30"
                variants={fadeIn}
              >
                <span className="text-label-sm font-semibold uppercase tracking-widest" style={{ color: rarityColors[selected.rarity.toLowerCase()] || rarityColors.common }}>
                  {selected.rarity} {selected.category}
                </span>
                {selected.damage && selected.damageType && (
                  <DamageInline type={selected.damageType} damage={selected.damage} />
                )}
                {selected.acBase !== undefined && (
                  <span className="text-label-sm text-on-surface-variant">AC {selected.acBase}</span>
                )}
                {selected.onHit && (
                  <span className="text-label-sm text-primary">{selected.onHit.description}</span>
                )}
              </motion.div>

              {/* Recipient list with stat comparison */}
              <motion.span className="text-label-sm uppercase tracking-widest text-on-surface-variant" variants={fadeIn}>
                Assign to
              </motion.span>
              <div className="flex flex-col gap-2 w-full">
                {aliveParty.map((char) => {
                  // Stat comparison
                  let comparison: React.ReactNode = null;
                  if (selected.category === 'weapon' && selected.damage) {
                    const cmp = getWeaponCompare(selected, char);
                    comparison = (
                      <span className="text-label-sm text-on-surface-variant">
                        {cmp.currentName}: {cmp.current} → {cmp.next}
                      </span>
                    );
                  } else if (selected.category === 'armor' && selected.acBase !== undefined) {
                    const cmp = getArmorCompare(selected, char);
                    const diffColor = cmp.diff > 0 ? 'text-success' : cmp.diff < 0 ? 'text-error' : 'text-on-surface-variant';
                    comparison = (
                      <span className="text-label-sm text-on-surface-variant">
                        AC {cmp.currentAc} → {cmp.newAc}{' '}
                        <span className={diffColor}>({cmp.diff > 0 ? '+' : ''}{cmp.diff})</span>
                      </span>
                    );
                  } else if (selected.category === 'consumable') {
                    const existing = char.consumables.find(c => c.id === selected.index);
                    comparison = (
                      <span className="text-label-sm text-on-surface-variant">
                        {existing ? `Has ${existing.quantity} → ${existing.quantity + 1}` : 'New item'}
                      </span>
                    );
                  }

                  return (
                    <motion.button
                      key={char.id}
                      className="flex items-center gap-3 p-3 rounded-card bg-surface-2 border border-outline-subtle hover:border-primary transition-colors text-left w-full"
                      variants={fadeUp}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleConfirm(char.id)}
                    >
                      <GameIcon category="class" name={char.classIndex} size="md" className="text-primary shrink-0" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-body-sm font-semibold text-on-surface">{char.name}</span>
                        {comparison}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Back button */}
              <motion.div variants={fadeIn}>
                <Button variant="ghost" size="sm" onClick={handleBack}>Back</Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip */}
        <motion.button
          className="text-label-sm text-on-surface-variant hover:text-on-surface underline"
          onClick={onSkip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Skip
        </motion.button>
      </div>
    </div>
  );
}
