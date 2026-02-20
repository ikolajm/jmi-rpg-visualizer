import type { APIReference } from "./general.types.ts"

interface BaseEquipment {
    index: string
    name: string
    equipment_category: APIReference
    
    weapon_category?: string
    weapon_range?: string
    category_range?: string
    damage?: EquipmentDamage
    two_handed_damage?: EquipmentDamage
    range?: EquipmentRange
    throw_range?: EquipmentThrowRange
    properties?: APIReference[]
    special?: string[]
    
    armor_category?: string
    armor_class?: ArmorClass
    str_minimum?: number
    stealth_disadvantage?: boolean

    gear_category?: APIReference
    tool_category?: string

    contents?: PackContentItem[]

    vehicle_category?: string
    speed?: VehicleSpeed
    capacity?: string
    
    quantity?: number
    weight?: number
    cost: EquipmentCost
    url: string
}

interface EquipmentCost {
    quantity: number
    unit: string
}
// =
interface EquipmentDamage {
    damage_dice: string
    damage_type: APIReference
}
// =
interface EquipmentRange {
    [x:string]: number
}
interface EquipmentThrowRange {
    [x:string]: number
}
// =
interface ArmorClass {
    base: number
    dex_bonus: boolean
    max_bonus: number
}
// =
interface PackContentItem {
    item: APIReference
    quantity: number
}
// =
interface VehicleSpeed {
    quantity: number
    unit: string
}

export interface Equipment2014 extends BaseEquipment {
    desc: string[]
}

export interface Equipment extends BaseEquipment {
    description: string[]
}