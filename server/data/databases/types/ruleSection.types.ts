interface BaseRuleSection {
    index: string
    name: string
    url: string
}

export interface RuleSection2014 extends BaseRuleSection {
    desc: string
}

export interface RuleSection extends BaseRuleSection {
    description: string
}