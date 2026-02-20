import type { APIReference } from "./general.types.ts"

interface BaseSubclass {
    index: string
    name: string
    class: APIReference
    subclass_flavor: string
    subclass_levels: string
    spells?: Spells[]
    url: string
}

interface Spells {
    prerequisites: Prerequisite[]
    spell: APIReference
}
interface Prerequisite {
    index: string
    type: string
    name: string
    url: string
}

export interface Subclass2014 extends BaseSubclass {
    desc: string[]
}

export interface Subclass extends BaseSubclass {
    description: string[]
}