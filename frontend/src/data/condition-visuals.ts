/**
 * Condition Visuals — canonical visual registry for status states.
 *
 * Every visual state the token system renders lives here. One state =
 * one icon + color + valence + label. Consumers (StatusStack, ZoneToken,
 * ConditionList) read from this module — they do not define their own maps.
 *
 * Two vocabularies converge here:
 *   - GameCondition (13)  — mechanical effects tracked in ActiveEffect[]
 *   - StatusFlag    (2)   — flag-style buffs on Character.statusEffects[]
 *
 * Color values are CSS var references → game-tokens.css. Long rules-text
 * descriptions live in condition-descriptions.ts.
 */

import {
  ZapOff, Moon, Lock, Biohazard, Ghost, ArrowDownToLine,
  Flame, Snowflake, Sparkles, Crosshair, ShieldPlus, Brain, CircleSlash,
  Angry, Swords,
} from 'lucide-react';
import type { GameCondition } from './status-effects';

/** Self-applied flag-style states (live on Character.statusEffects[]) */
export type StatusFlag = 'raging' | 'reckless';

/** All visual states the token system can render */
export type VisualState = GameCondition | StatusFlag;

/** Whether the state is fundamentally a hindrance or an advantage */
export type Valence = 'debuff' | 'buff';

export interface ConditionVisual {
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  valence: Valence;
}

export const CONDITION_VISUALS: Record<VisualState, ConditionVisual> = {
  // ─ Debuffs ────────────────────────────────────────────────
  paralyzed:    { label: 'Paralyzed',     icon: ZapOff,          color: 'var(--condition-paralyzed)',     valence: 'debuff' },
  unconscious:  { label: 'Unconscious',   icon: Moon,            color: 'var(--condition-unconscious)',   valence: 'debuff' },
  restrained:   { label: 'Restrained',    icon: Lock,            color: 'var(--condition-restrained)',    valence: 'debuff' },
  poisoned:     { label: 'Poisoned',      icon: Biohazard,       color: 'var(--condition-poisoned)',      valence: 'debuff' },
  frightened:   { label: 'Frightened',    icon: Ghost,           color: 'var(--condition-frightened)',    valence: 'debuff' },
  prone:        { label: 'Prone',         icon: ArrowDownToLine, color: 'var(--condition-prone)',         valence: 'debuff' },
  burning:      { label: 'Burning',       icon: Flame,           color: 'var(--condition-burning)',       valence: 'debuff' },
  frozen:       { label: 'Frozen',        icon: Snowflake,       color: 'var(--condition-frozen)',        valence: 'debuff' },
  commanded:    { label: 'Commanded',     icon: Brain,           color: 'var(--condition-commanded)',     valence: 'debuff' },
  staggered:    { label: 'Staggered',     icon: CircleSlash,     color: 'var(--condition-staggered)',     valence: 'debuff' },
  hunterMarked: { label: "Hunter's Mark", icon: Crosshair,       color: 'var(--condition-hunter-marked)', valence: 'debuff' },

  // ─ Buffs ──────────────────────────────────────────────────
  blessed:      { label: 'Blessed',       icon: Sparkles,        color: 'var(--condition-blessed)',       valence: 'buff' },
  shielded:     { label: 'Shielded',      icon: ShieldPlus,      color: 'var(--condition-shielded)',      valence: 'buff' },
  raging:       { label: 'Raging',        icon: Angry,           color: 'var(--condition-raging)',        valence: 'buff' },
  reckless:     { label: 'Reckless',      icon: Swords,          color: 'var(--condition-reckless)',      valence: 'buff' },
};
