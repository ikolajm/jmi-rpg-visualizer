'use client';

import { cn } from '@/components/atoms/cn';
import { GameIcon } from '@/components/atoms/GameIcon';
import { Eye, MoveDiagonal } from 'lucide-react';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/atoms/Accordion';
import { spellMeta } from '@/data/spell-meta';
import { schoolStyle, actionColors } from '@/data/game-colors';
import { spellReach, reachLabels } from '@/data/zones';
import { DamageInline } from './DamageIcon';

type SpellListItemProps = {
  spellIndex: string;
  className?: string;
};

function formatSpellName(index: string) {
  return index.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function SpellListItem({ spellIndex, className }: SpellListItemProps) {
  const meta = spellMeta[spellIndex];
  const hasDescription = !!meta?.description;
  const reach = meta?.range ? spellReach(meta.range) : null;

  const header = (
    <div className="flex items-center gap-[var(--space-3)] flex-1 min-w-0 text-left">
      {/* School icon */}
      {meta?.school && (
        <GameIcon
          category="spell-school"
          name={meta.school}
          size="md"
          className="shrink-0"
          style={schoolStyle(meta.school)}
        />
      )}

      {/* Name + stat indicators */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-body-sm font-medium text-[var(--on-surface)] truncate">
          {formatSpellName(spellIndex)}
        </span>
        <div className="flex items-center gap-[var(--space-3)] flex-wrap">
          {/* Damage with type icon */}
          {meta?.damage && meta?.damageType && (
            <DamageInline type={meta.damageType} damage={meta.damage} />
          )}

          {/* Zone range */}
          {reach && reach !== 'melee' && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-[var(--on-surface-variant)]">
              <MoveDiagonal className="size-2.5" />
              {reachLabels[reach]}
            </span>
          )}

          {/* Concentration */}
          {meta?.concentration && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold" style={{ color: actionColors.reaction }}>
              <Eye className="size-2.5" />
              Conc.
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (!hasDescription) {
    return (
      <div className={cn(
        'flex items-center gap-[var(--space-3)] p-[var(--space-2)] px-[var(--space-3)] rounded-[var(--radius-component)] bg-[var(--surface-2)]',
        className,
      )}>
        {header}
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className={cn('border-0 bg-transparent', className)}>
      <AccordionItem
        value={spellIndex}
        className="rounded-[var(--radius-component)] bg-[var(--surface-2)] overflow-hidden"
      >
        <AccordionTrigger size="sm" className="hover:bg-[var(--surface-3)] px-[var(--space-3)]">
          {header}
        </AccordionTrigger>
        <AccordionContent size="sm" className="px-[var(--space-3)] pb-[var(--space-3)] pt-0">
          <p className="text-body-sm text-[var(--on-surface-variant)] leading-relaxed">
            {meta.description}
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/** Section header for spell level groups */
export function SpellLevelHeader({ level, className }: { level: number | 'cantrip'; className?: string }) {
  const label = level === 'cantrip' || level === 0
    ? 'At Will'
    : `Level ${'I,II,III,IV,V,VI,VII,VIII,IX'.split(',')[level - 1] || level}`;

  return (
    <div className={cn('flex items-center gap-[var(--space-2)] py-[var(--space-1)]', className)}>
      <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[var(--on-surface-variant)]">
        {label}
      </span>
      <div className="flex-1 h-px bg-[var(--outline-subtle)]" />
    </div>
  );
}
