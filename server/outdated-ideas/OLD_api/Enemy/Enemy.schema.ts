import { gql } from 'graphql-tag';

const EnemySchema = gql`
    type Enemy implements Entity & Combatant {
        id: ID!
        name: String!
        description: String

        hitPoints: HitPoints!
        armorClass: Int!
        initiative: Int
        conditions: [Condition!]!
        lifeState: LifeState!
        actions: [Action!]!

        creatureType: CreatureType!
        challengeRating: Float
        legendaryActions: [LegendaryAction!]
    }
`;

export default EnemySchema;