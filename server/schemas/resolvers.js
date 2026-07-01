const { User } = require('../models');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const resolvers = {
  Query:{
    me: async (parent, args, context) => {
      if (context.user){
        return User.findOne({_id:context.user._id})
      } 
      throw new AuthenticationError('You need to be logged in!');
    }
  },

  Mutation: {
    addUser: async (parent, { firstName, lastName, username, email, password }) => {
      try {
        const user = await User.create({ firstName, lastName, username, email, password });
        const token = signToken(user);

        return { token, user };
      } catch (err) {
        if (err.code === 11000) {
          throw new UserInputError('An account with this email already exists.');
        }
        throw err;
      }
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user with this email found!');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect password!');
      }

      const token = signToken(user);
      return { token, user };
    },
    addMed: async (parent, { userId, title, morning, afternoon, evening, night, as_needed }, context) => {
      // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: userId },
          {
            $addToSet: { medList: { title, morning, afternoon, evening, night, as_needed } },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw new AuthenticationError('You need to be logged in!');
    },
    removeMed: async (parent, { title }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { medList: { title } } },
          { new: true }
        );
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  }
};

module.exports = resolvers;
