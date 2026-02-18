import type { AbilityBonus, APIReference, BaseOptionSelection } from "./general.types.ts"

interface BaseSpecies {
    index: string
    name: string
    alignment: string
    age: string
    speed: number
    size: string
    size_description: string
    languages: APIReference[]
    language_desc: string
    subraces: APIReference[]
    traits: APIReference[]
    ability_bonuses: AbilityBonus[]
    abilityBonusOptions?: AbilityBonusOptions
    url: string
}

interface AbilityBonusOptions extends BaseOptionSelection {}

export interface Species2014 extends BaseSpecies {}
export interface Species extends BaseSpecies {}