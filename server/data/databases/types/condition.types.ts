export interface BaseCondition {
    index: string
    name: string
    url: string
}

export interface Condition2014 extends BaseCondition {
    desc: string[]
}

export interface Condition2024 extends BaseCondition {
    description: string
}

export interface Condition {
    index: string
    name: string
    description_arr: string[]
    desc_formatted: string
    urls: string[]
}
