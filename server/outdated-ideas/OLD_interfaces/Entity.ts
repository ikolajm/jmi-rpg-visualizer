import { gql } from 'graphql-tag';

const EntityInterface = gql`
    interface Entity {
        id: ID!
        name: String!
        description: String
    }
`;

export default EntityInterface;