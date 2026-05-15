/**
 * Combat Log Flavor Text
 *
 * Dynamic log messages keyed by damage type and outcome.
 * Mechanical data (rolls, AC) shown in parentheses.
 */

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Verb Pools ─────────────────────────────────────────────

const HIT_VERBS: Record<string, string[]> = {
  slashing:    ['cleaves into', 'slashes', 'carves through', 'rends', 'cuts deep into'],
  piercing:    ['skewers', 'punctures', 'drives into', 'impales', 'pierces through'],
  bludgeoning: ['smashes', 'crushes', 'hammers', 'cracks', 'batters'],
  fire:        ['scorches', 'engulfs in flame', 'burns', 'ignites', 'sears'],
  cold:        ['freezes', 'chills to the bone', 'blasts with frost', 'encases in ice', 'flash-freezes'],
  lightning:   ['jolts', 'electrocutes', 'shocks', 'arcs through', 'strikes with lightning'],
  thunder:     ['blasts', 'deafens', 'shatters against', 'thunders into', 'concusses'],
  necrotic:    ['drains', 'withers', 'corrupts', 'siphons life from', 'decays'],
  radiant:     ['sears with light', 'smites', 'burns with radiance', 'blazes through', 'purges'],
  poison:      ['poisons', 'sickens', 'toxifies', 'infects', 'envenoms'],
  acid:        ['dissolves', 'corrodes', 'eats through', 'melts into', 'burns with acid'],
  psychic:     ['fractures the mind of', 'assaults the thoughts of', 'shreds the psyche of', 'invades', 'unravels'],
  force:       ['blasts', 'slams into', 'hammers with force', 'strikes with raw energy', 'pulverizes'],
  healing:     ['mends', 'restores', 'soothes', 'rejuvenates', 'heals'],
};

const MISS_VERBS = [
  'swings wide at', 'narrowly misses', 'fails to connect with',
  'whiffs past', 'glances off the armor of',
];

const CRIT_PREFIXES = [
  'A devastating blow!', 'Critical hit!', 'A perfect strike!',
  'A brutal impact!', 'Right in the weak spot!',
];

const KILL_VERBS = [
  'finishes off', 'fells', 'destroys', 'strikes down', 'ends',
];

const CONDITION_VERBS: Record<string, string[]> = {
  paralyzed:   ['seizes up', 'is locked in place', 'cannot move a muscle', 'freezes mid-motion', 'goes rigid'],
  unconscious: ['collapses', 'crumples to the ground', 'falls into darkness', 'drops unconscious', 'slumps over'],
  restrained:  ['is caught', 'is bound tight', 'is locked down', 'struggles against bonds', 'is snared'],
  poisoned:    ['turns green', 'starts retching', 'staggers, sickened', 'is wracked with nausea', 'feels the venom spread'],
  frightened:  ['recoils in terror', 'trembles with fear', 'backs away, wide-eyed', 'is gripped by dread', 'panics'],
  prone:       ['is knocked flat', 'hits the ground', 'is swept off their feet', 'stumbles and falls', 'crashes down'],
  burning:     ['catches fire', 'is set ablaze', 'erupts in flames', 'is wreathed in fire', 'starts smoldering'],
  frozen:      ['is flash-frozen', 'is encased in ice', 'is locked in frost', 'crystallizes', 'is frozen in place'],
  commanded:   ['obeys against their will', 'is compelled', 'moves involuntarily', 'has no choice but to comply', 'submits to the command'],
};

const SAVE_SUCCESS = [
  'shrugs it off', 'resists', 'shakes it off', 'steels themselves', 'powers through',
];

// ─── Formatters ─────────────────────────────────────────────

export function logAttackHit(
  attacker: string, target: string, weapon: string,
  damage: number, damageType: string,
  roll: number, ac: number, isCrit: boolean, isKill: boolean,
): string {
  const verbs = HIT_VERBS[damageType] || HIT_VERBS.slashing;
  const verb = pick(verbs);

  if (isKill) {
    return `${attacker} ${pick(KILL_VERBS)} ${target} — ${damage} ${damageType} (${roll} vs AC ${ac})`;
  }
  if (isCrit) {
    return `${pick(CRIT_PREFIXES)} ${attacker} ${verb} ${target} — ${damage} ${damageType} (${roll} vs AC ${ac})`;
  }
  return `${attacker} ${verb} ${target} — ${damage} ${damageType} (${roll} vs AC ${ac})`;
}

export function logAttackMiss(attacker: string, target: string, roll: number, ac: number, tag?: string): string {
  return `${attacker} ${pick(MISS_VERBS)} ${target}${tag || ''} (${roll} vs AC ${ac})`;
}

export function logNat1(attacker: string, target: string): string {
  return `${attacker} swings wildly at ${target} — fumble!`;
}

export function logSpellHit(
  caster: string, spellName: string, target: string,
  damage: number, damageType: string,
  isCrit: boolean, isKill: boolean,
): string {
  const verbs = HIT_VERBS[damageType] || HIT_VERBS.force;
  const verb = pick(verbs);

  if (isKill) {
    return `${caster}'s ${spellName} ${pick(KILL_VERBS)} ${target} — ${damage} ${damageType}`;
  }
  if (isCrit) {
    return `${pick(CRIT_PREFIXES)} ${caster}'s ${spellName} ${verb} ${target} — ${damage} ${damageType}`;
  }
  return `${caster}'s ${spellName} ${verb} ${target} — ${damage} ${damageType}`;
}

export function logSpellMiss(caster: string, spellName: string, target: string, roll: number, ac: number): string {
  return `${caster}'s ${spellName} ${pick(MISS_VERBS)} ${target} (${roll} vs AC ${ac})`;
}

export function logHeal(caster: string, spellName: string, target: string, amount: number, oldHp: number, newHp: number): string {
  const verb = pick(HIT_VERBS.healing);
  const self = caster === target;
  return self
    ? `${caster} ${verb} with ${spellName} — +${amount} HP (${oldHp}→${newHp})`
    : `${caster}'s ${spellName} ${verb} ${target} — +${amount} HP (${oldHp}→${newHp})`;
}

export function logConditionApplied(target: string, condition: string, saveInfo?: string): string {
  const verbs = CONDITION_VERBS[condition];
  const verb = verbs ? pick(verbs) : `is ${condition}`;
  return saveInfo
    ? `${target} ${verb}! (${saveInfo})`
    : `${target} ${verb}!`;
}

export function logConditionResisted(target: string, condition: string, saveInfo: string): string {
  return `${target} ${pick(SAVE_SUCCESS)} — resists ${condition} (${saveInfo})`;
}

export function logConditionFree(target: string, effectName: string): string {
  return `${target} breaks free from ${effectName}!`;
}

export function logBreathWeapon(
  attacker: string, actionName: string, target: string,
  damage: number, damageType: string,
  saved: boolean, saveInfo: string,
): string {
  const verbs = HIT_VERBS[damageType] || HIT_VERBS.fire;
  const verb = pick(verbs);
  return `${attacker}'s ${actionName} ${verb} ${target} — ${damage} ${damageType}${saved ? ' (saved, half)' : ''} (${saveInfo})`;
}

export function logDot(target: string, effectName: string, damage: number, damageType: string, saved?: boolean): string {
  const verbs = HIT_VERBS[damageType] || HIT_VERBS.fire;
  return `${effectName} ${pick(verbs)} ${target} — ${damage} ${damageType}${saved ? ' (saved, half)' : ''}`;
}

export function logMove(name: string, zoneName: string): string {
  return `${name} moves to ${zoneName}.`;
}

export function logBoundaryCross(name: string, wallName: string, damage: number, damageType: string, saved: boolean): string {
  const verbs = HIT_VERBS[damageType] || HIT_VERBS.fire;
  return `${name} crosses through ${wallName} — ${pick(verbs)} for ${damage} ${damageType}${saved ? ' (saved, half)' : ''}`;
}

export function logDeath(name: string, cause?: string): string {
  if (cause) return `${name} is ${pick(KILL_VERBS).replace(/s$/, 'ed')} by ${cause}!`;
  return `${name} has fallen!`;
}

export function logImmune(target: string, damageType: string): string {
  return `${target} is immune to ${damageType}!`;
}

export function logVulnerable(target: string, damageType: string): string {
  return `${target} is vulnerable to ${damageType} — double damage!`;
}
