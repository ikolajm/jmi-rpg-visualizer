import { gql } from 'graphql-tag';

const ConditionResistanceSchema = gql`
    type ConditionResistance {
        condition: ID!
        advantageOnSaves: Boolean
    }
`;

export default ConditionResistanceSchema;