import { gql } from 'graphql-tag';

const FeatSchema = gql`
    type Feat {
        id: ID!
        name: String!
        description: String!
    
        grantsActions: [ActionType!]
        modifiesRolls: Boolean
        affectsConcentration: Boolean
    }
`;

export default FeatSchema;