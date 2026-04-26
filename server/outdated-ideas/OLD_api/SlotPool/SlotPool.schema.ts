import { gql } from 'graphql-tag';

const SlotPoolSchema = gql`
  type SlotPool {
    level: Int!
    current: Int!
    max: Int!
  }
`;

export default SlotPoolSchema;