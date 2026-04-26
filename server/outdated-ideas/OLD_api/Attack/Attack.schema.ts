import { gql } from 'graphql-tag';

const AttackSchema = gql`
    type Attack {
        id: ID!
        name: String!

        toHitBonus: Int!
        reach: String

        damage: Damage!

        appliesConditions: [ConditionApplication!]
    }
`;

export default AttackSchema;