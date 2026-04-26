import { gql } from 'graphql-tag';

const AbilityScoreSchema = gql`
    type AbilityScore {
        strength: Int!
        dexterity: Int!
        constitution: Int!
        intelligence: Int!
        wisdom: Int!
        charisma: Int!
    }
`;

export default AbilityScoreSchema;