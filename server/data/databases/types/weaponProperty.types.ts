interface BaseWeaponProperty {
    index: string
    name: string
    url: string
}

export interface WeaponProperty2014 extends BaseWeaponProperty {
    desc: string[]
}

export interface WeaponProperty2024 extends BaseWeaponProperty {
    description: string
}

export interface WeaponProperty {
    index: string
    name: string
    description: string[]
    description_short: string
    urls: string[]
}