import { gql } from 'graphql-tag';

const SavingThrowSchema = gql`
    type SavingThrow {
        ability: Ability!
        dc: Int!
        onFail: ActionEffect!
        onSuccess: ActionEffect
    }
`;

export default SavingThrowSchema;