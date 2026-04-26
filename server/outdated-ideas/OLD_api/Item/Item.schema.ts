import { gql } from 'graphql-tag';

const ActionSchema = gql`
    type Item implements Entity {
        id: ID!
        name: String!
        description: String
        itemType: ItemType!
        consumable: Boolean!
        charges: Int
        action: Action
    }
`;

export default ActionSchema;