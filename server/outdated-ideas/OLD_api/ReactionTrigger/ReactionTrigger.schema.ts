import { gql } from 'graphql-tag';

const ReactionTriggerSchema = gql`
    type ReactionTrigger {
        description: String!
    }
`;

export default ReactionTriggerSchema;