import { gql } from 'graphql-tag';

const EffectInterface = gql`
    interface Effect implements Entity {
        id: ID!
        name: String!
        duration: Duration
        source: Entity
    }
`;

export default EffectInterface;