/**
 * Condition descriptions — rules-text layer for the 13 GameConditions.
 *
 * Display vocabulary (label, icon, color) lives in condition-visuals.ts.
 * This module owns only the long mechanical descriptions used in inspect
 * sheets and condition detail panels.
 */

import type { GameCondition } from './status-effects';

export const CONDITION_DESCRIPTIONS: Record<GameCondition, string> = {
  paralyzed:   'Cannot take actions. Attacks against have advantage. Melee attacks auto-crit.',
  unconscious: 'Cannot take actions. Attacks against have advantage. Melee attacks auto-crit. Wakes on damage.',
  restrained:  'Disadvantage on attacks. Attacks against have advantage. Disadvantage on DEX saves.',
  poisoned:    'Disadvantage on attack rolls.',
  frightened:  'Disadvantage on attacks. Cannot move toward the source of fear.',
  prone:       'Melee attacks against have advantage. Ranged attacks against have disadvantage. Disadvantage on own attacks.',
  burning:     'Takes fire damage at the start of each turn.',
  frozen:      'Cannot move. Movement is completely restricted.',
  blessed:     '+1d4 on attack rolls. Concentration.',
  hunterMarked: '+1d6 damage from the marking attacker. Concentration.',
  shielded:    'Bonus to Armor Class.',
  commanded:   'Must obey the command. Skips next turn.',
  staggered:   'Reeling from a critical weakness exploit. Skips next turn.',
};

/** Format duration for display */
export function formatDuration(turnsRemaining: number): string {
  if (turnsRemaining === -1) return 'Concentration';
  if (turnsRemaining === 1) return '1 turn';
  return `${turnsRemaining} turns`;
}
