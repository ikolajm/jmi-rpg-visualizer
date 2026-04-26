import { gql } from 'graphql-tag';

const DeathRulesSchema = gql`
    type DeathRules {
        instantDeathThreshold: Int!
    }
`;

export default DeathRulesSchema;