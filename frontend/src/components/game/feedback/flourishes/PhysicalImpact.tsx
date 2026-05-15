'use client';

/**
 * Physical impact — six dust particles burst radially from the card
 * center to evenly-distributed angles, fading as they fly. Short life
 * (~0.45s) — reads as a sharp instantaneous hit, not sustained motion.
 *
 * Angles are precomputed at module scope; per-particle target offsets
 * are pure trig — no per-render computation cost.
 */

import { memo } from 'react';
import { motion } from 'motion/react';

const PARTICLE_LIFE_S = 0.45;
const PARTICLE_SIZE = 3;
const PARTICLE_COUNT = 6;
const SPREAD = 22; // px

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i * 360 / PARTICLE_COUNT) * Math.PI / 180;
  return {
    targetX: Math.cos(angle) * SPREAD,
    targetY: Math.sin(angle) * SPREAD,
    delay: (i % 2) * 0.02,
  };
});

export const PhysicalImpact = memo(function PhysicalImpact({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: PARTICLE_SIZE,
            height: PARTICLE_SIZE,
            marginLeft: -PARTICLE_SIZE / 2,
            marginTop: -PARTICLE_SIZE / 2,
            backgroundColor: color,
            boxShadow: `0 0 2px ${color}`,
          }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
          animate={{
            x: [0, p.targetX * 0.6, p.targetX],
            y: [0, p.targetY * 0.6, p.targetY],
            opacity: [0, 1, 0],
            scale: [0.5, 1.1, 0.3],
          }}
          transition={{
            duration: PARTICLE_LIFE_S,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
});
