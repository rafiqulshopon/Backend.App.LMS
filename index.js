import express from 'express';
import http from 'http';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import typeDefs from './schemas/index.schema.js';
import resolvers from './resolvers/index.resolver.js';
import authRoutes from './auth/auth.routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);

const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  introspection: true,
  playground: true,
});

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGODB_URL;
const API_URL = process.env.API_URL;
const SECRET_KEY = process.env.JWT_SECRET;

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB..');

    await server.start();
    app.use(
      '/graphql',
      expressMiddleware(server, {
        context: async ({ req }) => {
          const token =
            req.headers.authorization &&
            req.headers.authorization.split('Bearer ')[1];
          let userId = null;

          if (token) {
            try {
              const decodedToken = jwt.verify(token, SECRET_KEY);
              userId = decodedToken.id;
            } catch (err) {
              throw new Error('Invalid token');
            }
          }

          return { userId };
        },
      })
    );

    httpServer.listen(PORT, () => {
      console.log(`🚀 GraphQL server ready at ${API_URL}/graphql`);
      console.log(`REST server ready at ${API_URL}/auth`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
