/**
 * Condition descriptions for inspect sheet display.
 * Each condition has a human-readable description and mechanical summary.
 */

import type { GameCondition } from './status-effects';

export interface ConditionInfo {
  label: string;
  description: string;
  /** 'pixart' = use GameIcon with status category, 'lucide' = handled by StatusStack */
  iconType: 'pixart' | 'lucide';
  iconName: string; // PixArts name or condition name for StatusStack lookup
}

export const CONDITION_INFO: Record<GameCondition, ConditionInfo> = {
  paralyzed: {
    label: 'Paralyzed',
    description: 'Cannot take actions. Attacks against have advantage. Melee attacks auto-crit.',
    iconType: 'lucide', iconName: 'paralyzed',
  },
  unconscious: {
    label: 'Unconscious',
    description: 'Cannot take actions. Attacks against have advantage. Melee attacks auto-crit. Wakes on damage.',
    iconType: 'lucide', iconName: 'unconscious',
  },
  restrained: {
    label: 'Restrained',
    description: 'Disadvantage on attacks. Attacks against have advantage. Disadvantage on DEX saves.',
    iconType: 'pixart', iconName: 'restrained',
  },
  poisoned: {
    label: 'Poisoned',
    description: 'Disadvantage on attack rolls.',
    iconType: 'pixart', iconName: 'poisoned',
  },
  frightened: {
    label: 'Frightened',
    description: 'Disadvantage on attacks. Cannot move toward the source of fear.',
    iconType: 'lucide', iconName: 'frightened',
  },
  prone: {
    label: 'Prone',
    description: 'Melee attacks against have advantage. Ranged attacks against have disadvantage. Disadvantage on own attacks.',
    iconType: 'lucide', iconName: 'prone',
  },
  petrified: {
    label: 'Petrified',
    description: 'Cannot take actions. Turned to stone. Effectively incapacitated until cured.',
    iconType: 'lucide', iconName: 'petrified',
  },
  burning: {
    label: 'Burning',
    description: 'Takes fire damage at the start of each turn.',
    iconType: 'pixart', iconName: 'burning',
  },
  frozen: {
    label: 'Frozen',
    description: 'Cannot move. Movement is completely restricted.',
    iconType: 'pixart', iconName: 'frozen',
  },
  blessed: {
    label: 'Blessed',
    description: '+1d4 on attack rolls. Concentration.',
    iconType: 'pixart', iconName: 'blessed',
  },
  hunterMarked: {
    label: "Hunter's Mark",
    description: '+1d6 damage from the marking attacker. Concentration.',
    iconType: 'lucide', iconName: 'hunterMarked',
  },
  shielded: {
    label: 'Shielded',
    description: 'Bonus to Armor Class.',
    iconType: 'lucide', iconName: 'shielded',
  },
  spiritGuarded: {
    label: 'Spirit Guardians',
    description: 'Enemies in your zone take radiant damage at the start of their turn. WIS save for half. Concentration.',
    iconType: 'lucide', iconName: 'spiritGuarded',
  },
  commanded: {
    label: 'Commanded',
    description: 'Must obey the command. Skips next turn.',
    iconType: 'lucide', iconName: 'commanded',
  },
  staggered: {
    label: 'Staggered',
    description: 'Reeling from a critical weakness exploit. Skips next turn.',
    iconType: 'lucide', iconName: 'staggered',
  },
};

/** Format duration for display */
export function formatDuration(turnsRemaining: number): string {
  if (turnsRemaining === -1) return 'Concentration';
  if (turnsRemaining === 1) return '1 turn';
  return `${turnsRemaining} turns`;
}
