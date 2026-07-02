// ===========================================================================
// typeDefs.js — the SCHEMA (the "shape") of our GraphQL API.
//
// This file describes WHAT data exists and WHAT operations clients can run.
// It does NOT contain the logic that fetches data — that lives in resolvers.js.
//
// The schema is written in GraphQL's own language called SDL (Schema
// Definition Language). It goes inside the gql`...` template literal below.
//
// Quick GraphQL symbol cheat-sheet (used all over this file):
//   !      -> "non-null": this value is REQUIRED and can never be null.
//   [ ]    -> "list": an array of that type, e.g. [medicine] is many medicines.
//   Name:  -> a field name followed by its type, e.g. title: String!
//   type   -> defines an object type (a group of related fields).
//   Query  -> the read operations clients can request.
//   Mutation -> the write operations (create/update/delete) clients can run.
//
// IMPORTANT: inside the gql`...` string below, comments use the # character
// (that is GraphQL's comment marker), NOT // like in normal JavaScript.
// ===========================================================================

// gql is a helper from Apollo that parses the schema string into a format
// Apollo Server understands.
const { gql } = require('apollo-server-express');

// Everything between the backticks is our GraphQL schema written in SDL.
const typeDefs = gql`
# ---- The "medicine" type ----
# Represents a single medication entry that belongs to a user's medicine list.
type medicine {
   _id: ID!            # Unique ID for this medicine. ID! = required unique identifier.
   title: String!      # The medicine's name. String! = required text.
   morning: Boolean    # Take it in the morning? true/false (optional, may be null).
   afternoon: Boolean  # Take it in the afternoon? true/false (optional).
   evening: Boolean    # Take it in the evening? true/false (optional).
   night: Boolean      # Take it at night? true/false (optional).
   as_needed: Boolean  # Take only "as needed"? true/false (optional).
}

# ---- The "user" type ----
# Represents an account holder in the app.
 type user {
   _id: ID!               # Unique ID for this user (required).
   username: String!      # The user's chosen username (required text).
   email: String!         # The user's email address (required text).
   medList: [medicine]    # This user's list of medicines. [medicine] = an array
                          # of medicine objects (can be empty or null).
}

# ---- The "Auth" type ----
# Returned after signing up or logging in. Bundles a login token with the user.
type Auth {
  token: ID!   # The JWT (JSON Web Token) the client stores to stay logged in (required).
  user: user   # The user account that just authenticated.
}

# ---- Queries (read-only operations) ----
# These are the "questions" a client can ask the API.
type Query {
  users: [user]!                # Get ALL users. [user]! = the list itself is
                                # required (never null), though it could be empty.
  user(userId: ID!): user       # Get ONE user by their ID. userId is a required
                                # argument; returns that single user (or null).
  me: user                      # Get the CURRENTLY logged-in user (based on the
                                # token sent with the request). Returns that user.
}

# ---- Mutations (operations that change data) ----
# These are the "actions" a client can perform (create/update/delete).
type Mutation {
  # Create a new account. All five arguments are required (String!).
  # Returns an Auth object (token + user) so the new user is logged in right away.
  addUser(firstName: String!, lastName: String!, username: String!, email: String!, password: String!): Auth

  # Log an existing user in using email + password (both required).
  # Returns an Auth object (token + user) on success.
  login(email: String!, password: String!): Auth

  # Add a medicine to a specific user's medList.
  # userId and title are required; the time-of-day flags are optional Booleans.
  # Returns the updated user (with the new medicine included).
  addMed(userId: ID!, title: String!, morning: Boolean, afternoon: Boolean, evening: Boolean, night: Boolean, as_needed: Boolean): user

  # Remove a medicine (matched by its title) from the logged-in user's medList.
  # Returns the updated user (with that medicine removed).
  removeMed(title: String!): user
}
`;

// Export the schema so index.js can bundle it with the resolvers.
module.exports = typeDefs;
