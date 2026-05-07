'use client';

import { motion } from 'motion/react';
import { GameIcon } from '@/components/atoms/GameIcon';

// ─── Variants ────────────────────────────────────────────────

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const fadeDown = {
  hidden: { opacity: 0, y: -12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const cardDrop = {
  hidden: { opacity: 0, y: -30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const titleLetter = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

// ─── Rest Options Config ─────────────────────────────────────

const REST_OPTIONS = [
  {
    id: 'full',
    label: 'Full Rest',
    title: 'Deep Recovery',
    accent: 'text-success',
    borderHover: 'hover:border-primary',
    items: [
      { text: 'Heal 50% max HP', highlight: true },
      { text: 'Restore all spell slots', highlight: true },
      { text: 'Reset all abilities', highlight: false },
    ],
  },
  {
    id: 'quick',
    label: 'Quick Rest',
    title: 'Brief Respite',
    accent: 'text-on-surface-variant',
    borderHover: 'hover:border-primary',
    items: [
      { text: 'Heal 25% max HP', highlight: false },
      { text: 'Restore 1 spell slot', highlight: false },
      { text: 'Reset all abilities', highlight: false },
    ],
  },
  {
    id: 'train',
    label: 'Train',
    title: 'Hone Your Edge',
    accent: 'text-primary',
    borderHover: 'hover:border-primary',
    items: [
      { text: 'No healing', highlight: false, warn: true },
      { text: 'No spell slot restore', highlight: false, warn: true },
      { text: '+3 primary stat until next rest', highlight: true },
    ],
  },
] as const;

// ─── Component ───────────────────────────────────────────────

type RestScreenProps = {
  flavorText?: string;
  onFullRest: () => void;
  onQuickRest: () => void;
  onTrain: () => void;
};

export function RestScreen({ flavorText, onFullRest, onQuickRest, onTrain }: RestScreenProps) {
  const title = 'Sanctuary';
  const letters = title.split('');
  const titleDuration = letters.length * 0.04 + 0.4;

  const handlers: Record<string, () => void> = {
    full: onFullRest,
    quick: onQuickRest,
    train: onTrain,
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* Background watermark */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none text-primary"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.05, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <GameIcon category="room" name="rest" size="xl" className="w-[50%] h-[50%] max-w-[350px] max-h-[350px]" />
      </motion.div>

      <motion.div
        className="relative z-10 flex flex-col items-center justify-center h-full gap-6 px-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Title — letter tick */}
        <motion.h2
          className="font-heading text-[clamp(1.5rem,5vw,2.5rem)] tracking-widest uppercase flex text-primary"
          variants={fadeDown}
        >
          {letters.map((char, i) => (
            <motion.span
              key={i}
              variants={titleLetter}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.h2>

        {/* Flavor text */}
        <motion.p
          className="text-body-md text-on-surface-variant text-center max-w-md italic"
          variants={fadeUp}
        >
          {flavorText || 'A moment of respite.'}
        </motion.p>

        {/* Choice cards */}
        <motion.div
          className="flex gap-4 flex-wrap justify-center"
          variants={container}
          initial="hidden"
          animate="show"
          transition={{ delayChildren: titleDuration }}
        >
          {REST_OPTIONS.map((opt) => (
            <motion.button
              key={opt.id}
              variants={cardDrop}
              onClick={handlers[opt.id]}
              className={`flex flex-col items-start gap-2 p-5 rounded-card bg-surface-2 border-2 border-outline-subtle ${opt.borderHover} transition-colors w-56 text-left`}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className={`text-label-sm font-semibold uppercase tracking-widest ${opt.accent}`}>
                {opt.label}
              </span>
              <span className="text-body-md text-on-surface font-semibold">{opt.title}</span>
              <ul className="flex flex-col gap-1 mt-1">
                {opt.items.map((item, i) => (
                  <li
                    key={i}
                    className={`text-label-sm ${
                      item.highlight ? 'text-primary font-semibold'
                      : 'warn' in item && item.warn ? 'text-error/70'
                      : 'text-on-surface-variant'
                    }`}
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
