'use client';

import { cn } from '@/components/atoms/cn';
import { motion, AnimatePresence } from 'motion/react';
import { GameIcon } from '@/components/atoms/GameIcon';
import {
  ZapOff, Moon, Ghost, ArrowDownToLine, Gem, Brain, ShieldPlus, Crosshair, Orbit, CircleSlash,
} from 'lucide-react';
import { statusColors } from '@/data/game-colors';
import type { GameCondition } from '@/data/status-effects';

/** Display status effects (PixArts icons + game states) */
export type StatusEffect = 'poisoned' | 'burning' | 'frozen' | 'cursed' | 'blessed' | 'stunned' | 'raging' | 'concentrating' | 'restrained' | 'reckless';

/** Map game conditions to their icon rendering config */
const CONDITION_ICON: Record<string, { type: 'pixart'; name: string } | { type: 'lucide'; icon: React.ComponentType<{ className?: string }> }> = {
  // PixArts icons (the showcase set)
  poisoned: { type: 'pixart', name: 'poisoned' },
  burning: { type: 'pixart', name: 'burning' },
  frozen: { type: 'pixart', name: 'frozen' },
  blessed: { type: 'pixart', name: 'blessed' },
  raging: { type: 'pixart', name: 'raging' },
  concentrating: { type: 'pixart', name: 'concentrating' },
  stunned: { type: 'pixart', name: 'stunned' },
  cursed: { type: 'pixart', name: 'cursed' },
  restrained: { type: 'pixart', name: 'restrained' },

  reckless: { type: 'pixart', name: 'raging' }, // reuse raging icon for reckless visual

  // Lucide icons (mechanical conditions)
  paralyzed: { type: 'lucide', icon: ZapOff },
  unconscious: { type: 'lucide', icon: Moon },
  frightened: { type: 'lucide', icon: Ghost },
  prone: { type: 'lucide', icon: ArrowDownToLine },
  petrified: { type: 'lucide', icon: Gem },
  commanded: { type: 'lucide', icon: Brain },
  shielded: { type: 'lucide', icon: ShieldPlus },
  hunterMarked: { type: 'lucide', icon: Crosshair },
  spiritGuarded: { type: 'lucide', icon: Orbit },
  staggered: { type: 'lucide', icon: CircleSlash },
};

/** Resolve a condition name to a color */
const CONDITION_COLOR: Record<string, string> = {
  poisoned: statusColors.poisoned,
  burning: statusColors.burning,
  frozen: statusColors.frozen,
  blessed: statusColors.blessed,
  raging: statusColors.raging,
  concentrating: statusColors.concentrating,
  stunned: statusColors.stunned,
  cursed: statusColors.cursed,
  restrained: statusColors.cursed,
  paralyzed: statusColors.stunned,
  unconscious: statusColors.stunned,
  frightened: statusColors.cursed,
  prone: '#94a3b8',
  petrified: statusColors.frozen,
  commanded: '#a78bfa',
  shielded: statusColors.blessed,
  hunterMarked: '#f59e0b',
  spiritGuarded: statusColors.blessed,
  staggered: '#f97316',
};

type StatusStackProps = {
  effects: (StatusEffect | GameCondition)[];
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
          const config = CONDITION_ICON[effect];
          const color = CONDITION_COLOR[effect] || statusColors.cursed;
          const title = effect.charAt(0).toUpperCase() + effect.slice(1).replace(/([A-Z])/g, ' $1');

          if (!config) return null;

          if (config.type === 'pixart') {
            return (
              <motion.span
                key={effect}
                title={title}
                style={{ color }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.3, 1], opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GameIcon category="status" name={config.name} size={size === 'sm' ? 'md' : 'lg'} />
              </motion.span>
            );
          }

          const LucideIcon = config.icon;
          return (
            <motion.span
              key={effect}
              title={title}
              style={{ color }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LucideIcon className={iconSize} />
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
