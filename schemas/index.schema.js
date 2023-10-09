import gql from 'graphql-tag';
import queryTypeDefs from './queries.schema.js';
import mutationTypeDefs from './mutations.schema.js';
import bookSchema from './book.schema.js';

const rootTypeDefs = gql`
  type Root {
    _empty: String # This is just a placeholder, can be anything
  }
`;

const typeDefs = [rootTypeDefs, queryTypeDefs, mutationTypeDefs, bookSchema];

export default typeDefs;
