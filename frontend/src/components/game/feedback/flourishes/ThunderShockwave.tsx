'use client';

/**
 * Thunder shockwave — two concentric ring outlines expanding from card
 * center. The 2px border scales with the transform, so each wave starts
 * subtle and grows heavier as it spreads (sonic-shockwave aesthetic).
 * Staggered start gives the cascading "boom-boom" rhythm.
 */

import { memo } from 'react';
import { motion } from 'motion/react';

const RING_LIFE_S = 0.55;
const RING_SIZE = 20;

const RINGS = [
  { delay: 0.00, maxScale: 4.5 },
  { delay: 0.10, maxScale: 3.2 },
];

const OPACITY = [0, 1, 0];
const TIMES   = [0, 0.25, 1];

export const ThunderShockwave = memo(function ThunderShockwave({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {RINGS.map((ring, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: RING_SIZE,
            height: RING_SIZE,
            marginLeft: -RING_SIZE / 2,
            marginTop: -RING_SIZE / 2,
            border: `2px solid ${color}`,
          }}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{
            scale: [0.3, 1, ring.maxScale],
            opacity: OPACITY,
          }}
          transition={{
            duration: RING_LIFE_S,
            delay: ring.delay,
            ease: 'easeOut',
            times: TIMES,
          }}
        />
      ))}
    </div>
  );
});
