import { gql } from 'graphql-tag';

const ActionAvailabilitySchema = gql`
    type ActionAvailability {
        actionAvailable: Boolean!
        bonusAvailable: Boolean!
        reactionAvailable: Boolean!
    }
`;

export default ActionAvailabilitySchema;