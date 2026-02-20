import type { APIReference, OptionSelection } from "./general.types.ts"

interface BaseFeature {
    index: string
    name: string
    desc: string[]
    prerequisites: APIReference[]
    class: APIReference
    subclass?: APIReference
    level: number
    url: string

    feature_specific?: FeatureSpecificKey
    reference?: APIReference
    parent?: APIReference
}

interface FeatureSpecificKey { // Here
    expertise_options?: ExpertiseOptionSelection
    subfeature_options?: SubfeatureOptionSelection
    invocations?: APIReference[]
}

interface ExpertiseOptionSelection extends OptionSelection {}
interface SubfeatureOptionSelection extends OptionSelection {}

export interface Feature2014 extends BaseFeature {}
export interface Feature extends BaseFeature {}