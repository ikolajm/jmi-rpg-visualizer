import type { AbilityBonus, APIReference } from "./general.types.ts"

interface BaseSubrace {
    index: string
    name: string
    ability_bonuses: AbilityBonus[]
    racial_traits: APIReference[]
    url: string
}

export interface Subrace2014 extends BaseSubrace {
    race: APIReference
    desc: string
}

export interface Subrace extends BaseSubrace {
    species: APIReference
    description: string
}