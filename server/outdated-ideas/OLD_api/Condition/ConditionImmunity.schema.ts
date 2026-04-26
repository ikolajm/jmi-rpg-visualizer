import { gql } from 'graphql-tag';

const ConditionImmunitySchema = gql`
    type ConditionImmunity {
        condition: Condition!
    }
`;

export default ConditionImmunitySchema;