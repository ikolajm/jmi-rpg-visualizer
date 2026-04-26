import { gql } from 'graphql-tag';

const DeathSavesSchema = gql`
    type DeathSaves {
        successes: Int! # 0-3
        failures: Int!  # 0-3
    }
`;

export default DeathSavesSchema;