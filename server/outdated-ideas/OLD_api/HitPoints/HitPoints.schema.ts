import { gql } from 'graphql-tag';

const HitPointsSchema = gql`
    type HitPoints {
        current: Int!
        max: Int!
        temporary: Int!
    }
`;

export default HitPointsSchema;