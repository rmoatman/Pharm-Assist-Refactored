// ===========================================================================
// resolvers.js — the FUNCTIONS that fulfill each GraphQL query and mutation.
//
// typeDefs.js says WHAT operations exist; this file says HOW each one works.
// Every field name here must match a Query/Mutation defined in typeDefs.js.
//
// Every resolver function receives the same standard arguments from Apollo:
//   parent  -> the result from a parent resolver (not used here).
//   args    -> the arguments the client passed in (e.g. email, password).
//              Below we "destructure" args, pulling out just the fields we need.
//   context -> shared data for this request. Here it holds context.user, the
//              logged-in user (decoded from their JWT). If it's missing, the
//              request is NOT authenticated.
// ===========================================================================

// The Mongoose User model — lets us read/write user documents in MongoDB.
const { User } = require('../models');
// Apollo's built-in error types for clean, standardized error responses.
//   AuthenticationError -> use when the user isn't logged in / credentials fail.
//   UserInputError      -> use when the user's input is invalid (e.g. dup email).
const { AuthenticationError, UserInputError } = require('apollo-server-express');
// Helper that creates a signed JWT for a user (so they stay logged in).
const { signToken } = require('../utils/auth');

const resolvers = {
  // ---- Query resolvers (read operations) ----
  Query:{
    // me: returns the currently logged-in user's account.
    // args: none. Relies on context.user (set from the request's token).
    me: async (parent, args, context) => {
      // Only works if a valid token was sent (context.user exists).
      if (context.user){
        // Look up and return that user's full record from the database.
        return User.findOne({_id:context.user._id})
      }
      // No valid token -> block the request with an auth error.
      throw new AuthenticationError('You need to be logged in!');
    }
  },

  // ---- Mutation resolvers (operations that change data) ----
  Mutation: {
    // addUser: create a brand-new account and log the person in immediately.
    // args: firstName, lastName, username, email, password (all required).
    // Returns { token, user } which matches the Auth type in typeDefs.
    addUser: async (parent, { firstName, lastName, username, email, password }) => {
      try {
        // Create the user document in MongoDB (password gets hashed by the model).
        const user = await User.create({ firstName, lastName, username, email, password });
        // Generate a JWT so the new user is signed in right away.
        const token = signToken(user);

        // Hand back the token + the new user (the Auth shape).
        return { token, user };
      } catch (err) {
        // MongoDB error code 11000 = "duplicate key". Here it means the email
        // is already taken. We turn that into a friendly, readable message
        // instead of leaking a raw database error to the client.
        if (err.code === 11000) {
          throw new UserInputError('An account with this email already exists.');
        }
        // Any other unexpected error -> re-throw it as-is.
        throw err;
      }
    },
    // login: sign an EXISTING user in using their email + password.
    // args: email, password (both required). Returns { token, user } (Auth).
    login: async (parent, { email, password }) => {
      // Find the account that matches the given email.
      const user = await User.findOne({ email });

      // No matching account -> reject with an auth error.
      if (!user) {
        throw new AuthenticationError('No user with this email found!');
      }

      // isCorrectPassword is a method defined on the User document (in the
      // Mongoose model). It compares the plain-text password to the stored
      // hashed one and returns true/false.
      const correctPw = await user.isCorrectPassword(password);

      // Password didn't match -> reject with an auth error.
      if (!correctPw) {
        throw new AuthenticationError('Incorrect password!');
      }

      // Credentials are good -> issue a token and return it with the user.
      const token = signToken(user);
      return { token, user };
    },
    // addMed: add a medicine to a specific user's medList.
    // args: userId, title (required) plus optional time-of-day Booleans.
    // Returns the updated user document.
    addMed: async (parent, { userId, title, morning, afternoon, evening, night, as_needed }, context) => {
      // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in
      if (context.user) {
        // Find the target user and add the new medicine to their medList.
        return User.findOneAndUpdate(
          { _id: userId }, // which user to update (by their ID).
          {
            // $addToSet adds the medicine to the medList array only if it isn't
            // already present (avoids exact-duplicate entries).
            $addToSet: { medList: { title, morning, afternoon, evening, night, as_needed } },
          },
          {
            new: true,          // return the UPDATED document, not the old one.
            runValidators: true, // enforce the schema's validation rules on save.
          }
        );
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw new AuthenticationError('You need to be logged in!');
    },
    // removeMed: remove a medicine (by its title) from the logged-in user's medList.
    // args: title (required). Uses context.user to know whose list to edit.
    // Returns the updated user document.
    removeMed: async (parent, { title }, context) => {
      // Must be logged in to edit your own medicine list.
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },          // update the currently logged-in user.
          { $pull: { medList: { title } } },  // $pull removes any medList item with this title.
          { new: true }                       // return the UPDATED document.
        );
      }
      // Not logged in -> block the request.
      throw new AuthenticationError('You need to be logged in!');
    },
  }
};

// Export the resolvers so index.js can bundle them with the typeDefs.
module.exports = resolvers;
