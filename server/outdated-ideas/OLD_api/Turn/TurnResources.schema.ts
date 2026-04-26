import { gql } from 'graphql-tag';

const TurnResourcesSchema = gql`
    type TurnResources {
        action: Boolean!
        bonusAction: Boolean!
        reaction: Boolean!
        movementRemaining: Int!
    }
`;

export default TurnResourcesSchema;