'use client';

/**
 * Healing motes — gentle ascending sparkles. Five small particles with
 * minimal sway, soft glow, smooth fade. Reads calm/restorative — the
 * opposite personality from damage flourishes.
 */

import { memo } from 'react';
import { motion } from 'motion/react';

const MOTE_LIFE_S = 0.9;
const MOTE_SIZE = 4;

const MOTES = [
  { delay: 0.00, startX:  0, sway: [0,  2, -1,  2, -1, 0] },
  { delay: 0.10, startX: -8, sway: [0, -2,  1, -2,  1, 0] },
  { delay: 0.20, startX:  8, sway: [0,  1, -2,  1, -2, 0] },
  { delay: 0.30, startX: -4, sway: [0,  2, -1,  2, -1, 0] },
  { delay: 0.40, startX:  4, sway: [0, -1,  2, -1,  2, 0] },
];

const Y_RISE  = [0, -8, -20, -35, -50, -65];
const OPACITY = [0, 0.85, 0.9, 0.75, 0.4, 0];
const SCALE   = [0.5, 0.9, 1.0, 1.0, 0.8, 0.4];
const TIMES   = [0, 0.1, 0.3, 0.6, 0.85, 1];

export const HealingMotes = memo(function HealingMotes({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {MOTES.map((mote, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: MOTE_SIZE,
            height: MOTE_SIZE,
            marginLeft: -MOTE_SIZE / 2,
            marginTop: -MOTE_SIZE / 2,
            backgroundColor: color,
            boxShadow: `0 0 4px ${color}`,
          }}
          initial={{ x: mote.startX, y: 0, opacity: 0, scale: 0.5 }}
          animate={{
            x: mote.sway.map(w => mote.startX + w),
            y: Y_RISE,
            opacity: OPACITY,
            scale: SCALE,
          }}
          transition={{
            duration: MOTE_LIFE_S,
            delay: mote.delay,
            ease: 'easeInOut',
            times: TIMES,
          }}
        />
      ))}
    </div>
  );
});
