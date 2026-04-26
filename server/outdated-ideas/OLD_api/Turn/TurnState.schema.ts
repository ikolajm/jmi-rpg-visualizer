import { gql } from 'graphql-tag';

const TurnStateSchema = gql`
    type TurnState {
        round: Int!
        activeCombatantId: ID!
        turnIndex: Int!
    }
`;

export default TurnStateSchema;