'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/components/providers/GameProvider';
import { Scroll, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { damageColors } from '@/data/game-colors';

const KEYWORD_COLORS: Record<string, string> = {
  // Damage types
  fire: damageColors.fire, cold: damageColors.cold, lightning: damageColors.lightning,
  thunder: damageColors.thunder, acid: damageColors.acid, poison: damageColors.poison,
  necrotic: damageColors.necrotic, radiant: damageColors.radiant, force: damageColors.force,
  psychic: damageColors.psychic, slashing: damageColors.slashing, piercing: damageColors.piercing,
  bludgeoning: damageColors.bludgeoning,
  // Conditions
  paralyzed: '#8b5cf6', unconscious: '#8b5cf6', restrained: '#8b5cf6',
  poisoned: '#5bad5a', frightened: '#8b5cf6', staggered: '#f97316',
  burning: damageColors.fire, frozen: damageColors.cold,
  // Keywords
  'CRIT': '#e8c263', 'critical': '#e8c263',
};

const KEYWORD_PATTERN = new RegExp(
  `\\b(${Object.keys(KEYWORD_COLORS).join('|')})\\b`,
  'gi'
);

function colorizeLog(message: string, partyNames: string[], enemyNames: string[]): React.ReactNode {
  const allNames = [...partyNames, ...enemyNames].filter(n => n.length > 0);
  // Combined pattern: names + keywords
  const namePattern = allNames.length > 0
    ? new RegExp(`(${allNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g')
    : null;

  // First pass: split by names
  const nameParts = namePattern ? message.split(namePattern) : [message];

  return nameParts.map((part, i) => {
    if (partyNames.includes(part)) return <span key={i} style={{ color: 'var(--primary)' }} className="font-semibold">{part}</span>;
    if (enemyNames.includes(part)) return <span key={i} style={{ color: 'var(--error)' }} className="font-semibold">{part}</span>;

    // Second pass: highlight keywords within non-name parts
    const keyParts = part.split(KEYWORD_PATTERN);
    return <span key={i}>{keyParts.map((kp, j) => {
      const lower = kp.toLowerCase();
      const kwColor = KEYWORD_COLORS[lower];
      if (kwColor) return <span key={j} style={{ color: kwColor }}>{kp}</span>;
      return kp;
    })}</span>;
  });
}

const TYPE_INDICATOR: Record<string, { color: string; dot: string }> = {
  combat: { color: 'text-on-surface-variant', dot: 'bg-on-surface-variant/40' },
  death:  { color: 'text-error', dot: 'bg-error' },
  system: { color: 'text-primary', dot: 'bg-primary' },
  loot:   { color: 'text-success', dot: 'bg-success' },
  levelup: { color: 'text-primary', dot: 'bg-primary' },
};

export function GameLog() {
  const { state } = useGame();
  const [expanded, setExpanded] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const partyNames = state.party.map(c => c.name);
  const enemyNames = state.combat?.enemies.map(e => e.name) || [];
  const recentLogs = state.log.slice(-3);
  const allLogs = state.log.slice(-50);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [state.log.length, expanded]);

  return (
    <div className="absolute bottom-4 left-4 z-20">
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="mb-2 w-[340px] max-h-[380px] flex flex-col rounded-card bg-surface-1/95 backdrop-blur-md border border-outline-subtle overflow-hidden"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-outline-subtle/50">
              <span className="text-label-sm font-semibold text-on-surface-variant uppercase tracking-widest">Combat Log</span>
              <button onClick={() => setExpanded(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer bg-transparent border-none p-1 rounded-component hover:bg-surface-2 transition-colors">
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable log */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-2 max-h-[320px]">
              <div className="flex flex-col">
                {allLogs.map((entry) => {
                  const indicator = TYPE_INDICATOR[entry.type] || TYPE_INDICATOR.combat;
                  const isIndented = entry.message.startsWith('  ');
                  return (
                    <div key={entry.id} className={`flex items-start gap-2 px-1 py-1 ${isIndented ? 'pl-5' : ''}`}>
                      {!isIndented && <span className={`size-1.5 rounded-full shrink-0 mt-1.5 ${indicator.dot}`} />}
                      <span className={`text-label-sm leading-relaxed ${indicator.color}`}>
                        {colorizeLog(entry.message.trim(), partyNames, enemyNames)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact state — recent entries + FAB */}
      {!expanded && (
        <div className="flex flex-col gap-1 items-start">
          <div className="flex flex-col gap-0.5 max-w-[280px]">
            {recentLogs.map((entry) => {
              const indicator = TYPE_INDICATOR[entry.type] || TYPE_INDICATOR.combat;
              return (
                <span key={entry.id} className={`text-label-sm leading-tight opacity-60 ${indicator.color}`}>
                  {colorizeLog(entry.message, partyNames, enemyNames)}
                </span>
              );
            })}
          </div>

          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-1/80 backdrop-blur-sm border border-outline-subtle/50 hover:bg-surface-2 cursor-pointer transition-all"
          >
            <Scroll className="size-3.5 text-on-surface-variant" />
            <span className="text-label-sm text-on-surface-variant">Log</span>
            {state.log.length > 0 && (
              <span className="text-label-sm tabular-nums text-on-surface-variant opacity-50">{state.log.length}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
