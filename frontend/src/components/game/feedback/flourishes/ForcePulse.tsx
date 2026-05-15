'use client';

/**
 * Force pulse — single ring expanding fast with a soft glow halo.
 * Distinct from thunder by: one ring (not staggered), faster life
 * (~0.35s vs 0.55s), and a boxShadow that gives the kinetic-energy feel.
 * Force damage is rare in the trimmed game (magic-missile only), so this
 * is the most cameo-frequency flourish.
 */

import { memo } from 'react';
import { motion } from 'motion/react';

const PULSE_LIFE_S = 0.35;
const PULSE_SIZE = 22;
const MAX_SCALE = 4.5;

export const ForcePulse = memo(function ForcePulse({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.span
        className="absolute rounded-full"
        style={{
          left: '50%',
          top: '50%',
          width: PULSE_SIZE,
          height: PULSE_SIZE,
          marginLeft: -PULSE_SIZE / 2,
          marginTop: -PULSE_SIZE / 2,
          border: `2px solid ${color}`,
          boxShadow: `0 0 8px ${color}`,
        }}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{
          scale: [0.3, 0.8, MAX_SCALE],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: PULSE_LIFE_S,
          ease: 'easeOut',
          times: [0, 0.2, 1],
        }}
      />
    </div>
  );
});
