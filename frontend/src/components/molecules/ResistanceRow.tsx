'use client';

import { cn } from '@/components/atoms/cn';
import { DamageIcon } from './DamageIcon';
import { Shield, ShieldOff, ShieldAlert } from 'lucide-react';

type ResistanceRowProps = {
  resistances?: string[];
  immunities?: string[];
  vulnerabilities?: string[];
  className?: string;
};

/** Known damage types for the icon grid */
const KNOWN_TYPES = [
  'fire', 'cold', 'lightning', 'thunder', 'acid', 'poison',
  'necrotic', 'radiant', 'force', 'psychic',
  'bludgeoning', 'piercing', 'slashing',
];

/** Extract known damage types from resistance strings */
function extractTypes(entries: string[]): Set<string> {
  const types = new Set<string>();
  for (const entry of entries) {
    const lower = entry.toLowerCase();
    for (const t of KNOWN_TYPES) {
      if (lower.includes(t)) types.add(t);
    }
  }
  return types;
}

type Relationship = 'immune' | 'resistant' | 'vulnerable' | 'normal';

export function ResistanceRow({ resistances = [], immunities = [], vulnerabilities = [], className }: ResistanceRowProps) {
  const hasAny = resistances.length > 0 || immunities.length > 0 || vulnerabilities.length > 0;

  if (!hasAny) {
    return (
      <div className={cn('text-label-sm text-on-surface-variant italic', className)}>
        No resistances, immunities, or vulnerabilities
      </div>
    );
  }

  const resistSet = extractTypes(resistances);
  const immuneSet = extractTypes(immunities);
  const vulnerableSet = extractTypes(vulnerabilities);

  // Build a relationship map for all relevant types
  const relevantTypes = KNOWN_TYPES.filter(t =>
    resistSet.has(t) || immuneSet.has(t) || vulnerableSet.has(t)
  );

  function getRelationship(type: string): Relationship {
    if (immuneSet.has(type)) return 'immune';
    if (resistSet.has(type)) return 'resistant';
    if (vulnerableSet.has(type)) return 'vulnerable';
    return 'normal';
  }

  // Group by relationship for the grid
  const grouped: Record<Exclude<Relationship, 'normal'>, string[]> = {
    vulnerable: relevantTypes.filter(t => getRelationship(t) === 'vulnerable'),
    resistant: relevantTypes.filter(t => getRelationship(t) === 'resistant'),
    immune: relevantTypes.filter(t => getRelationship(t) === 'immune'),
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Vulnerability first — most tactically important */}
      {grouped.vulnerable.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-label-sm uppercase tracking-widest font-semibold text-success">
            <ShieldAlert className="size-3.5" />
            Vulnerable
          </div>
          <div className="flex flex-col gap-1 pl-5">
            {grouped.vulnerable.map(type => (
              <div key={type} className="flex items-center gap-2">
                <DamageIcon type={type} size="size-4" />
                <span className="text-body-sm capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {grouped.resistant.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-label-sm uppercase tracking-widest font-semibold text-warning">
            <Shield className="size-3.5" />
            Resistant
          </div>
          <div className="flex flex-col gap-1 pl-5">
            {grouped.resistant.map(type => (
              <div key={type} className="flex items-center gap-2">
                <DamageIcon type={type} size="size-4" />
                <span className="text-body-sm capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {grouped.immune.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-label-sm uppercase tracking-widest font-semibold text-error">
            <ShieldOff className="size-3.5" />
            Immune
          </div>
          <div className="flex flex-col gap-1 pl-5">
            {grouped.immune.map(type => (
              <div key={type} className="flex items-center gap-2">
                <DamageIcon type={type} size="size-4" />
                <span className="text-body-sm capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
