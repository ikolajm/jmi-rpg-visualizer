/**
 * Class Visuals — color identity per class.
 *
 * One entry per class, keyed by class.index. Color values are CSS var
 * references → game-tokens.css. Used in the draft screen and any other
 * surface where class identity drives accent color (placards, level-up
 * cards, etc.). Icon + name + role stay in classBuilds data.
 *
 * Color intent:
 *   fighter — red    (martial aggression)
 *   rogue   — violet (shadow, burst)
 *   wizard  — blue   (arcane, cold)
 *   cleric  — gold   (divine, holy)
 *   ranger  — green  (nature, ranged)
 *   barbarian — orange (rage, fury)
 */

export interface ClassVisual {
  color: string;
}

export const CLASS_VISUALS: Record<string, ClassVisual> = {
  fighter:   { color: 'var(--class-fighter)' },
  rogue:     { color: 'var(--class-rogue)' },
  wizard:    { color: 'var(--class-wizard)' },
  cleric:    { color: 'var(--class-cleric)' },
  ranger:    { color: 'var(--class-ranger)' },
  barbarian: { color: 'var(--class-barbarian)' },
};

/** Resolve a class index to its color, with a safe fallback. */
export function classColor(classIndex: string): string {
  return CLASS_VISUALS[classIndex]?.color ?? 'var(--primary)';
}
