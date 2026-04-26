import { gql } from 'graphql-tag';

const BossPhaseSchema = gql`
    type BossPhase {
        id: ID!
        triggerHPPercent: Int
        effects: [ActionEffect!]
    }
`;

export default BossPhaseSchema;