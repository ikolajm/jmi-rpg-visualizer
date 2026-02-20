import type { APIReference, AreaOfEffect, OptionSelection, DifficultyClass, SpellDamage, Usage } from "./general.types.ts"

interface BaseTrait {
    index: string
    subraces: APIReference[]
    proficiencies: APIReference[]
    proficiency_choices?: ProficiencyOptionSelection
    
    language_options?: LanguageOptionSelection
    parent?: APIReference
    url: string
}

interface LanguageOptionSelection extends OptionSelection {}
interface SpellOptionSelection extends OptionSelection {}
interface SubtraitOptionSelection extends OptionSelection {}
interface ProficiencyOptionSelection extends OptionSelection {}

interface BaseTraitSpecific {
    damage_type?: APIReference
    spell_options?: SpellOptionSelection
    subtrait_options?: SubtraitOptionSelection
}
interface TraitSpecific2014 extends BaseTraitSpecific {
    breath_weapon?: BreathWeapon2014, 
}
interface TraitSpecific extends BaseTraitSpecific {
    breath_weapon?: BreathWeapon, 
}
// =
interface BaseBreathWeapon {
    name: string
    area_of_effect: AreaOfEffect
    usage: Usage
    damage: SpellDamage
}
interface BreathWeapon2014 extends BaseBreathWeapon {
    desc: string[]
    dc: DifficultyClass2014
}
export interface BreathWeapon extends BaseBreathWeapon {
    description: string[]
    dc: DifficultyClass
}
// =
interface DifficultyClass2014 {
    dc_type: APIReference
    success_type?: string
}

export interface Trait2014 extends BaseTrait {
    races: APIReference[]
    desc: string[]
    trait_specific?: TraitSpecific2014
}

export interface Trait extends BaseTrait {
    species: APIReference[]
    description: string[]
    trait_specific?: TraitSpecific
}