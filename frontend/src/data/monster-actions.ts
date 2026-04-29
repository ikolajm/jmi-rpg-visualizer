/**
 * Monster Action Normalizer
 *
 * Extracts structured attack data from SRD monster action objects
 * so they can be rendered with AttackLine and DamageInline.
 */

export interface NormalizedAction {
  name: string;
  description: string;
  toHit?: number;
  damage?: string;
  damageType?: string;
  reach: string;
  isMultiattack?: boolean;
}

interface SrdDamage {
  damage_type?: { index: string; name: string };
  damage_dice?: string;
}

interface SrdAction {
  name: string;
  description: string;
  attack_bonus?: number;
  damage?: SrdDamage[];
  multiattack_type?: string;
  dc?: {
    dc_type?: { index: string };
    dc_value?: number;
    success_type?: string;
  };
}

function inferReach(desc: string): string {
  if (desc.includes('Melee or Ranged')) return 'any';
  if (desc.includes('Melee Weapon Attack') || desc.includes('Melee Spell Attack')) return 'melee';
  if (desc.includes('Ranged Weapon Attack') || desc.includes('Ranged Spell Attack')) return 'any';
  if (/\bDC\b/.test(desc)) return 'any';
  return 'melee';
}

export function normalizeAction(action: SrdAction): NormalizedAction {
  const result: NormalizedAction = {
    name: action.name,
    description: action.description,
    reach: inferReach(action.description),
  };

  if (action.name === 'Multiattack') {
    result.isMultiattack = true;
    return result;
  }

  if (action.attack_bonus !== undefined) {
    result.toHit = action.attack_bonus;
  }

  if (action.damage && action.damage.length > 0) {
    const primary = action.damage[0];
    result.damage = primary.damage_dice || undefined;
    result.damageType = primary.damage_type?.index || undefined;
  }

  return result;
}

export function normalizeActions(actions: SrdAction[]): NormalizedAction[] {
  return actions.map(normalizeAction);
}
