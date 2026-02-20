import type { APIReference } from "./general.types.ts"

interface BaseLevel {
    index: string
    class: APIReference
    subclass?: APIReference
    level: number
    ability_score_bonuses: number
    features: APIReference[]
    class_specific: (BarbarianClassSpecificLevels | BardClassSpecificLevels | ClericClassSpecificLevels | DruidClassSpecificLevels | FighterClassSpecificLevels | MonkClassSpecificLevels | PaladinClassSpecificLevels | RangerClassSpecificLevels | RogueClassSpecificLevels | SorcererClassSpecificLevels | WarlockClassSpecificLevels | WizardClassSpecificLevels)
    spellcasting?: Spellcasting
    url: string
}

interface BarbarianClassSpecificLevels {
    rage_count: number
    rage_damage_dealt: number
    brutal_critical_dice: number
}
interface BardClassSpecificLevels {
    bardic_inspiration_die: number
    song_of_rest_die: number
    magical_secrets_max_5: number
    magical_secrets_max_7: number
    magical_secrets_max_9: number
}
interface ClericClassSpecificLevels {
    channel_divinity_charges: number
    destroy_undead_cr: number
}
interface DruidClassSpecificLevels {
    wild_shape_max_cr: number
    wild_shape_swim: boolean
    wild_shape_fly: boolean
}
interface FighterClassSpecificLevels {
    action_surges: number
    indomitable_uses: boolean
    extra_attacks: boolean
}
interface MonkClassSpecificLevels {
    martial_arts: MartialArts
    ki_points: number
    unarmored_movement: number
}
interface MartialArts {
    dice_count: number
    dice_value: number
}
interface PaladinClassSpecificLevels {
    aura_range: number
}
interface RangerClassSpecificLevels {
    favored_enemies: number
    favored_terrain: number
}
interface RogueClassSpecificLevels {
    sneak_attack: SneakAttack
}
interface SneakAttack {
    dice_count: number
    dice_value: number
}
interface SorcererClassSpecificLevels {
    sorcery_points: number
    metamagic_known: number
    creating_spell_slots: SpellSlotCreation[]
}
interface SpellSlotCreation {
    spell_slot_level: number
    sorcery_point_cost: number
}
interface WarlockClassSpecificLevels {
    invocations_known: number
    mystic_arcanum_level_6: number
    mystic_arcanum_level_7: number
    mystic_arcanum_level_8: number
    mystic_arcanum_level_9: number
}
interface WizardClassSpecificLevels {
    arcane_recovery_levels: number
}

interface Spellcasting {
    cantrips_known?: number
    spells_known: number
    spell_slots_level_1: number
    spell_slots_level_2?: number
    spell_slots_level_3?: number
    spell_slots_level_4?: number
    spell_slots_level_5?: number
    spell_slots_level_6?: number
    spell_slots_level_7?: number
    spell_slots_level_8?: number
    spell_slots_level_9?: number
}

export interface Level2014 extends BaseLevel {
    prof_bonus: number
}

export interface Level extends BaseLevel {
    proficiency_bonus: number
}
