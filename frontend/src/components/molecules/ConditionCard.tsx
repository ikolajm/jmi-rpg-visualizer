'use client';

/**
 * ConditionCard — large-scale BG3-style status card for the inspect tier.
 *
 * Parallel to the small icon in StatusStack (the "hint" tier on combat
 * tokens). Reads from the same CONDITION_VISUALS / CONDITION_DESCRIPTIONS
 * registries, plus per-effect data (duration, save info, DoT).
 *
 * Composition: a tinted swatch panel on the left holds a large
 * condition-colored icon; the right column carries label + duration +
 * description + a color-accented extras row. Border + faint bg tint use
 * the condition's color directly, so valence reads implicitly via hue
 * (warm debuffs / gold-cyan-red buffs) — no explicit BUFF/DEBUFF tag.
 */

import type { ActiveEffect } from '@/data/status-effects';
import { CONDITION_VISUALS } from '@/data/condition-visuals';
import { CONDITION_DESCRIPTIONS, formatDuration } from '@/data/condition-descriptions';
import { tint } from '@/data/color-utils';

type ConditionCardProps = {
  effect: ActiveEffect;
};

export function ConditionCard({ effect }: ConditionCardProps) {
  const visual = CONDITION_VISUALS[effect.condition];
  const description = CONDITION_DESCRIPTIONS[effect.condition];
  if (!visual) return null;

  const Icon = visual.icon;
  const duration = formatDuration(effect.turnsRemaining);

  const extras: string[] = [];
  if (effect.damagePerTurn) extras.push(`${effect.damagePerTurn} ${effect.damageType || ''}/turn`);
  if (effect.value) extras.push(`+${effect.value} AC`);
  if (effect.saveDC && effect.saveAbility) extras.push(`Save DC ${effect.saveDC} ${effect.saveAbility.toUpperCase()}`);

  return (
    <div
      className="flex rounded-card overflow-hidden border-2"
      style={{
        borderColor: visual.color,
        backgroundColor: tint(visual.color, 6),
      }}
    >
      {/* Swatch panel — fixed-width tinted block holding the large icon */}
      <div
        className="flex items-center justify-center shrink-0 w-14"
        style={{
          backgroundColor: tint(visual.color, 22),
          borderRight: `1px solid ${visual.color}`,
        }}
      >
        <Icon className="size-8" style={{ color: visual.color }} />
      </div>

      {/* Content column */}
      <div className="flex-1 p-3 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className="text-label-md uppercase tracking-widest font-semibold truncate"
            style={{ color: visual.color }}
          >
            {visual.label}
          </span>
          <span className="text-label-sm tabular-nums text-on-surface-variant shrink-0">
            {duration}
          </span>
        </div>
        <p className="text-body-sm text-on-surface-variant leading-relaxed">
          {description}
        </p>
        {extras.length > 0 && (
          <div className="flex items-center gap-2 pt-0.5">
            <span
              className="block w-1 h-3 rounded-full shrink-0"
              style={{ backgroundColor: visual.color }}
            />
            <span className="text-label-sm text-on-surface-variant">
              {extras.join(' · ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
