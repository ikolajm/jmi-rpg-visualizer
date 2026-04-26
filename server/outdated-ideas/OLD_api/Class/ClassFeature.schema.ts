import { gql } from 'graphql-tag'

const ClassFeatureSchema = gql`
  type ClassFeature {
    id: ID!
    name: String!
    description: String
    levelRequirement: Int!
  }
`;

export default ClassFeatureSchema;