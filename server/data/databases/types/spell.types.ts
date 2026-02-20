import type { APIReference, AreaOfEffect, DifficultyClass, SpellDamage } from "./general.types.ts"

interface BaseSpell {
    index: string
    name: string
    range: string
    material: string
    higher_level?: string[]
    components: string[]
    ritual: boolean
    duration: string
    concentration: boolean
    casting_time: string
    level: number
    attack_type?: string
    damage?: SpellDamage
    school: APIReference
    classes: APIReference[]
    subclasses: APIReference[]
    area_of_effect?: AreaOfEffect
    heal_at_slot_level?: HealAtSlotLevel
    url: string
}

interface DifficultyClass2014 {
    dc_type: APIReference
    dc_success?: string
    desc?: string
}
// =
interface HealAtSlotLevel {
    [x:string]: string
}
// =
export interface Spell2014 extends BaseSpell {
    desc: string[]
    dc?: DifficultyClass2014
}
// =
export interface Spell extends BaseSpell {
    description: string[]
    dc?: DifficultyClass
}