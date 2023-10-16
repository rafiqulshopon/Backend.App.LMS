import gql from 'graphql-tag';

const bookSchema = gql`
  type Book {
    id: ID!
    title: String!
    author: String!
    category: String!
    department: String!
    description: String
    publishedDate: String
    isbn: String!
    totalQuantity: Int!
    currentQuantity: Int!
  }

  input AddBookInput {
    title: String!
    author: String!
    category: String!
    department: String!
    description: String
    publishedDate: String
    isbn: String!
    totalQuantity: Int!
  }

  input EditBookInput {
    id: ID!
    title: String
    author: String
    category: String
    department: String
    description: String
    publishedDate: String
    totalQuantity: Int
    currentQuantity: Int
  }

  input BookQueryInput {
    department: String
    author: String
    title: String
  }

  type BookResponse {
    success: Boolean!
    message: String
    book: Book
  }

  extend type Mutation {
    addBook(input: AddBookInput!): BookResponse!
    editBook(input: EditBookInput!): BookResponse!
  }

  extend type Query {
    books(input: BookQueryInput): [Book!]!
  }
`;

export default bookSchema;
