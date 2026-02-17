import { APIReference } from "./general.types.ts"

interface BaseProficiency {
    index: string
    type: string
    name: string
    classes: APIReference[]
    reference: APIReference
    url: string
}

export interface Proficiency2014 extends BaseProficiency {
    races: APIReference[]
}

export interface Proficiency2024 extends BaseProficiency {
    species: APIReference[]
    backgrounds: APIReference[]
}

export interface Proficiency {
    index: string
    type: string
    name: string
    classes: APIReference[]
    reference: APIReference
    species: APIReference[]
    backgrounds: APIReference[]
    urls: string[]
}
