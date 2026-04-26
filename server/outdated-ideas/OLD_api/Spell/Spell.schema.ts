import { gql } from 'graphql-tag';

const SpellSchema = gql`
  type Spell {
    id: ID!
    name: String!
    level: Int!
    school: String!
  
    castingTime: String!
    range: String!
    duration: String!
  
    description: String!
  }
`;

export default SpellSchema;