import { GraphQLError } from 'graphql';
import User from '../models/user.model.js';

const userResolvers = {
  Mutation: {
    editProfile: async (_, { input }, context) => {
      if (!context.userId) {
        throw new GraphQLError('Authentication failed. Please log in.');
      }

      try {
        const updates = {};

        if (input.address) updates.address = input.address;
        if (input.phoneNumber) updates.phoneNumber = input.phoneNumber;
        if (input.department) updates.department = input.department;
        if (input.batch) updates.batch = input.batch;

        const user = await User.findByIdAndUpdate(context.userId, updates, {
          new: true,
        }).select('-password');

        if (!user) {
          throw new GraphQLError('User not found.');
        }

        return user;
      } catch (error) {
        throw new Error('Failed to update user profile.');
      }
    },
  },

  Query: {
    allUsers: async (_, { input }, context) => {
      if (!context.userId || context.role !== 'admin') {
        throw new GraphQLError('Not authorized', {
          extensions: {
            code: 'UNAUTHORIZED',
          },
        });
      }

      try {
        const query = {};

        if (input) {
          if (input.studentId)
            query['studentId'] = { $regex: input.studentId, $options: 'i' };
          if (input.batch)
            query['batch'] = { $regex: input.batch, $options: 'i' };
          if (input.department)
            query['department'] = { $regex: input.department, $options: 'i' };
          if (input.email)
            query['email'] = { $regex: input.email, $options: 'i' };
          if (input.phoneNumber)
            query['phoneNumber'] = { $regex: input.phoneNumber, $options: 'i' };
          if (input.address)
            query['address'] = { $regex: input.address, $options: 'i' };
          if (input.isVerified !== undefined && input.isVerified !== null)
            query['isVerified'] = input.isVerified;
          if (input.name)
            query['name.first'] = { $regex: input.name, $options: 'i' };
          if (input.name)
            query['name.last'] = { $regex: input.name, $options: 'i' };
        }

        const users = await User.find(query);

        return {
          users,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
          users: [],
        };
      }
    },
    myProfile: async (_, args, context) => {
      if (!context.userId) {
        throw new GraphQLError('Authentication failed. Please log in.');
      }

      try {
        const user = await User.findById(context.userId).select('-password');

        if (!user) {
          throw new GraphQLError('User not found.');
        }

        return user;
      } catch (error) {
        throw new Error('Failed to fetch user profile.');
      }
    },
  },
};

export default userResolvers;
