

import { gql } from 'graphql-tag';

const SpellcastingProgressionSchema = gql`
  type SpellcastingProgression {
    slotTable: [SpellSlotLevel!]!
    cantripsKnownByLevel: [Int!]
    spellsKnownByLevel: [Int!]
  }
`;

export default SpellcastingProgressionSchema;