import queryResolvers from './queries.resolver.js';
import mutationResolvers from './mutations.resolver.js';

const resolvers = {
  ...queryResolvers,
  ...mutationResolvers,
};

export default resolvers;
