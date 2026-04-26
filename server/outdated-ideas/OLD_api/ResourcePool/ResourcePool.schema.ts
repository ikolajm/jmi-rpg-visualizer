import { gql } from 'graphql-tag';

const ResourcePoolSchema = gql`
    type ResourcePool {
        name: String!
        max: Int!
        remaining: Int!
        refresh: ResourceRefresh!
    }
`;

export default ResourcePoolSchema;