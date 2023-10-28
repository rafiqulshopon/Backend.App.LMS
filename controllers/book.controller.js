import express from 'express';
import Book from '../models/book.model.js';

const router = express.Router();
const allowedRoles = ['admin', 'librarian'];

// Fetch all books
router.get('/books', async (req, res) => {
  const userId = req.context.userId;
  if (!userId) {
    return res
      .status(401)
      .send({ message: 'Authentication failed. Please log in.' });
  }

  try {
    const query = {};
    const input = req.query;
    if (input?.department) query.department = input.department;
    if (input?.author) query.author = { $regex: input.author, $options: 'i' };
    if (input?.title) query.title = { $regex: input.title, $options: 'i' };

    const books = await Book.find(query);
    res.json(books);
  } catch (error) {
    res.status(500).send({ message: 'Failed to fetch books' });
  }
});

// Fetch details of a single book
router.get('/book/:id', async (req, res) => {
  const userId = req.context.userId;
  const bookId = req.params.id;

  if (!userId) {
    return res
      .status(401)
      .json({ message: 'Authentication failed. Please log in.' });
  }

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch book details.' });
  }
});

// Add a book
router.post('/books', async (req, res) => {
  const input = req.body;
  const { userId, role } = req.context || {};

  if (!userId || !allowedRoles.includes(role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const newBook = new Book({
      ...input,
      currentQuantity: input.totalQuantity,
    });
    const savedBook = await newBook.save();

    return res.status(201).json({
      success: true,
      message: 'Book added successfully',
      book: savedBook,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Edit a book
router.put('/books/:id', async (req, res) => {
  const input = req.body;
  const { userId, role } = req.context || {};
  const bookId = req.params.id;

  if (!userId || !allowedRoles.includes(role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const existingBook = await Book.findById(bookId);
    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    Object.keys(input).forEach((key) => {
      if (key !== 'id' && input[key] !== undefined) {
        existingBook[key] = input[key];
      }
    });

    const savedBook = await existingBook.save();

    return res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      book: savedBook,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete Book
router.delete('/book/:id', async (req, res) => {
  const { userId, role } = req.context || {};
  const bookId = req.params.id;

  if (!userId || !allowedRoles.includes(role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const book = await Book.findByIdAndDelete(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    return res.status(200).json({ message: 'Book deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete the book.' });
  }
});

export default router;
