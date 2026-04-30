'use client';

import { cn } from '@/components/atoms/cn';
import { DamageIcon } from './DamageIcon';
import { damageColors } from '@/data/game-colors';
import { Shield, ShieldOff, ShieldAlert } from 'lucide-react';

type ResistanceRowProps = {
  resistances?: string[];
  immunities?: string[];
  vulnerabilities?: string[];
  className?: string;
};

/** Known damage type keywords we can map to icons */
const KNOWN_TYPES = [
  'fire', 'cold', 'lightning', 'thunder', 'acid', 'poison',
  'necrotic', 'radiant', 'force', 'psychic',
  'bludgeoning', 'piercing', 'slashing',
];

/** Extract known damage types from a resistance string like "bludgeoning, piercing, and slashing from nonmagical weapons" */
function parseTypes(entries: string[]): { types: string[]; qualifier?: string } {
  const types: string[] = [];
  let qualifier: string | undefined;

  for (const entry of entries) {
    const lower = entry.toLowerCase();

    // Check for qualifier (e.g., "from nonmagical weapons")
    const qualMatch = lower.match(/from (.+)/);
    if (qualMatch) qualifier = qualMatch[1];

    for (const t of KNOWN_TYPES) {
      if (lower.includes(t)) types.push(t);
    }

    // If no known type matched, treat the whole entry as a type name
    if (!KNOWN_TYPES.some(t => lower.includes(t))) {
      types.push(entry);
    }
  }

  return { types: [...new Set(types)], qualifier };
}

function ResistanceGroup({ label, icon, entries, variant }: {
  label: string;
  icon: React.ReactNode;
  entries: string[];
  variant: 'neutral' | 'danger' | 'warning';
}) {
  const { types, qualifier } = parseTypes(entries);
  if (types.length === 0) return null;

  const variantColors = {
    neutral: 'text-on-surface-variant',
    danger: 'text-error',
    warning: 'text-warning',
  };

  return (
    <div className="flex flex-col gap-1">
      <div className={cn('flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] font-semibold', variantColors[variant])}>
        {icon}
        {label}
      </div>
      <div className="flex items-center gap-2 flex-wrap pl-4">
        {types.map((type) => {
          const isKnown = KNOWN_TYPES.includes(type);
          return (
            <span
              key={type}
              className="inline-flex items-center gap-0.5 text-[10px] font-medium"
              style={isKnown ? { color: damageColors[type] || undefined } : undefined}
            >
              {isKnown && <DamageIcon type={type} size="size-2.5" />}
              {type}
            </span>
          );
        })}
        {qualifier && (
          <span className="text-[10px] text-on-surface-variant italic">({qualifier})</span>
        )}
      </div>
    </div>
  );
}

export function ResistanceRow({ resistances = [], immunities = [], vulnerabilities = [], className }: ResistanceRowProps) {
  const hasAny = resistances.length > 0 || immunities.length > 0 || vulnerabilities.length > 0;

  if (!hasAny) {
    return (
      <div className={cn('text-[10px] text-on-surface-variant italic', className)}>
        No resistances, immunities, or vulnerabilities
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {resistances.length > 0 && (
        <ResistanceGroup
          label="Resistant"
          icon={<Shield className="size-3" />}
          entries={resistances}
          variant="neutral"
        />
      )}
      {immunities.length > 0 && (
        <ResistanceGroup
          label="Immune"
          icon={<ShieldOff className="size-3" />}
          entries={immunities}
          variant="danger"
        />
      )}
      {vulnerabilities.length > 0 && (
        <ResistanceGroup
          label="Vulnerable"
          icon={<ShieldAlert className="size-3" />}
          entries={vulnerabilities}
          variant="warning"
        />
      )}
    </div>
  );
}
