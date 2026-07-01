const { gql } = require('apollo-server-express');

const typeDefs = gql`
type medicine {
   _id: ID!
   title: String!
   morning: Boolean
   afternoon: Boolean
   evening: Boolean
   night: Boolean
   as_needed: Boolean
}

 type user {
   _id: ID!
   username: String!
   email: String!
   medList: [medicine]
}
type Auth {
  token: ID!
  user: user
}
type Query {
  users: [user]!
  user(userId: ID!): user
  me: user
}

type Mutation {
  addUser(firstName: String!, lastName: String!, username: String!, email: String!, password: String!): Auth
  login(email: String!, password: String!): Auth
  addMed(userId: ID!, title: String!, morning: Boolean, afternoon: Boolean, evening: Boolean, night: Boolean, as_needed: Boolean): user
  removeMed(title: String!): user
}
`;

module.exports = typeDefs;
