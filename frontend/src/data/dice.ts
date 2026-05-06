/**
 * Dice utilities for combat resolution.
 */

export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

/** Roll a dice expression like "2d6+3", "1d4 + 1", or a flat number "1" */
export function rollDice(expression: string): number {
  // Strip spaces for flexible parsing
  const expr = expression.replace(/\s+/g, '');

  // Handle dice expressions: "1d6+2", "2d8", "3d6+5"
  const match = expr.match(/^(\d+)d(\d+)(?:([+-]\d+))?$/);
  if (match) {
    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    const bonus = match[3] ? parseInt(match[3], 10) : 0;

    let total = bonus;
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
  }

  // Handle flat numbers: "1", "5"
  const flat = parseInt(expr, 10);
  if (!isNaN(flat)) return flat;

  return 0;
}

export function statMod(score: number): number {
  return Math.floor((score - 10) / 2);
}
