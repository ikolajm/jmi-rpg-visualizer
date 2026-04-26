import { gql } from 'graphql-tag';

const RaceSchema = gql`
  type Race {
    id: ID!
    name: String!
    size: String
    speed: Int
    languages: [String!]
    traits: [Trait!]
  }
`;

export default RaceSchema;