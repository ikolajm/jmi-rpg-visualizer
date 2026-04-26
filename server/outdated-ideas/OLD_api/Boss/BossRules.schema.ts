import { gql } from 'graphql-tag';

const BossRulesSchema = gql`
    type BossRules {
        maxLegendaryPerRound: Int
        phases: [BossPhase!]
    }
`;

export default BossRulesSchema;