'use client';

import { cn } from '@/components/atoms/cn';
import { GameIcon } from '@/components/atoms/GameIcon';
import { Eye, MoveDiagonal } from 'lucide-react';
import { spellMeta } from '@/data/spell-meta';
import { schoolStyle, actionColors } from '@/data/game-colors';
import { spellReach, reachLabels } from '@/data/zones';
import { DamageInline } from './DamageIcon';
import { DetailItem } from './DetailItem';

type SpellListItemProps = {
  spellIndex: string;
  className?: string;
};

function formatSpellName(index: string) {
  return index.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function SpellListItem({ spellIndex, className }: SpellListItemProps) {
  const meta = spellMeta[spellIndex];
  const reach = meta?.range ? spellReach(meta.range) : null;

  return (
    <DetailItem
      id={spellIndex}
      icon={meta?.school ? (
        <GameIcon category="spell-school" name={meta.school} size="md" className="shrink-0" style={schoolStyle(meta.school)} />
      ) : undefined}
      title={formatSpellName(spellIndex)}
      subtitle={
        <>
          {meta?.damage && meta?.damageType && (
            <DamageInline type={meta.damageType} damage={meta.damage} />
          )}
          {reach && reach !== 'melee' && (
            <span className="inline-flex items-center gap-0.5 text-label-sm text-on-surface-variant">
              <MoveDiagonal className="size-2.5" />
              {reachLabels[reach]}
            </span>
          )}
          {meta?.concentration && (
            <span className="inline-flex items-center gap-0.5 text-label-sm font-semibold" style={{ color: actionColors.reaction }}>
              <Eye className="size-2.5" />
              Conc.
            </span>
          )}
        </>
      }
      description={meta?.description || undefined}
      className={className}
    />
  );
}

/** Section header for spell level groups */
export function SpellLevelHeader({ level, className }: { level: number | 'cantrip'; className?: string }) {
  const label = level === 'cantrip' || level === 0
    ? 'At Will'
    : `Level ${'I,II,III,IV,V,VI,VII,VIII,IX'.split(',')[level - 1] || level}`;

  return (
    <div className={cn('flex items-center gap-2 py-1', className)}>
      <span className="text-label-sm uppercase tracking-widest font-semibold text-on-surface-variant">
        {label}
      </span>
      <div className="flex-1 h-px bg-outline-subtle" />
    </div>
  );
}
