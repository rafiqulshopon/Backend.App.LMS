import Book from '../models/book.model.js';

const bookResolvers = {
  Query: {
    books: async () => {
      try {
        const books = await Book.find({});
        return books;
      } catch (error) {
        throw new Error('Failed to fetch books');
      }
    },
  },
  Mutation: {
    addBook: async (_, { input }) => {
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
