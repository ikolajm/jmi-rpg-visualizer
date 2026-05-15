/**
 * Color utilities for game tokens.
 *
 * When colors became CSS custom properties (`var(--damage-fire)`),
 * the old hex+alpha concatenation trick (`${color}55` → `#abc12355`)
 * silently broke — `var(...)` strings can't take hex alpha suffixes.
 *
 * tint() does the equivalent via CSS color-mix, which accepts CSS vars
 * as inputs and resolves them at paint time. Browser support:
 * Chrome 111+ / Safari 16.2+ / Firefox 113+ (all 2023).
 */

/**
 * Mix a color with transparency.
 * @param color Any CSS color value — hex, rgb(), or `var(--token)`.
 * @param pct   0–100: percent of the color visible (100 = opaque, 0 = transparent).
 */
export function tint(color: string, pct: number): string {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}
