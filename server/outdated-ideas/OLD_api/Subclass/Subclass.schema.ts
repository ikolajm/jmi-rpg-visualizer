import { gql } from 'graphql-tag';

const SubclassSchema = gql`
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

export default SubclassSchema;