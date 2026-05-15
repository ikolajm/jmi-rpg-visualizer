/**
 * Hit Event Visuals — visual treatment for standalone label feedback.
 *
 * Parallel to condition-visuals.ts and damage-visuals.ts. Covers the
 * label-only events that have no damage number to attach to (MISS, IMMUNE).
 * Damage events get their color from damage-visuals (themed by family);
 * damage qualifiers (CRIT / VULNERABLE / RESISTED) get their color from
 * the QUALIFIER_COLOR map inside TokenFeedbackOverlay.
 *
 * Color values are CSS var references → game-tokens.css.
 */

import type { CombatFeedbackType } from './combat-events';

export interface HitEventVisual {
  color: string;
  /** Uppercase text shown in the floating bubble (when present) */
  label?: string;
  /** Tailwind text-size class */
  sizeClass?: string;
}

export const HIT_EVENT_VISUALS: Partial<Record<CombatFeedbackType, HitEventVisual>> = {
  miss:   { color: 'var(--hit-miss)',   label: 'MISS',   sizeClass: 'text-body-md' },
  immune: { color: 'var(--hit-immune)', label: 'IMMUNE', sizeClass: 'text-body-sm' },
};
