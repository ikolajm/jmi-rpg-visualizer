import { gql } from 'graphql-tag';

const SubraceSchema = gql`
    type Subrace {
        id: ID!
        name: String!
        parentRace: Race!
        traits: [Trait!]
    }
`;

export default SubraceSchema;