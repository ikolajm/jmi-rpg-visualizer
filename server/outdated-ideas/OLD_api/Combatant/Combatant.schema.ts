import { gql } from 'graphql-tag';

const CombatantSchema = gql`
    type Combatant {
        id: ID!
        entityId: ID!
        entityType: CombatantType!

        displayName: String!

        armorClass: Int!
        hitPoints: HitPoints!
        conditions: [ConditionInstance!]!
        conditionImmunities: [ConditionImmunity!]
        conditionResistances: [ConditionResistance!]
        damageResistance: [DamageResistance]
        lifeStatus: LifeStatus!

        deathSaves: DeathSaves
        savingThrows: [SavingThrow!]!
        rollModifiers: [RollModifier!]!

        concentration: Concentration

        turnResources: TurnResources
    }
`;

export default CombatantSchema;