'use client';

import { motion } from 'motion/react';
import { GameIcon } from '@/components/atoms/GameIcon';
import { Button } from '@/components/atoms/Button';
import type { RunStats } from '@/data/game-types';

// ─── Variants ────────────────────────────────────────────────

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2, delayChildren: 0.8 } },
};

const statLine = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const titleLetter = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

// ─── Stats Config ────────────────────────────────────────────

function buildStats(stats: RunStats, floor: number) {
  return [
    { label: 'Floor Reached', value: floor },
    { label: 'Rooms Cleared', value: stats.roomsCleared },
    { label: 'Enemies Killed', value: stats.enemiesKilled },
    { label: 'Damage Dealt', value: stats.totalDamageDealt.toLocaleString() },
    { label: 'Damage Taken', value: stats.totalDamageTaken.toLocaleString() },
    { label: 'Characters Lost', value: stats.charactersLost },
  ];
}

// ─── Component ───────────────────────────────────────────────

type GameOverScreenProps = {
  stats: RunStats;
  floor: number;
  onRetry: () => void;
};

export function GameOverScreen({ stats, floor, onRetry }: GameOverScreenProps) {
  const title = 'Total Party Kill';
  const titleLetters = title.split('');
  const titleDuration = titleLetters.length * 0.05 + 0.6;

  const tagline = 'Party: Wiped.';
  const tagLetters = tagline.split('');

  const statItems = buildStats(stats, floor);
  const statsDuration = titleDuration + statItems.length * 0.2 + 0.4;

  return (
    <div className="relative h-full overflow-hidden">
      {/* Background — death icon watermark */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none text-error"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.06, scale: 1 }}
        transition={{ duration: 1.5 }}
      >
        <GameIcon category="ui" name="death" size="xl" className="w-[50%] h-[50%] max-w-[350px] max-h-[350px]" />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6 px-6">
        {/* Title — slow letter tick in error color */}
        <motion.h2
          className="font-heading text-[clamp(1.5rem,5vw,2.5rem)] tracking-widest uppercase flex text-error"
          initial="hidden"
          animate="show"
        >
          {titleLetters.map((char, i) => (
            <motion.span
              key={i}
              variants={titleLetter}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.h2>

        {/* Run stats — staggered */}
        <motion.div
          className="flex flex-col gap-2 w-full max-w-xs"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {statItems.map((item, i) => (
            <motion.div
              key={item.label}
              className={`flex items-center justify-between py-1.5 ${i < statItems.length - 1 ? 'border-b border-outline-subtle/30' : ''}`}
              variants={statLine}
            >
              <span className="text-label-sm text-on-surface-variant">{item.label}</span>
              <span className="text-body-sm font-semibold text-on-surface tabular-nums">{item.value}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Tagline — the punchline */}
        <motion.p
          className="font-heading text-title-md tracking-widest uppercase flex text-error/70"
          initial="hidden"
          animate="show"
        >
          {tagLetters.map((char, i) => (
            <motion.span
              key={i}
              variants={titleLetter}
              transition={{ duration: 0.25, delay: statsDuration + i * 0.06 }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.p>

        {/* Try Again */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: statsDuration + tagLetters.length * 0.06 + 0.5 }}
        >
          <Button size="lg" onClick={onRetry}>Try Again</Button>
        </motion.div>
      </div>
    </div>
  );
}
