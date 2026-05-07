'use client';

import { motion } from 'motion/react';
import { GameIcon } from '@/components/atoms/GameIcon';
import { Button } from '@/components/atoms/Button';
import type { LevelUpResult } from '@/data/progression';

// ─── Variants ────────────────────────────────────────────────

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.4 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const, staggerChildren: 0.12 } },
};

const lineVariant = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const titleLetter = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

function formatSpell(s: string) {
  return s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Component ───────────────────────────────────────────────

type LevelUpScreenProps = {
  results: LevelUpResult[];
  onContinue: () => void;
};

export function LevelUpScreen({ results, onContinue }: LevelUpScreenProps) {
  const title = 'Level Up!';
  const letters = title.split('');
  // Delay the cards container until after the title ticks in
  const titleDuration = letters.length * 0.05 + 0.4;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
      {/* Title — letter tick */}
      <motion.h2
        className="font-heading text-[clamp(1.5rem,5vw,2.5rem)] tracking-widest uppercase flex text-primary"
        initial="hidden"
        animate="show"
      >
        {letters.map((char, i) => (
          <motion.span
            key={i}
            variants={titleLetter}
            transition={{ duration: 0.2, delay: i * 0.05 }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.h2>

      {/* Character cards — staggered */}
      <motion.div
        className="flex flex-col gap-4 w-full max-w-lg"
        variants={container}
        initial="hidden"
        animate="show"
        transition={{ delayChildren: titleDuration }}
      >
        {results.map((r) => (
          <motion.div
            key={r.character.id}
            className="flex items-start gap-3 p-4 rounded-card bg-surface-2 overflow-hidden"
            variants={cardVariant}
          >
            <GameIcon category="class" name={r.character.classIndex} size="lg" className="text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              {/* Name + Level */}
              <motion.div className="flex items-baseline gap-2" variants={lineVariant}>
                <span className="text-body-md font-semibold text-on-surface">{r.character.name}</span>
                <span className="font-heading text-label-sm text-primary uppercase tracking-widest">
                  Level {r.newLevel}
                </span>
              </motion.div>

              {/* HP gained */}
              <motion.div className="flex items-center gap-2" variants={lineVariant}>
                <span className="text-label-sm text-on-surface-variant">HP</span>
                <span className="text-body-sm font-semibold text-on-surface">
                  {r.character.maxHp - r.hpGained} → {r.character.maxHp}
                </span>
                <span className="text-label-sm font-semibold text-success">+{r.hpGained}</span>
              </motion.div>

              {/* Stat boost */}
              {r.statBoost && (
                <motion.div className="flex items-center gap-2" variants={lineVariant}>
                  <span className="text-label-sm text-on-surface-variant">{r.statBoost.stat}</span>
                  <span className="text-body-sm font-semibold text-success">+{r.statBoost.amount}</span>
                </motion.div>
              )}

              {/* New features */}
              {r.newFeatures.map((feat) => (
                <motion.div
                  key={feat}
                  className="flex items-center gap-2"
                  variants={lineVariant}
                >
                  <span className="text-label-sm font-semibold uppercase tracking-widest text-primary">New</span>
                  <span className="text-body-sm text-on-surface">{feat}</span>
                </motion.div>
              ))}

              {/* New spells */}
              {r.newSpells.map((spell) => (
                <motion.div
                  key={spell}
                  className="flex items-center gap-2"
                  variants={lineVariant}
                >
                  <span className="text-label-sm font-semibold uppercase tracking-widest text-primary">Spell</span>
                  <span className="text-body-sm text-on-surface">{formatSpell(spell)}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Continue button — appears after all cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: titleDuration + results.length * 0.4 + 0.5 }}
      >
        <Button size="lg" onClick={onContinue}>Continue</Button>
      </motion.div>
    </div>
  );
}
