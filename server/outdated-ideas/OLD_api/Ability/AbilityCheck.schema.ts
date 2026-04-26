import { gql } from 'graphql-tag';

const AbilityCheckSchema = gql`
    type AbilityCheck {
        ability: Ability!
        proficient: Boolean!
        modifier: Int!
    }
`;

export default AbilityCheckSchema;