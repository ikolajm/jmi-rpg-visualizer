import { gql } from 'graphql-tag';

const SpellcastingSchema = gql`
  type Spellcasting {
    ability: Ability!
    spellSaveDC: Int!
    spellAttackBonus: Int!
    spellSlots: [SpellSlot!]!
    knownSpells: [Spell!]!
    preparedSpells: [Spell!]
    cantrips: [Spell!]!
  }
`;

export default SpellcastingSchema;