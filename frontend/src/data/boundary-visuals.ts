/**
 * Boundary Visuals — visual treatment for zone-boundary walls.
 *
 * Wall-of-fire / wall-of-frost / wall-of-force boundaries between zones.
 * Each element gets an icon + a color that mirrors the damage family it
 * deals on crossing — so the wall and the damage read as the same thing
 * visually. Colors are imported from DAMAGE_VISUALS rather than redefined.
 */

import { Flame, Snowflake, Atom } from 'lucide-react';
import { DAMAGE_VISUALS } from './damage-visuals';

export type BoundaryElement = 'fire' | 'ice' | 'force';

export interface BoundaryVisual {
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

export const BOUNDARY_VISUALS: Record<BoundaryElement, BoundaryVisual> = {
  fire:  { label: 'Wall of Fire',  icon: Flame,     color: DAMAGE_VISUALS.fire.color },
  ice:   { label: 'Wall of Frost', icon: Snowflake, color: DAMAGE_VISUALS.cold.color },
  force: { label: 'Wall of Force', icon: Atom,      color: DAMAGE_VISUALS.force.color },
};
