/**
 * Combat Event Bus
 *
 * Lightweight pub/sub for visual combat feedback.
 * Combat resolvers push events, UI components subscribe and render
 * floating text, flashes, overlays, etc. Events auto-expire.
 */

export type CombatFeedbackType =
  | 'damage' | 'heal' | 'miss' | 'crit' | 'status' | 'immune'
  | 'vulnerable' | 'resisted'
  | 'attack-swing' | 'spell-cast' | 'defend' | 'kill' | 'impact';

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
