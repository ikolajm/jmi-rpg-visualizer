import type { APIReference, OptionSelection, OptionSelection2014 } from "./general.types.ts"

interface BaseClass {
    index: string
    name: string
    hit_die: number
    proficiencies: APIReference[]
    saving_throws: APIReference[]
    starting_equipment: EquipmentItem[]
    class_levels: string
    subclasses: APIReference[]
    url: string
}

interface ProficiencyChoiceSelection2014 extends OptionSelection2014 {}
interface ProficiencyChoiceSelection extends OptionSelection {}
// =
interface EquipmentItem {
    equipment: APIReference
    quantity: number
}
// =
interface StartingEquipmentOption2014 extends OptionSelection2014 {}
interface StartingEquipmentOption extends OptionSelection {}
//= 
interface BaseSpellcasting {
    level: number
    spellcasting_ability: APIReference
    spells: string
    url: string
}
interface Spellcasting2014 extends BaseSpellcasting {
    info: InfoBlock2014[]
}
interface InfoBlock2014 {
    name: string
    desc: string[]
}
interface Spellcasting extends BaseSpellcasting {
    info: InfoBlock[]
}
interface InfoBlock {
    name: string
    description: string[]
}

export interface Class2014 extends BaseClass {
    proficiency_choices: ProficiencyChoiceSelection2014[]
    spellcasting?: Spellcasting2014
    starting_equipment_options: StartingEquipmentOption2014[]
}
export interface Class extends BaseClass { // Here
    proficiency_choices: ProficiencyChoiceSelection[]
    spellcasting?: Spellcasting
    starting_equipment_options: StartingEquipmentOption[]
}