'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/components/providers/GameProvider';
import { Scroll, X } from 'lucide-react';

function colorizeLog(message: string, partyNames: string[], enemyNames: string[]): React.ReactNode {
  const allNames = [...partyNames, ...enemyNames].filter(n => n.length > 0);
  if (allNames.length === 0) return message;
  const pattern = new RegExp(`(${allNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  const parts = message.split(pattern);
  return parts.map((part, i) => {
    if (partyNames.includes(part)) return <span key={i} style={{ color: 'var(--primary)' }} className="font-semibold">{part}</span>;
    if (enemyNames.includes(part)) return <span key={i} style={{ color: 'var(--error)' }} className="font-semibold">{part}</span>;
    return <span key={i}>{part}</span>;
  });
}

const typeColors: Record<string, string> = {
  combat: 'text-on-surface-variant',
  death: 'text-error',
  system: 'text-primary',
  loot: 'text-success',
  levelup: 'text-primary',
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
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [state.log.length, expanded]);

  return (
    <div className="absolute bottom-4 left-4 z-20">

      {/* Expanded log card */}
      {expanded && (
        <div className="mb-2 w-[320px] max-h-[360px] flex flex-col rounded-card bg-black/80 backdrop-blur-md border border-outline-subtle overflow-hidden animate-[fade-in_0.15s_ease-out]">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-outline-subtle">
            <span className="text-label-sm font-semibold text-on-surface-variant uppercase tracking-widest">Combat Log</span>
            <button onClick={() => setExpanded(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer bg-transparent border-none">
              <X className="size-4" />
            </button>
          </div>

          {/* Scrollable log */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 max-h-[300px]">
            <div className="flex flex-col gap-1">
              {allLogs.map((entry) => (
                <span key={entry.id} className={`text-label-sm leading-relaxed ${typeColors[entry.type] || typeColors.combat}`}>
                  {colorizeLog(entry.message, partyNames, enemyNames)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Compact state — recent entries + FAB */}
      {!expanded && (
        <div className="flex flex-col gap-1 items-start">
          {/* Recent entries — compact peek */}
          <div className="flex flex-col gap-0.5 max-w-[280px]">
            {recentLogs.map((entry) => (
              <span key={entry.id} className={`text-[10px] leading-tight opacity-70 ${typeColors[entry.type] || typeColors.combat}`}>
                {colorizeLog(entry.message, partyNames, enemyNames)}
              </span>
            ))}
          </div>

          {/* FAB button */}
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/60 backdrop-blur-sm border border-outline-subtle hover:bg-black/80 cursor-pointer transition-all"
          >
            <Scroll className="size-4 text-on-surface-variant" />
            <span className="text-label-sm text-on-surface-variant">Log</span>
            {state.log.length > 0 && (
              <span className="text-[9px] tabular-nums text-on-surface-variant opacity-60">{state.log.length}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
