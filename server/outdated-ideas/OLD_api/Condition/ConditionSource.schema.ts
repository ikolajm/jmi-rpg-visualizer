import { gql } from 'graphql-tag';

const ConditionSourceSchema = gql`
    type ConditionSource {
        name: String!
        entityId: ID
        attackName: String
    }
`;

export default ConditionSourceSchema;