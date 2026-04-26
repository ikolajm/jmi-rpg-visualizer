import { gql } from 'graphql-tag';

const EncounterSchema = gql`
    type Encounter {
        id: ID!
        round: Int!
        initiativeOrder: [ID!]!
        activeTurn: ID!
        combatants: [Combatant!]!
        state: EncounterState!
    }
`;

export default EncounterSchema;