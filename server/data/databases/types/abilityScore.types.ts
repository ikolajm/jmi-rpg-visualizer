import type { APIReference } from "./general.types.ts"

interface BaseAbilityScore {
    index: string
    name: string
    full_name: string
    skills: APIReference[]
    url: string
}

export interface AbilityScore2014 extends BaseAbilityScore {
    desc: string[]
}

export interface AbilityScore2024 extends BaseAbilityScore {
    description: string
}

export interface AbilityScore {
    index: string
    name: string
    full_name: string
    skills: APIReference[]
    description: string[]
    description_short: string
    urls: string[]
}