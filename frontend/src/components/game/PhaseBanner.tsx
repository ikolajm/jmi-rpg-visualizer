'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '@/components/providers/GameProvider';

type Phase = 'player' | 'enemy' | null;

export function PhaseBanner() {
  const { state } = useGame();
  const [banner, setBanner] = useState<Phase>(null);
  const prevType = useRef<string | null>(null);

  useEffect(() => {
    if (!state.combat || state.phase !== 'combat') {
      prevType.current = null;
      return;
    }

    const current = state.combat.initiativeOrder[state.combat.currentTurnIndex];
    if (!current) return;

    const newType = current.type;

    // Only show banner when ownership changes (or on first turn)
    if (prevType.current !== null && prevType.current !== newType) {
      setBanner(newType === 'character' ? 'player' : 'enemy');
      setTimeout(() => setBanner(null), 1200);
    } else if (prevType.current === null) {
      // First turn of combat
      setBanner(newType === 'character' ? 'player' : 'enemy');
      setTimeout(() => setBanner(null), 1200);
    }

    prevType.current = newType;
  }, [state.combat?.currentTurnIndex, state.combat?.roundNumber, state.phase]);

  return (
    <AnimatePresence>
      {banner && (
        <motion.div
          key={banner}
          className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.span
            className={`font-heading text-[clamp(1.5rem,4vw,2.5rem)] uppercase tracking-widest ${
              banner === 'player' ? 'text-primary' : 'text-error'
            }`}
            initial={{ x: banner === 'player' ? -100 : 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: banner === 'player' ? 100 : -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {banner === 'player' ? 'Player Phase' : 'Enemy Phase'}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
