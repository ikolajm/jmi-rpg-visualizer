/**
 * Damage Visuals — canonical visual registry for damage types.
 *
 * Parallel to condition-visuals.ts. One engine damage type =
 * one icon + color + family. Consumers (DamageIcon, TokenFeedbackOverlay,
 * GameLog, AttackLine) read from this module.
 *
 * Engine deals 11 damage types + healing. They group into 10 visual
 * families — the three physical types share a family + color but keep
 * distinct icons for log/inspect clarity. Family is the unit of bespoke
 * Umbrella B animation theming.
 *
 * Color values are CSS var references → game-tokens.css.
 */

import {
  Sword, ArrowRight, Hammer, Flame, Snowflake, Zap, Waves,
  Droplet, Skull, Sun, Atom, Heart,
} from 'lucide-react';

/** Visual family — the unit of themed animation in Umbrella B */
export type DamageFamily =
  | 'physical' | 'fire' | 'cold' | 'lightning' | 'thunder'
  | 'radiant' | 'necrotic' | 'acid' | 'force' | 'healing';

/** Engine damage types (what combat data carries) */
export type DamageType =
  | 'bludgeoning' | 'piercing' | 'slashing'
  | 'fire' | 'cold' | 'lightning' | 'thunder'
  | 'radiant' | 'necrotic' | 'acid' | 'force'
  | 'healing';

export interface DamageVisual {
  label: string;
  family: DamageFamily;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  /** Family color — same across types in the same family */
  color: string;
}

const PHYSICAL_COLOR = 'var(--damage-physical)';

export const DAMAGE_VISUALS: Record<DamageType, DamageVisual> = {
  // Physical — shared color + family, distinct icons
  bludgeoning: { label: 'Bludgeoning', family: 'physical',  icon: Hammer,     color: PHYSICAL_COLOR },
  piercing:    { label: 'Piercing',    family: 'physical',  icon: ArrowRight, color: PHYSICAL_COLOR },
  slashing:    { label: 'Slashing',    family: 'physical',  icon: Sword,      color: PHYSICAL_COLOR },

  // Elemental
  fire:        { label: 'Fire',        family: 'fire',      icon: Flame,      color: 'var(--damage-fire)' },
  cold:        { label: 'Cold',        family: 'cold',      icon: Snowflake,  color: 'var(--damage-cold)' },
  lightning:   { label: 'Lightning',   family: 'lightning', icon: Zap,        color: 'var(--damage-lightning)' },
  thunder:     { label: 'Thunder',     family: 'thunder',   icon: Waves,      color: 'var(--damage-thunder)' },
  acid:        { label: 'Acid',        family: 'acid',      icon: Droplet,    color: 'var(--damage-acid)' },

  // Magical
  radiant:     { label: 'Radiant',     family: 'radiant',   icon: Sun,        color: 'var(--damage-radiant)' },
  necrotic:    { label: 'Necrotic',    family: 'necrotic',  icon: Skull,      color: 'var(--damage-necrotic)' },
  force:       { label: 'Force',       family: 'force',     icon: Atom,       color: 'var(--damage-force)' },

  // Positive
  healing:     { label: 'Healing',     family: 'healing',   icon: Heart,      color: 'var(--damage-healing)' },
};

/** Fallback color when a damage type is unknown (defensive — shouldn't happen post-trim) */
const FALLBACK_COLOR = PHYSICAL_COLOR;

/** Resolve a damage type to its color, with a safe fallback */
export function damageColor(type: string | undefined): string {
  if (!type) return FALLBACK_COLOR;
  return DAMAGE_VISUALS[type as DamageType]?.color ?? FALLBACK_COLOR;
}

/** Resolve a damage type to its visual family */
export function damageFamily(type: string | undefined): DamageFamily | null {
  if (!type) return null;
  return DAMAGE_VISUALS[type as DamageType]?.family ?? null;
}
