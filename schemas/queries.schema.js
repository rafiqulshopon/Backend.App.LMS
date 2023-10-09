import gql from 'graphql-tag';

const queryTypeDefs = gql`
  type Query {
    books: [Book!]!
  }
`;

export default queryTypeDefs;
