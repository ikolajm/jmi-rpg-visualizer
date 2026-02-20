import type { APIReference, DifficultyClass, DifficultyClass2014, OptionSelection, OptionSelection2014 } from "./general.types.ts"

interface BaseMonster {
    index: string
    name: string
    type: string
    // =
    size: string
    alignment: string
    armor_class: ArmorClass
    hit_points: number
    hit_dice: string
    hit_points_roll: string
    speed: MonsterSpeed
    // =
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
    // =
    proficiencies: MonsterProficiency[]
    damage_vulnerabilities: string[]
    damage_resistances: string[]
    damage_immunities: string[]
    condition_immunities: APIReference[]
    // =
    senses: MonsterSenses
    languages: string
    // =
    challenge_rating: number
    proficiency_bonus: number
    xp: number
    // =
    forms: APIReference[]
    // =
    url: string
}

interface ArmorClass {
    type: string
    value: number
}
// =
interface MonsterSpeed {
    burrow?: string
    fly?: string
    swim?: string
    walk?: string
}
// =
interface MonsterProficiency {
    value: number
    proficiency: APIReference
}
// =
interface MonsterSenses {
    blindsight?: string
    darkvision?: string
    truesight?: string
    passive_perception?: number
}
// =
interface BaseSpecialAbility {
    name: string
    usage?: SpecialAbilityUsage
    damage?: SpecialAbilityDamage
    spellcasting?: MonsterSpellcasting
}
interface SpecialAbility2014 extends BaseSpecialAbility {
    desc: string
    dc?: DifficultyClass2014
}
export interface MonsterSpecialAbility extends BaseSpecialAbility {
    description: string
    dc?: DifficultyClass
}
// =
interface SpecialAbilityUsage {
    type: string
    times: number
}
interface SpecialAbilityDamage {
    damage_type: APIReference
    damage_dice: string
}
// =
interface MonsterSpellcasting {
    level: number
    ability: APIReference
    dc: number
    modifier: number
    components: string[]
    school: string
    slots: MonsterSpellSlot[]
    spells: MonsterSpell[]
}
interface MonsterSpellSlot {
    [x: string]: number
}
interface MonsterSpell {
    name: string
    level: number
    url: string
}
// 
interface BaseAction {
    name: string
    multiattack_type?: string
    actions?: MultiAttackAction[]
    action_options?: OptionSelection
    attack_bonus?: number
    damage?: ActionDamage[]
    usage?: ActionUsage
    
}
interface MultiAttackAction {
    action_name: string
    count: number
    type: string
}
interface ActionDamage {
    damage_type: APIReference
    damage_dice: string
}
interface ActionUsage {
    type: string
    dice: string
    min_value: number
}
// =
interface Action2014 extends BaseAction {
    desc: string
    dc?: DifficultyClass2014
    options: OptionSelection2014
}
export interface MonsterAction extends BaseAction {
    description: string
    dc?: DifficultyClass
    options?: OptionSelection
}
// =
interface BaseLegendaryAction {
    name: string
    damage?: ActionDamage[]
}
interface LegendaryAction2014 extends BaseLegendaryAction {
    dc?: DifficultyClass2014
    desc: string
}
export interface MonsterLegendaryAction extends BaseLegendaryAction {
    dc?: DifficultyClass
    description: string
}
interface BaseReaction {
    name: string
}
interface Reaction2014 extends BaseReaction {
    desc: string
}
interface Reaction extends BaseReaction {
    description: string
}

export interface Monster2014 extends BaseMonster {
    actions?: Action2014[]
    desc?: string
    legendary_actions?: LegendaryAction2014[]
    reactions?: Reaction2014[]
    special_abilities?: SpecialAbility2014[]
}

export interface Monster extends BaseMonster {
    actions: MonsterAction[]
    description: string
    legendary_actions: MonsterLegendaryAction[]
    reactions: Reaction[]
    special_abilities: MonsterSpecialAbility[]
}