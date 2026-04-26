import { gql } from 'graphql-tag';

const ItemStackSchema = gql`
    type ItemStack {
        item: Item!
        quantity: Int!
    }
`;

export default ItemStackSchema;