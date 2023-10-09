import bookResolvers from './book.resolver.js';

const queryResolvers = {
  Query: {
    ...bookResolvers.Query,
  },
};

export default queryResolvers;
