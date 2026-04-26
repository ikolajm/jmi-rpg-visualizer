import { gql } from 'graphql-tag';

const DurationSchema = gql`
    type Duration {
        rounds: Int
        untilEndOfTurn: Boolean
    }
`;

export default DurationSchema;