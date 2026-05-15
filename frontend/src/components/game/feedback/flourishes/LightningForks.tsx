'use client';

/**
 * Lightning forks — three jagged SVG stroke paths that flicker on briefly
 * with staggered timing. No translation, no scale — lightning is instant.
 * Snap-on/off via close-spaced opacity keyframes (the 0.05 → 0.1 gap is
 * a ~22ms ramp, perceived as instant). drop-shadow gives the electric glow.
 *
 * viewBox centered at (0,0) so path coordinates can use negative values
 * for forks above the card midline.
 */

import { memo } from 'react';
import { motion } from 'motion/react';

const LIGHTNING_LIFE_S = 0.3;

const FORKS = [
  // Center fork — biggest, runs top-to-bottom of card
  { d: 'M0,-40 L-4,-15 L4,-10 L-3,10 L4,15 L0,40', delay: 0.00 },
  // Left fork — shorter, upper-left only
  { d: 'M-20,-30 L-25,-10 L-18,0 L-22,15',         delay: 0.05 },
  // Right fork — shorter, upper-right only
  { d: 'M20,-25 L15,-10 L22,-5 L17,12',            delay: 0.10 },
];

const OPACITY = [0, 0, 1, 1, 0];
const TIMES   = [0, 0.05, 0.1, 0.55, 0.65];

export const LightningForks = memo(function LightningForks({ color }: { color: string }) {
  return (
    <svg
      viewBox="-50 -50 100 100"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ filter: `drop-shadow(0 0 2px ${color})` }}
    >
      {FORKS.map((fork, i) => (
        <motion.path
          key={i}
          d={fork.d}
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: OPACITY }}
          transition={{
            duration: LIGHTNING_LIFE_S,
            delay: fork.delay,
            ease: 'linear',
            times: TIMES,
          }}
        />
      ))}
    </svg>
  );
});
