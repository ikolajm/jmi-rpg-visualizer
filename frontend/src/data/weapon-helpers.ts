/** Weapon lookup helpers — maps weapon indices to icons, damage types, dice */

export function getWeaponIcon(weapon: string): string {
  const map: Record<string, string> = {
    'longsword': 'sword', 'shortsword': 'sword', 'greataxe': 'axe',
    'mace': 'mace', 'longbow': 'bow', 'quarterstaff': 'orb-wand',
  };
  return map[weapon] || 'sword';
}

export function getWeaponDamageType(weapon: string): string {
  const types: Record<string, string> = {
    'longsword': 'slashing', 'shortsword': 'piercing', 'greataxe': 'slashing',
    'mace': 'bludgeoning', 'longbow': 'piercing', 'quarterstaff': 'bludgeoning',
  };
  return types[weapon] || 'slashing';
}

export function getWeaponDice(weapon: string): string {
  const dice: Record<string, string> = {
    'longsword': '1d8', 'shortsword': '1d6', 'greataxe': '1d12',
    'mace': '1d6', 'longbow': '1d8', 'quarterstaff': '1d6',
  };
  return dice[weapon] || '1d6';
}
