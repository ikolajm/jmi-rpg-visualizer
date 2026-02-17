interface BaseDamageType {
    index: string
    name: string
    url: string
}

export interface DamageType2014 extends BaseDamageType {
    desc: string[]
}

export interface DamageType2024 extends BaseDamageType {
    description: string
}

export interface DamageType {
    index: string
    name: string
    description: string[]
    description_short: string
    urls: string[]
}