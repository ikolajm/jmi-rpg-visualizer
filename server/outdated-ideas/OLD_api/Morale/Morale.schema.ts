import { gql } from 'graphql-tag';

const MoraleSchema = gql`
    type Morale {
        threshold: Int
        current: Int
        fleeAtZero: Boolean
    }
`;

export default MoraleSchema;