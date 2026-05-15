'use client';

/**
 * Fire embers — small glowing particles rising from the target with a
 * subtle horizontal wobble. Five staggered embers, ~800ms each,
 * deterministic choreography for predictable visual output across emits.
 *
 * Hardware-cheap by design: five absolute-positioned spans, animated only
 * via transform + opacity (GPU-composited). No filter:blur, small
 * box-shadow radii. Unmounts cleanly when the parent overlay exits.
 */

import { memo } from 'react';
import { motion } from 'motion/react';

const EMBER_LIFE_S = 0.8;
const EMBER_SIZE = 4;

// Each ember has a deterministic personality: starting x-offset from
// card-center and a 6-keyframe horizontal wobble pattern (±~4px).
const EMBERS = [
  { delay: 0.00, startX:  0, wobble: [0,  3, -2,  3, -1, 0] },
  { delay: 0.06, startX: -8, wobble: [0, -4,  3, -2,  3, 0] },
  { delay: 0.12, startX: 10, wobble: [0,  2, -4,  1, -2, 0] },
  { delay: 0.18, startX: -4, wobble: [0,  4, -1,  3, -2, 0] },
  { delay: 0.24, startX:  6, wobble: [0, -2,  3, -1,  2, 0] },
];

// Shared per-ember arcs — rise, fade, breathe. Times curve makes the
// ember fade in fast, peak early, cool slowly.
const Y_RISE  = [0, -8, -22, -38, -55, -72];
const OPACITY = [0, 0.85, 1, 0.95, 0.6, 0];
const SCALE   = [0.4, 0.9, 1.0, 1.0, 0.7, 0.3];
const TIMES   = [0, 0.1, 0.3, 0.6, 0.85, 1];

// Memoized — pure component, only re-renders when color changes. Avoids
// redundant reconciliation when the parent overlay re-renders for other reasons.
export const FireEmbers = memo(function FireEmbers({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {EMBERS.map((ember, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: EMBER_SIZE,
            height: EMBER_SIZE,
            marginLeft: -EMBER_SIZE / 2,
            marginTop: -EMBER_SIZE / 2,
            backgroundColor: color,
            // Single shadow halts at ~half the paint cost of the previous
            // double-shadow setup, while still reading as a glowing ember.
            boxShadow: `0 0 3px ${color}`,
          }}
          initial={{ x: ember.startX, y: 0, opacity: 0, scale: 0.4 }}
          animate={{
            x: ember.wobble.map(w => ember.startX + w),
            y: Y_RISE,
            opacity: OPACITY,
            scale: SCALE,
          }}
          transition={{
            duration: EMBER_LIFE_S,
            delay: ember.delay,
            ease: 'easeInOut',
            times: TIMES,
          }}
        />
      ))}
    </div>
  );
});
