import { gql } from 'graphql-tag';

const ConcentrationSchema = gql`
    type Concentration {
        spell: Spell!
        startedAtRound: Int!
    }
`;

export default ConcentrationSchema;