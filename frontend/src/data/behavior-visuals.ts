/**
 * Behavior Visuals — visual treatment for enemy AI-behavior badges.
 *
 * Shown in EnemyInspect to communicate how an enemy fights.
 * Color values are CSS var references → game-tokens.css.
 */

export type EnemyBehavior = 'melee-aggro' | 'flexible' | 'caster' | 'passive';

export interface BehaviorVisual {
  label: string;
  color: string;
}

export const BEHAVIOR_VISUALS: Record<EnemyBehavior, BehaviorVisual> = {
  'melee-aggro': { label: 'Melee',    color: 'var(--behavior-melee-aggro)' },
  'flexible':    { label: 'Flexible', color: 'var(--behavior-flexible)' },
  'caster':      { label: 'Caster',   color: 'var(--behavior-caster)' },
  'passive':     { label: 'Passive',  color: 'var(--behavior-passive)' },
};
