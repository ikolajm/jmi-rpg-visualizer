import { gql } from 'graphql-tag';

const InitiativeEntrySchema = gql`
    type InitiativeEntry {
        combatantId: ID!
        roll: Int!
        modifier: Int!
        total: Int!
    }
`;

export default InitiativeEntrySchema;