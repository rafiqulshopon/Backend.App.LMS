import bookResolvers from './book.resolver.js';
import userResolvers from './user.resolver.js';

const mutationResolvers = {
  Mutation: {
    ...bookResolvers.Mutation,
    ...userResolvers.Mutation,
  },
};

export default mutationResolvers;
