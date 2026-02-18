interface BaseFeat {
    index: string
    name: string
    description: string
    type: string
    url: string | string[]
}

export interface Feat2024 extends BaseFeat {}

export interface Feat extends BaseFeat {}