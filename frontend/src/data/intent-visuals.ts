/**
 * Intent Visuals — visual treatment for enemy turn-intent badges.
 *
 * One entry per IntentType (the telegraph shown on enemy tokens before
 * their turn). Color values are CSS var references → game-tokens.css.
 */

import { Sword, Crosshair, Flame, Zap, Moon } from 'lucide-react';
import type { IntentType } from './game-types';

export interface IntentVisual {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  label: string;
}

export const INTENT_VISUALS: Record<IntentType, IntentVisual> = {
  melee:     { icon: Sword,     color: 'var(--intent-melee)',     label: 'Melee Attack' },
  ranged:    { icon: Crosshair, color: 'var(--intent-ranged)',    label: 'Ranged Attack' },
  breath:    { icon: Flame,     color: 'var(--intent-breath)',    label: 'Breath / AoE' },
  condition: { icon: Zap,       color: 'var(--intent-condition)', label: 'Status Effect' },
  skip:      { icon: Moon,      color: 'var(--intent-skip)',      label: 'Disabled' },
};
