import { gql } from 'graphql-tag';

const TraitSchema = gql`
    type Trait {
        id: ID!
        name: String!
        description: String
    }
`;

export default TraitSchema;