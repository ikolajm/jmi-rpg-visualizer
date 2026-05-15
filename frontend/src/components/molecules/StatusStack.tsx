'use client';

import { cn } from '@/components/atoms/cn';
import { motion, AnimatePresence } from 'motion/react';
import { CONDITION_VISUALS, type VisualState } from '@/data/condition-visuals';

type StatusStackProps = {
  effects: VisualState[];
  size?: 'sm' | 'md';
  className?: string;
};

const sizeMap = { sm: 'size-5' as const, md: 'size-6' as const }; // 20px, 24px

export function StatusStack({ effects, size = 'sm', className }: StatusStackProps) {
  if (effects.length === 0) return null;

  const iconSize = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-1 flex-wrap justify-center', className)}>
      <AnimatePresence>
        {effects.map((effect) => {
          const visual = CONDITION_VISUALS[effect];
          if (!visual) return null;
          const Icon = visual.icon;

          return (
            <motion.span
              key={effect}
              title={visual.label}
              style={{ color: visual.color }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Icon className={iconSize} />
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
