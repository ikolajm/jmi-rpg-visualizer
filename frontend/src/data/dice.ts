/**
 * Dice utilities for combat resolution.
 */

export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

/** Roll a dice expression like "2d6+3" and return the total */
export function rollDice(expression: string): number {
  // Handle expressions like "1d6+2", "2d8", "3d6+5"
  const match = expression.match(/^(\d+)d(\d+)(?:\+(\d+))?$/);
  if (!match) return 0;

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const bonus = match[3] ? parseInt(match[3], 10) : 0;

  let total = bonus;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

export function statMod(score: number): number {
  return Math.floor((score - 10) / 2);
}
