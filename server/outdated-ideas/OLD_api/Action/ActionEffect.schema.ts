import { gql } from 'graphql-tag';

const ActionEffectSchema = gql`
    type ActionEffect {
        type: EffectType!
        damage: Dice
        healing: Dice
        condition: Condition
        savingThrow: SavingThrow
    }
`;

export default ActionEffectSchema;