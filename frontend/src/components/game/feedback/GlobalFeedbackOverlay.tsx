'use client';

/**
 * GlobalFeedbackOverlay
 *
 * Screen-wide combat-feedback effects that aren't tied to a single card —
 * currently just the kill vignette. Future AoE-wide flashes will land here.
 * Per-target effects live in TokenFeedbackOverlay (mounted inside each card).
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onCombatFeedback, type CombatFeedbackEvent } from '@/data/combat-events';

const KILL_DURATION_MS = 450;

function KillVignette({ event }: { event: CombatFeedbackEvent }) {
  const intensity = event.isPartyMember ? '0.4' : '0.25';
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-40"
      style={{ boxShadow: `inset 0 0 120px rgba(200, 0, 0, ${intensity})` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: KILL_DURATION_MS / 1000 }}
    />
  );
}

export function GlobalFeedbackOverlay() {
  const [events, setEvents] = useState<CombatFeedbackEvent[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const unsub = onCombatFeedback((event) => {
      if (event.type !== 'kill') return;
      setEvents(prev => [...prev, event]);
      timers.push(setTimeout(() => {
        setEvents(prev => prev.filter(e => e.id !== event.id));
      }, KILL_DURATION_MS));
    });
    return () => { unsub(); timers.forEach(clearTimeout); };
  }, []);

  return (
    <AnimatePresence>
      {events.map(event => <KillVignette key={event.id} event={event} />)}
    </AnimatePresence>
  );
}
