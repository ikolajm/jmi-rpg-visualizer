import { gql } from 'graphql-tag';

const ActionInterface = gql`
    interface Action {
        id: ID!
        name: String!
        actionType: ActionType!
        description: String
        cost: ActionCost!
    }
`;

export default ActionInterface;