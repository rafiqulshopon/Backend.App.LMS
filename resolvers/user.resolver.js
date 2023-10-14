import { GraphQLError } from 'graphql';
import User from '../models/user.model.js';

const userResolvers = {
  Query: {
    allUsers: async (_, { input }, context) => {
      if (
        !context.userId ||
        context.role !== 'admin' ||
        context.role !== 'librarian'
      ) {
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
          success: true,
          message: 'Users fetched successfully',
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
  },
  User: {
    name: (parent) => {
      return {
        first: parent.name.first,
        last: parent.name.last,
      };
    },
  },
};

export default userResolvers;
