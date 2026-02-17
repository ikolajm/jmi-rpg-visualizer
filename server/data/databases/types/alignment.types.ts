interface BaseAlignment {
    index: string
    name: string
    abbreviation: string
    url: string
}

export interface Alignment2014 extends BaseAlignment {
    desc: string
}

export interface Alignment2024 extends BaseAlignment {
    description: string
}

export interface Alignment {
    index: string
    name: string
    abbreviation: string
    description: string[]
    urls: string[]
}