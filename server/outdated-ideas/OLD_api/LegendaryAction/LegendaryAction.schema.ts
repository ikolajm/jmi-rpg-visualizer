import { gql } from 'graphql-tag';

const LegendaryActionSchema = gql`
    type LegendaryAction {
        id: ID!
        name: String!
        description: String!
        cost: Int!
    }
`;

export default LegendaryActionSchema;