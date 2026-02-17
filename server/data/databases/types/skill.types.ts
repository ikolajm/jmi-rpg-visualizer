import type { APIReference } from "./general.types.ts"

interface BaseSkill {
    index: string
    name: string
    ability_score: APIReference
    url: string
}

export interface Skill2014 extends BaseSkill {
    desc: string[]
}

export interface Skill2024 extends BaseSkill {
    description: string
}

export interface Skill {
    index: string
    name: string
    description: string[]
    description_short: string
    ability_score: APIReference
    urls: string[]
}