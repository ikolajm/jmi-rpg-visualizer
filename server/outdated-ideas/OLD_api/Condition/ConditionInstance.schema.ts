import { gql } from 'graphql-tag';

const ConditionInstanceSchema = gql`
    type ConditionInstance {
        id: ID!
        condition: Condition!

        source: ConditionSource
        duration: ConditionDuration!

        appliedAtRound: Int
    }
`;

export default ConditionInstanceSchema;