'use client';

import type { ReactNode, CSSProperties } from 'react';
import { cn } from '@/components/atoms/cn';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/atoms/Accordion';

type DetailItemProps = {
  /** Unique ID for accordion state — required when description is present */
  id: string;
  /** Left slot: icon, school icon, type badge, etc. */
  icon?: ReactNode;
  /** Primary label */
  title: string;
  /** Right-aligned metadata: tags, pills, stats */
  meta?: ReactNode;
  /** Secondary line below title: damage, range, etc. */
  subtitle?: ReactNode;
  /** Expandable description text or rich content */
  description?: ReactNode;
  /** Colored left border (e.g. feature type, spell school) */
  borderColor?: string;
  /** Additional className on the outer wrapper */
  className?: string;
};

/**
 * Shared list item for features, traits, spells, abilities — anything
 * with a title row and an optional accordion description.
 *
 * Consistent: bg-surface-2, rounded-component, px-3 py-2, same accordion
 * behavior, same description styling.
 */
export function DetailItem({
  id,
  icon,
  title,
  meta,
  subtitle,
  description,
  borderColor,
  className,
}: DetailItemProps) {
  const borderStyle: CSSProperties | undefined = borderColor
    ? { borderLeftColor: borderColor }
    : undefined;

  const borderClass = borderColor ? 'border-l-[3px]' : '';

  const header = (
    <div className="flex items-center gap-2 flex-1 min-w-0 text-left">
      {icon && <span className="shrink-0">{icon}</span>}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-body-sm font-medium text-on-surface truncate">{title}</span>
        {subtitle && <div className="flex items-center gap-3 flex-wrap">{subtitle}</div>}
      </div>
      {meta && <div className="flex items-center gap-2 ml-auto shrink-0">{meta}</div>}
    </div>
  );

  // No description — flat row, no accordion
  if (!description) {
    return (
      <div
        className={cn('rounded-component bg-surface-2 px-3 py-2', borderClass, className)}
        style={borderStyle}
      >
        {header}
      </div>
    );
  }

  // With description — accordion
  return (
    <Accordion type="single" collapsible className={cn('border-0 bg-transparent', className)}>
      <AccordionItem
        value={id}
        className={cn('rounded-component bg-surface-2 overflow-hidden', borderClass)}
        style={borderStyle}
      >
        <AccordionTrigger size="sm" className="hover:bg-surface-3 px-3 py-2">
          {header}
        </AccordionTrigger>
        <AccordionContent size="sm" className="px-3 py-2">
          {typeof description === 'string' ? (
            <p className="text-body-sm text-on-surface-variant leading-relaxed">{description}</p>
          ) : (
            description
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
