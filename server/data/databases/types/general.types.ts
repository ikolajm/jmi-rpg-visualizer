export interface APIReference {
    name: string
    index: string
    url: string | string[]
    note?: string
}
// =
export interface BaseOptionSelection {
    choose: number
    type: string
    from: OptionSet
}
export interface OptionSelection2014 extends BaseOptionSelection {
    desc?: string | string[]
    dc?: DifficultyClass2014
}
export interface OptionSelection extends BaseOptionSelection {
    description?: string | string[]
}

export interface OptionSet {
    option_set_type: string
    options: OptionOptions[]
}

interface BaseOption {
    option_type: string
}
interface ActionOption extends BaseOption {
    items: ActionOptionItem[]
}
interface ActionOptionItem {
    option_type: string
    action_name: string
    count: number
    type: string
}
interface AbilityScoreOption extends BaseOption {
    ability_score: APIReference
    bonus: number
}
interface BreathOption extends BaseOption {
    name: string
    dc: DifficultyClass
    damage?: {
        damage_type: APIReference
        damage_dice: string
    }
}
interface ChoiceOption extends BaseOption {
    item: APIReference
}
interface CountedReferenceOption extends BaseOption {
    count: number
    of: APIReference
}
interface ReferenceOption extends BaseOption {
    item: APIReference
}
interface MultiActionOption {
    items: ActionOptionItem
}
export type OptionOptions = (ActionOption | AbilityScoreOption | BreathOption | ChoiceOption | CountedReferenceOption | ReferenceOption | MultiActionOption)
// =
export interface AbilityBonus {
    ability_score: APIReference
    bonus: number
}
// 
export interface AreaOfEffect {
    type: string
    size: number
}
// 
export interface Usage {
    type: string
    times: number
}
// =
export interface SpellDamage {
    damage_type: APIReference
    damage_at_slot_level?: { [x:string]: string }
    damage_at_character_level?: { [x:string]: string }
}
// =
export interface DifficultyClass2014 {
    dc_type: APIReference
    dc_value?: number
    success_type?: string
    desc?: string
}
export interface DifficultyClass {
    dc_type: APIReference
    dc_value?: number
    dc_success?: string
    dc_fail?: string
}