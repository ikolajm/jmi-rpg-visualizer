import { gql } from 'graphql-tag';

const ActionSchema = gql`
    type Action {
        id: ID!
        name: String!
        actionType: ActionType!
        cost: ActionCost!
        targeting: Targeting
        effect: ActionEffect!
        triggersOpportunityAttack: Boolean
    }
`;

export default ActionSchema;