import gql from 'graphql-tag';

const userSchema = gql`
  type User {
    id: ID!
    email: String!
    name: UserName!
    department: String
    studentId: String
    batch: String
    dateOfBirth: String!
    phoneNumber: String!
    address: String
    role: String!
    isVerified: Boolean!
  }

  type UserName {
    first: String!
    last: String!
  }

  type UserQueryResponse {
    success: Boolean!
    message: String
    users: [User!]!
  }

  input UserQueryInput {
    studentId: String
    batch: String
    department: String
    email: String
    phoneNumber: String
    address: String
    isVerified: Boolean
    name: String
  }

  extend type Query {
    allUsers(input: UserQueryInput): UserQueryResponse!
  }
`;

export default userSchema;
