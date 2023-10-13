import gql from 'graphql-tag';

const bookSchema = gql`
  type Book {
    id: ID!
    title: String!
    authorId: ID!
    categoryId: ID!
    description: String
    publishedDate: String
    isbn: String!
  }

  input AddBookInput {
    title: String!
    authorId: ID!
    categoryId: ID!
    description: String
    publishedDate: String
    isbn: String!
  }

  type BookResponse {
    success: Boolean!
    message: String
    book: Book
  }

  extend type Mutation {
    addBook(input: AddBookInput!): BookResponse!
  }

  extend type Query {
    books: [Book!]!
  }
`;

export default bookSchema;
