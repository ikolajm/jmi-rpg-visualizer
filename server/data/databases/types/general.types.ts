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
interface OptionSet {
    option_set_type: string
    options: Option[]
}
interface Option {
    option_type: string
    item?: APIReference
    choice?: ChoiceOption
    items?: (APIReference | ChoiceOption)[]
    ability_score?: APIReference
    bonus?: number
}
interface ChoiceOption {
    choose: number
    type: string
    from: OptionSet
}
// =
export interface AbilityBonus {
    ability_score: APIReference
    bonus: number
}