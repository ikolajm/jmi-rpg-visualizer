import { gql } from 'graphql-tag';

const PlayerCharacterSchema = gql`
  type PlayerCharacter implements Entity & Combatant & InventoryHolder & Spellcaster {
    id: ID!
    name: String!
    description: String

    hitPoints: HitPoints!
    armorClass: Int!
    initiative: Int
    conditions: [Condition!]!
    lifeState: LifeState!
    actions: [Action!]!

    inventory: [ItemStack!]!

    level: Int!
    class: Class!
    race: Race!
    abilityScores: AbilityScores!
    feats: [Feat!]!
  }
`;

export default PlayerCharacterSchema;