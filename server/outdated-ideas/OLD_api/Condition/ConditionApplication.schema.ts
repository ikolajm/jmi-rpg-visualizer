import { gql } from 'graphql-tag';

const DamageSchema = gql`
    type ConditionApplication {
        condition: Condition!
        duration: ConditionDuration!
        save: SavingThrow
    }
`;

export default DamageSchema;