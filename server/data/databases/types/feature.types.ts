import type { APIReference, OptionSelection } from "./general.types.ts"

interface FeatureBase {
    index: string
    name: string
    prerequisites: APIReference[]
    class: APIReference
    subclass?: APIReference
    level: number
    url: string

    feature_specific?: FeatureSpecificKey
    reference?: APIReference
    parent?: APIReference
}

interface FeatureSpecificKey {
    expertise_options?: ExpertiseOptionSelection
    subfeature_options?: SubfeatureOptionSelection
    invocations?: APIReference[]
}

interface ExpertiseOptionSelection extends OptionSelection {}
interface SubfeatureOptionSelection extends OptionSelection {}

export interface Feature2014 extends FeatureBase {
    desc: string[]
}
export interface Feature extends FeatureBase {
    description: string[]
}