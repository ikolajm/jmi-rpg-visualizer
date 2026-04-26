import { gql } from 'graphql-tag';

const CombatantInterface = gql`
    interface Combatant implements Entity {
        id: ID!
        name: String!
        hitPoints: HitPoints!
        armorClass: Int!
        initiative: Int
        conditions: [Condition!]!
        lifeState: LifeState!
        actions: [Action!]!
    }
`;

export default CombatantInterface;