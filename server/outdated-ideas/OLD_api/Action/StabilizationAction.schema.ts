import { gql } from 'graphql-tag';

const StabilizationActionSchema = gql`
    type StabilizationAction {
        dc: Int!
        successEffect: ActionEffect!
        failureEffect: ActionEffect
    }
`;

export default StabilizationActionSchema;