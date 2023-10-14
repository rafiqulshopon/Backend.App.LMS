import { GraphQLError } from 'graphql';
import Book from '../models/book.model.js';

const bookResolvers = {
  Query: {
    books: async (_, { input }, context) => {
      if (!context.userId) {
        throw new GraphQLError('Authentication failed. Please log in.', {
          extensions: {
            code: 'AUTHENTICATION_FAILED',
          },
        });
      }

      try {
        const query = {};
        if (input?.department) query.department = input.department;
        if (input?.author) query.author = input.author;
        if (input?.title) query.title = input.title;

        const books = await Book.find(query);
        return books;
      } catch (error) {
        throw new Error('Failed to fetch books');
      }
    },
  },
  Mutation: {
    addBook: async (_, { input }, context) => {
      if (
        !context.userId &&
        (context.role !== 'admin' || context.role !== 'librarian')
      ) {
        throw new GraphQLError('Not authorized', {
          extensions: {
            code: 'UNAUTHORIZED',
          },
        });
      }

      try {
        const newBook = new Book(input);
        const savedBook = await newBook.save();

        return {
          success: true,
          message: 'Book added successfully',
          book: savedBook,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
  },
};

export default bookResolvers;
