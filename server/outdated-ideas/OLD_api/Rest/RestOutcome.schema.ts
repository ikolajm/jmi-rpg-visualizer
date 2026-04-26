import { gql } from 'graphql-tag';

const RestOutcomeSchema = gql`
    type RestOutcome {
        restoreHP: Boolean
        restoreSpellSlots: Boolean
        removeConditions: [ID!]
    }
`;

export default RestOutcomeSchema;