import { gql } from 'graphql-tag';

const GMNoteSchema = gql`
    type GMNote {
        message: String!
    }
`;

export default GMNoteSchema;