import gql from 'graphql-tag';

const mutationTypeDefs = gql`
  type Mutation {
    addBook(input: AddBookInput!): BookResponse!
  }
`;

export default mutationTypeDefs;
