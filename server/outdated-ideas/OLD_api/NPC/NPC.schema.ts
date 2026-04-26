import { gql } from 'graphql-tag';

const NPCSchema = gql`
    type NPC implements Entity & InventoryHolder & Combatant {
        id: ID!
        name: String!
        description: String

        inventory: [ItemStack!]!
        role: NPCRole

        # Combatant fields
        hitPoints: HitPoints!
        armorClass: Int!
        initiative: Int
        conditions: [Condition!]!
        lifeState: LifeState!
        actions: [Action!]!
    }
`;

export default NPCSchema;