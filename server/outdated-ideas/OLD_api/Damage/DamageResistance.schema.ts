import { gql } from 'graphql-tag';

const DamageResistanceSchema = gql`
    type DamageResistance {
        type: DamageType!
        modifier: ResistanceModifier!
    }
`;

export default DamageResistanceSchema;