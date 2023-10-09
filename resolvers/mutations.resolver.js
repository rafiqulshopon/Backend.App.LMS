import bookResolvers from './book.resolver.js';

const mutationResolvers = {
  Mutation: {
    ...bookResolvers.Mutation,
  },
};

export default mutationResolvers;
