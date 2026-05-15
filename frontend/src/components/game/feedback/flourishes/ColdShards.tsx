'use client';

/**
 * Cold shards — six small ice-crystal diamonds spawn at card center
 * and radiate outward to evenly-distributed angles, peaking mid-flight
 * before fading. Each shard's long axis points outward (rotation set
 * once at spawn, no tumble) — reads as ice shattering outward.
 *
 * Diamond shape via clip-path (GPU-composited, cheap). Radial angles
 * precomputed at module scope.
 */

import { memo } from 'react';
import { motion } from 'motion/react';

const SHARD_LIFE_S = 0.55;
const SHARD_COUNT = 6;
const SHARD_W = 4;
const SHARD_H = 9;
const SPREAD = 26;

const SHARDS = Array.from({ length: SHARD_COUNT }, (_, i) => {
  const angleDeg = i * 360 / SHARD_COUNT;
  const angleRad = angleDeg * Math.PI / 180;
  return {
    targetX: Math.cos(angleRad) * SPREAD,
    targetY: Math.sin(angleRad) * SPREAD,
    // Rotate so the diamond's long axis points outward. Angle 0° = right;
    // shard's natural orientation is vertical → +90° aligns it horizontally.
    rotation: angleDeg + 90,
    delay: (i % 3) * 0.03,
  };
});

export const ColdShards = memo(function ColdShards({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {SHARDS.map((shard, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            width: SHARD_W,
            height: SHARD_H,
            marginLeft: -SHARD_W / 2,
            marginTop: -SHARD_H / 2,
            backgroundColor: color,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            boxShadow: `0 0 3px ${color}`,
          }}
          initial={{ x: 0, y: 0, rotate: shard.rotation, scale: 0.5, opacity: 0 }}
          animate={{
            x: [0, shard.targetX * 0.5, shard.targetX],
            y: [0, shard.targetY * 0.5, shard.targetY],
            rotate: shard.rotation,
            scale: [0.5, 1.3, 0.7],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: SHARD_LIFE_S,
            delay: shard.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
});
