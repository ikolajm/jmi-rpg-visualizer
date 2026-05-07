'use client';

import { motion } from 'motion/react';

const titleLetter = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function VictoryOverlay({ xpGained }: { xpGained?: number }) {
  const title = 'Victory!';
  const letters = title.split('');

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Dim overlay */}
      <motion.div
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Victory text */}
      <motion.h2
        className="relative z-10 font-heading text-[clamp(2rem,6vw,3.5rem)] tracking-widest uppercase flex text-primary"
        initial="hidden"
        animate="show"
      >
        {letters.map((char, i) => (
          <motion.span
            key={i}
            variants={titleLetter}
            transition={{ duration: 0.25, delay: 0.3 + i * 0.06 }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.h2>

      {/* XP callout */}
      {xpGained !== undefined && xpGained > 0 && (
        <motion.span
          className="relative z-10 text-body-md text-on-surface-variant mt-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.3 }}
        >
          +{xpGained} XP
        </motion.span>
      )}
    </motion.div>
  );
}
