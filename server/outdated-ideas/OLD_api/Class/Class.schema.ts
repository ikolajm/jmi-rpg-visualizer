import { gql } from 'graphql-tag';

const ClassSchema = gql`
  type Class {
    id: ID!
    name: String!
    hitDie: Int!

    primaryAbility: AbilityScore
    savingThrows: [AbilityScore!]!

    spellcastingProgression: SpellcastingProgression
    features: [ClassFeature!]!
  }
`;

export default ClassSchema;