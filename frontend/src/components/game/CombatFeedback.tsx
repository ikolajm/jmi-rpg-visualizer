'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onCombatFeedback, type CombatFeedbackEvent } from '@/data/combat-events';
import { damageColors } from '@/data/game-colors';

const FEEDBACK_DURATION = 1200; // ms before removal

const TYPE_STYLES: Record<string, { color: string; size: string; text?: string }> = {
  miss:       { color: '#94a3b8', size: 'text-body-md', text: 'MISS' },
  immune:     { color: '#94a3b8', size: 'text-body-sm', text: 'IMMUNE' },
  vulnerable: { color: '#5bad5a', size: 'text-label-sm', text: 'VULNERABLE!' },
  resisted:   { color: '#f59e0b', size: 'text-label-sm', text: 'RESISTED' },
};

/** Only these event types produce floating text */
const FLOATING_TEXT_TYPES = new Set(['damage', 'heal', 'miss', 'crit', 'immune', 'vulnerable', 'resisted']);

export function CombatFeedback() {
  const [events, setEvents] = useState<CombatFeedbackEvent[]>([]);

  useEffect(() => {
    return onCombatFeedback((event) => {
      if (!FLOATING_TEXT_TYPES.has(event.type)) return;
      setEvents(prev => [...prev, event]);
      setTimeout(() => {
        setEvents(prev => prev.filter(e => e.id !== event.id));
      }, FEEDBACK_DURATION);
    });
  }, []);

  return (
    <AnimatePresence>
      {events.map((event) => {
        const targetEl = document.querySelector(`[data-entity-id="${event.targetId}"]`);
        if (!targetEl) return null;

        const rect = targetEl.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top;

        let color: string;
        let text: string;
        let fontSize: string;
        const isCrit = event.type === 'crit';

        if (event.type === 'miss' || event.type === 'immune' || event.type === 'vulnerable' || event.type === 'resisted') {
          const style = TYPE_STYLES[event.type];
          color = style.color;
          text = style.text!;
          fontSize = style.size;
        } else if (event.type === 'heal') {
          color = '#5bad5a';
          text = `+${event.value}`;
          fontSize = 'text-body-md';
        } else if (event.type === 'damage' || event.type === 'crit') {
          color = event.damageType ? (damageColors[event.damageType] || '#c4bdb8') : '#c4bdb8';
          text = event.value != null ? `${event.value}` : '';
          fontSize = isCrit ? 'text-title-md' : 'text-body-md';
          if (!text) return null; // Skip if no value
        } else {
          return null; // Unknown type, skip
        }

        return (
          <motion.div
            key={event.id}
            className="fixed pointer-events-none z-50"
            style={{ left: x, top: y }}
            initial={{ opacity: 1, y: 0, x: '-50%', scale: isCrit ? 1.3 : 1 }}
            animate={{ opacity: 0, y: -20, scale: isCrit ? 1 : 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FEEDBACK_DURATION / 1000, ease: 'easeOut' }}
          >
            <span
              className={`font-bold tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${fontSize}`}
              style={{ color }}
            >
              {isCrit && <span className="text-label-sm uppercase tracking-widest block text-center" style={{ color }}>CRIT</span>}
              {text}
            </span>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
