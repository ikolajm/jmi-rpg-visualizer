import { gql } from 'graphql-tag';

const ConditionSchema = gql`
    type Condition implements Effect & Entity {
        id: ID!
        name: String!
        description: String
        source: String
        duration: ConditionDuration!
        effects: [ConditionEffect!]!
        stackingRule: StackingRule!
    }
`;

export default ConditionSchema;