/**
 * Combat Event Bus
 *
 * Lightweight pub/sub for visual combat feedback.
 * Combat resolvers push events, UI components subscribe and render
 * the card-overlay treatment. Events auto-expire.
 */

export type CombatFeedbackType =
  | 'damage'        // value-bearing hit; carries optional qualifier
  | 'heal'          // value-bearing heal
  | 'miss'          // attack failed (no value)
  | 'immune'        // attack landed but target immune (no value)
  | 'attack-swing'  // attacker swing motion (on attacker card)
  | 'spell-cast'    // caster charge-up (on caster card)
  | 'defend'        // defender brace flourish
  | 'kill'          // global death vignette
  | 'status';       // reserved — status applied

/** Damage modifier — appears as ribbon label on the result overlay */
export type DamageQualifier = 'crit' | 'resisted' | 'vulnerable';

export interface CombatFeedbackEvent {
  id: string;
  type: CombatFeedbackType;
  targetId: string;
  value?: number;
  text?: string;
  damageType?: string;
  attackerId?: string;
  attackerZone?: number;
  targetZone?: number;
  spellSchool?: string;
  isPartyMember?: boolean;
  qualifier?: DamageQualifier;
}

type Listener = (event: CombatFeedbackEvent) => void;

const listeners = new Set<Listener>();
let eventCounter = 0;

export function emitCombatFeedback(event: Omit<CombatFeedbackEvent, 'id'>) {
  const full: CombatFeedbackEvent = { ...event, id: `fb-${Date.now()}-${eventCounter++}` };
  listeners.forEach(fn => fn(full));
}

export function onCombatFeedback(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Shared delay helper for sequential animation timing */
export const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ─── Visual timing constants ─────────────────────────────────
// Colocated with the event bus so resolver timing reads as a single
// concept ("emit, then wait the visual charge-up before next emit").

/** Caster charge-up duration before a spell impacts the target */
export const CAST_CHARGE_MS = 600;

/** How long the visual death animation is held after a 'kill' event —
 *  gives the damage overlay time to play before the card grays out. */
export const DEATH_HOLD_MS = 1200;
