interface BaseMagicSchool {
    index: string
    name: string
    url: string
}

export interface MagicSchool2014 extends BaseMagicSchool {
    desc: string
}

export interface MagicSchool2024 extends BaseMagicSchool {
    description: string
}

export interface MagicSchool {
    index: string
    name: string
    description: string
    description_short: string
    urls: string[]
}