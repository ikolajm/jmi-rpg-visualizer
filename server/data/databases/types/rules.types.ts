import type { APIReference } from "./general.types.ts"

interface BaseRule {
    index: string
    name: string
    subsections: APIReference[]
    url: string
}

export interface Rule2014 extends BaseRule {
    desc: string
}

export interface Rule extends BaseRule {
    description: string
}