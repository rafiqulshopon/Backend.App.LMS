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

  input EditProfileInput {
    address: String
    phoneNumber: String
    department: String
    batch: String
  }

  extend type Mutation {
    editProfile(input: EditProfileInput!): User!
  }

  extend type Query {
    allUsers(input: UserQueryInput): UserQueryResponse!
    myProfile: User!
  }
`;

export default userSchema;
