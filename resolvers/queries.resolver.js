import bookResolvers from './book.resolver.js';
import userResolvers from './user.resolver.js';

const queryResolvers = {
  Query: {
    ...bookResolvers.Query,
    ...userResolvers.Query,
  },
};

export default queryResolvers;
