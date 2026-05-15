'use client';

/**
 * Necrotic wisps — sparse, slow-drifting ghostly motes that rise with
 * wide sway and low alpha. Fewer particles than fire (3 vs 5), each
 * larger and softer, longer lifetime — reads as sinister, not punchy.
 */

import { memo } from 'react';
import { motion } from 'motion/react';

const WISP_LIFE_S = 1.0;
const WISP_SIZE = 6;

const WISPS = [
  { delay: 0.00, startX:   0, sway: [0,  5, -3,  6, -2, 0] },
  { delay: 0.20, startX: -10, sway: [0, -6,  4, -3,  5, 0] },
  { delay: 0.40, startX:  12, sway: [0,  4, -5,  2, -3, 0] },
];

const Y_RISE  = [0, -10, -28, -45, -60, -75];
const OPACITY = [0, 0.4, 0.6, 0.5, 0.3, 0];
const SCALE   = [0.6, 1.0, 1.2, 1.2, 1.0, 0.7];
const TIMES   = [0, 0.15, 0.4, 0.65, 0.85, 1];

export const NecroticWisps = memo(function NecroticWisps({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {WISPS.map((wisp, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: WISP_SIZE,
            height: WISP_SIZE,
            marginLeft: -WISP_SIZE / 2,
            marginTop: -WISP_SIZE / 2,
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}`,
          }}
          initial={{ x: wisp.startX, y: 0, opacity: 0, scale: 0.6 }}
          animate={{
            x: wisp.sway.map(w => wisp.startX + w),
            y: Y_RISE,
            opacity: OPACITY,
            scale: SCALE,
          }}
          transition={{
            duration: WISP_LIFE_S,
            delay: wisp.delay,
            ease: 'easeInOut',
            times: TIMES,
          }}
        />
      ))}
    </div>
  );
});
