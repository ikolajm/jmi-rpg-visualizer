import { gql } from 'graphql-tag';

const ConditionEffectSchema = gql`
    type ConditionEffect {
        stat: String
        modifier: String
        value: Int
        description: String
    }
`;

export default ConditionEffectSchema;