/**
 * Consumable item definitions for v1.
 * Potions heal, scrolls deal damage or apply effects.
 */

export interface ConsumableDef {
  id: string;
  name: string;
  icon: string;
  effect: 'heal' | 'damage';
  value: string;     // dice expression: "2d4+2" or "8d6"
  damageType?: string;
  target: 'self' | 'ally' | 'enemy';
  description: string;
}

export const consumables: Record<string, ConsumableDef> = {
  'health-potion': {
    id: 'health-potion',
    name: 'Health Potion',
    icon: 'consumable-potion',
    effect: 'heal',
    value: '2d4+2',
    target: 'ally',
    description: 'Restores 2d4+2 hit points.',
  },
  'greater-health-potion': {
    id: 'greater-health-potion',
    name: 'Greater Health Potion',
    icon: 'consumable-potion',
    effect: 'heal',
    value: '4d4+4',
    target: 'ally',
    description: 'Restores 4d4+4 hit points.',
  },
  'scroll-of-fireball': {
    id: 'scroll-of-fireball',
    name: 'Scroll of Fireball',
    icon: 'consumable-scroll',
    effect: 'damage',
    value: '8d6',
    damageType: 'fire',
    target: 'enemy',
    description: 'Deals 8d6 fire damage to a target.',
  },
};

/** Starting consumables per class */
export function getStartingConsumables(classIndex: string) {
  return [
    { id: 'health-potion', name: 'Health Potion', quantity: 2, effect: 'heal', value: 7 },
  ];
}
