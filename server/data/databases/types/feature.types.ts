import type { APIReference, BaseOptionSelection } from "./general.types.ts"

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

interface FeatureSpecificKey {
    expertise_options?: ExpertiseOptionSelection
    subfeature_options?: SubfeatureOptionSelection
    invocations?: APIReference[]
}

interface ExpertiseOptionSelection extends BaseOptionSelection {}
interface SubfeatureOptionSelection extends BaseOptionSelection {}

export interface Feature2014 extends BaseFeature {}
export interface Feature extends BaseFeature {}