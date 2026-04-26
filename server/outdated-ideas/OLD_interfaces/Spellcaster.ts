import { gql } from 'graphql-tag';

const SpellcasterInterface = gql`
    interface Spellcaster {
        spellcastingAbility: Ability!
        spellSaveDC: Int!
        spellAttackBonus: Int!
        spellSlots: SpellSlots!
        preparedSpells: [Spell!]
        knownSpells: [Spell!]
        knownCantrips: [Spell!]!
    }
`;

export default SpellcasterInterface;