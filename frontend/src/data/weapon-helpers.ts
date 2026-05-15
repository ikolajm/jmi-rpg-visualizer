/** Weapon index → icon asset name. Icon assets live in assets/item/. */

const WEAPON_ICONS: Record<string, string> = {
  // Base weapons
  shortsword: 'sword',
  mace: 'mace',
  quarterstaff: 'orb-wand',
  longsword: 'sword',
  rapier: 'sword',
  warhammer: 'mace',
  longbow: 'bow',
  'heavy-crossbow': 'crossbow',
  greataxe: 'axe',
  // Magic weapons
  'flame-tongue': 'sword',
  'frost-brand': 'sword',
  'venom-dagger': 'bowie-knife',
  'holy-avenger': 'sword',
  'thunderous-maul': 'mace',
};

export function getWeaponIcon(weapon: string): string {
  return WEAPON_ICONS[weapon] || 'sword';
}
