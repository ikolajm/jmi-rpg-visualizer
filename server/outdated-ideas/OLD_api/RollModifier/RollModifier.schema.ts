import { gql } from 'graphql-tag';

const RollModifierSchema = gql`
    type RollModifier {
        type: RollModifierType!
        source: String
    }
`;

export default RollModifierSchema;