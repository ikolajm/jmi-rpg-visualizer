import type { APIReference } from "./general.types.ts"

interface BaseMagicItem {
    index: string
    name: string
    equipment_category: APIReference
    variant: boolean
    variants: APIReference[]
    url: string
}

export interface MagicItem2014 extends BaseMagicItem {
    desc: string[]
    rarity: {
        name: string
    }
}

export interface MagicItem extends BaseMagicItem {
    description: string[]
    rarity: string
}