import type { APIReference } from "./general.types.ts"

interface BaseEquipmentCategory {
    index: string
    name: string
    equipment: APIReference[]
    url: string
}

export interface EquipmentCategory2014 extends BaseEquipmentCategory {}

export interface EquipmentCategory2024 extends BaseEquipmentCategory {}

export interface EquipmentCategory {
    index: string
    name: string
    equipment: APIReference[]
    urls: string[]
}