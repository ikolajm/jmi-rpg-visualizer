import { gql } from 'graphql-tag';

const InventorySchema = gql`
    type Inventory {
        items: [Item!]!
        equipped: [Item!]!
        gold: Int!
    }
`;

export default InventorySchema;