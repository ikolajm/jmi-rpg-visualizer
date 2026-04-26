import { gql } from 'graphql-tag';

const DamageSchema = gql`
    type Damage {
        dice: String!
        type: String!
    }
`;

export default DamageSchema;