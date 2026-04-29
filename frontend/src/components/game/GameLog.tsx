'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/components/providers/GameProvider';
import { Scroll, ChevronDown, ChevronUp } from 'lucide-react';

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
  combat: 'text-[var(--on-surface-variant)]',
  death: 'text-[var(--error)]',
  system: 'text-[var(--primary)]',
  loot: 'text-[var(--success)]',
  levelup: 'text-[var(--primary)]',
};

export function GameLog() {
  const { state } = useGame();
  const [expanded, setExpanded] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const logs = expanded ? state.log.slice(-50) : state.log.slice(-5);
  const partyNames = state.party.map(c => c.name);
  const enemyNames = state.combat?.enemies.map(e => e.name) || [];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [state.log.length]);

  return (
    <div className={`absolute bottom-0 left-0 right-0 z-10 flex flex-col transition-all ${expanded ? 'h-[240px]' : 'h-[80px]'}`}>
      <div className="h-6 bg-gradient-to-b from-transparent to-black/60 pointer-events-none" />
      <div className="flex-1 bg-black/60 backdrop-blur-sm flex flex-col overflow-hidden">
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-[var(--space-1)] px-[var(--space-3)] py-1 text-[10px] uppercase tracking-[0.1em] text-[var(--on-surface-variant)] cursor-pointer bg-transparent border-none hover:text-[var(--on-surface)] shrink-0">
          <Scroll className="size-3" /> Combat Log
          {expanded ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />}
        </button>
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-[var(--space-3)] pb-[var(--space-2)]">
          <div className="flex flex-col gap-0.5">
            {logs.map((entry) => (
              <span key={entry.id} className={`text-[10px] leading-relaxed ${typeColors[entry.type] || typeColors.combat}`}>
                {colorizeLog(entry.message, partyNames, enemyNames)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
