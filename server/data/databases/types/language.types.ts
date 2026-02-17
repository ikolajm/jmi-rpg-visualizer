export interface BaseLanguage {
    index: string
    name: string
    url: string
}

export interface Language2014 extends BaseLanguage {
    type: string
    typical_speakers: string[]
    script: string
}

export interface Language2024 extends BaseLanguage {
    is_rare: boolean
    note: string
}

export interface Language {
    index: string
    name: string
    type: string
    typical_speakers: string[]
    script: string
    isRare: boolean
    notes: string[]
    urls: string[]
}
