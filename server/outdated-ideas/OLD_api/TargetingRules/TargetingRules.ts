import { gql } from 'graphql-tag';

const EnemySchema = gql`
    type TargetingRules {
        priorities: [TargetPriority!]!
    }
`;

export default EnemySchema;