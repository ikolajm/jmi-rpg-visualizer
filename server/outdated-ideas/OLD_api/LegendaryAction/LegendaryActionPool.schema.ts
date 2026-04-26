import { gql } from 'graphql-tag';

const LegendaryActionPoolSchema = gql`
    type LegendaryActionPool {
        current: Int!
        max: Int!
        allowedAfterTurnTypes: [CombatantType!]!
    }
`;

export default LegendaryActionPoolSchema;