'use client';

/**
 * Radiant beam — vertical column of light through card center plus a
 * halo bloom. Beam fills card height (top:0, bottom:0) and animates its
 * scaleY around `transformOrigin: 'center'` — starts collapsed at the
 * mid-line, expands vertically, holds, then collapses back.
 *
 * Gradient runs transparent → color → white core → color → transparent,
 * which reads as a holy/divine pillar of light. Halo at center adds the
 * "moment of impact" bloom.
 */

import { memo } from 'react';
import { motion } from 'motion/react';

const BEAM_LIFE_S = 0.55;
const BEAM_WIDTH = 14;
const HALO_SIZE = 32;

export const RadiantBeam = memo(function RadiantBeam({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Vertical light column */}
      <motion.div
        className="absolute"
        style={{
          left: '50%',
          top: 0,
          bottom: 0,
          width: BEAM_WIDTH,
          marginLeft: -BEAM_WIDTH / 2,
          background: `linear-gradient(to bottom, transparent 5%, ${color} 30%, white 50%, ${color} 70%, transparent 95%)`,
          boxShadow: `0 0 12px ${color}`,
          transformOrigin: 'center',
        }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
        transition={{
          duration: BEAM_LIFE_S,
          ease: 'easeOut',
          times: [0, 0.25, 0.7, 1],
        }}
      />
      {/* Center halo bloom */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: '50%',
          top: '50%',
          width: HALO_SIZE,
          height: HALO_SIZE,
          marginLeft: -HALO_SIZE / 2,
          marginTop: -HALO_SIZE / 2,
          background: `radial-gradient(circle, ${color}, transparent 70%)`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 0.8], opacity: [0, 0.9, 0] }}
        transition={{
          duration: BEAM_LIFE_S * 0.7,
          ease: 'easeOut',
        }}
      />
    </div>
  );
});
