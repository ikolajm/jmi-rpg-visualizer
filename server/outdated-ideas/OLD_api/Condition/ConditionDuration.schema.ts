import { gql } from 'graphql-tag';

const ConditionDurationSchema = gql`
    type ConditionDuration {
        id: ID!
        type: DurationType!
        roundsRemaining: Int
        untilTurnEndOf: ID
    }
`;

export default ConditionDurationSchema;