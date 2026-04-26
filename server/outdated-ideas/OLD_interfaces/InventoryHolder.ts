import { gql } from 'graphql-tag';

const InventoryHolderInterface = gql`
    interface InventoryHolder {
        inventory: [ItemStack!]!
    }
`;

export default InventoryHolderInterface;