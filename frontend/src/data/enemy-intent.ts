/**
 * Enemy Intent System
 *
 * Mirrors the AI decision logic in useCombat to predict what each enemy
 * will do on their next turn. Computed at round start so players can plan.
 */

import type { Character, Enemy, EnemyIntent, IntentType } from './game-types';
import type { ActiveEffect } from './status-effects';
import { shouldSkipTurn } from './status-effects';

/** Classify an enemy action into an intent type */
function classifyAction(action: Enemy['actions'][number]): IntentType {
  // Save-based damage with no toHit = breath weapon / AoE
  if (action.saveDC && action.damage && !action.toHit) return 'breath';
  // Condition-only (no damage)
  if (action.conditionDC && !action.damage) return 'condition';
  // Ranged attack
  if (action.reach === 'any') return 'ranged';
  // Default: melee
  return 'melee';
}

/** Plan intents for all alive enemies — pure function, no side effects */
export function planIntents(
  enemies: Enemy[],
  party: Character[],
  activeEffects: ActiveEffect[],
): Record<string, EnemyIntent> {
  const intents: Record<string, EnemyIntent> = {};
  const aliveChars = party.filter(c => c.isAlive);

  if (aliveChars.length === 0) return intents;

  for (const enemy of enemies) {
    if (!enemy.isAlive) continue;

    // Check if disabled by status effects
    const enemyEffects = activeEffects.filter(e => e.targetId === enemy.id);
    if (shouldSkipTurn(enemyEffects)) {
      intents[enemy.id] = { type: 'skip' };
      continue;
    }

    const behavior = enemy.behavior || 'melee-aggro';

    // Passive enemies skip
    if (behavior === 'passive') {
      intents[enemy.id] = { type: 'skip' };
      continue;
    }

    // Mirror the AI's target + action selection logic
    const sameZone = aliveChars.filter(c => c.zone === enemy.zone);
    const nearest = aliveChars.reduce((best, c) =>
      Math.abs(c.zone - enemy.zone) < Math.abs(best.zone - enemy.zone) ? c : best
    );
    const target = sameZone.length > 0 ? sameZone[0] : nearest;

    const dcAction = enemy.actions.find(a => a.saveDC && a.damage);
    const condAction = enemy.actions.find(a => a.conditionDC && !a.saveDC);
    let action;

    if (behavior === 'caster' || behavior === 'boss-caster' || behavior === 'boss') {
      action = dcAction || condAction
        || enemy.actions.find(a => a.reach === 'any')
        || enemy.actions[0];
    } else if (behavior === 'flexible') {
      action = dcAction
        || ((target.zone === enemy.zone)
          ? enemy.actions.find(a => a.reach === 'melee') || enemy.actions[0]
          : enemy.actions.find(a => a.reach === 'any') || enemy.actions[0]);
    } else {
      // melee-aggro
      action = (target.zone === enemy.zone)
        ? enemy.actions.find(a => a.reach === 'melee') || condAction || enemy.actions[0]
        : dcAction || enemy.actions.find(a => a.reach === 'any') || enemy.actions[0];
    }

    if (!action || (!action.toHit && !action.saveDC)) {
      intents[enemy.id] = { type: 'skip' };
      continue;
    }

    intents[enemy.id] = {
      type: classifyAction(action),
      actionName: action.name,
    };
  }

  return intents;
}
