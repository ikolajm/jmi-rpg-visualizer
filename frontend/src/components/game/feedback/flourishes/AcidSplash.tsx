'use client';

/**
 * Acid splash — four droplets fall from above the card center through
 * mid-card, with a slight horizontal arc and a vertical squash at the
 * end (the splatter). Quick (~0.7s) — reads viscous, not sustained.
 *
 * `ease: 'easeIn'` gives the gravity feel (droplets accelerate downward).
 */

import { memo } from 'react';
import { motion } from 'motion/react';

const DROPLET_LIFE_S = 0.7;
const DROPLET_SIZE = 4;

const DROPLETS = [
  { delay: 0.00, startX:   0, arc: [0,  2,  4,  6,  6,  4] },
  { delay: 0.05, startX: -10, arc: [0, -3, -5, -6, -4, -2] },
  { delay: 0.10, startX:   8, arc: [0,  2,  4,  6,  4,  2] },
  { delay: 0.15, startX:  -4, arc: [0, -1, -2, -3, -2, -1] },
];

const Y_FALL  = [-25, -10, 5, 20, 35, 40];
const OPACITY = [0, 0.9, 0.95, 0.9, 0.7, 0];
const SCALE_Y = [0.7, 0.9, 1.1, 1.3, 0.7, 0.5];

export const AcidSplash = memo(function AcidSplash({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {DROPLETS.map((droplet, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: DROPLET_SIZE,
            height: DROPLET_SIZE,
            marginLeft: -DROPLET_SIZE / 2,
            marginTop: -DROPLET_SIZE / 2,
            backgroundColor: color,
            boxShadow: `0 0 3px ${color}`,
          }}
          initial={{ x: droplet.startX, y: -25, opacity: 0, scaleY: 0.7 }}
          animate={{
            x: droplet.arc.map(w => droplet.startX + w),
            y: Y_FALL,
            opacity: OPACITY,
            scaleY: SCALE_Y,
          }}
          transition={{
            duration: DROPLET_LIFE_S,
            delay: droplet.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
});
