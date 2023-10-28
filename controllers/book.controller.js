import Book from '../models/book.model.js';

const allowedRoles = ['admin', 'librarian'];

export const getBooks = async (req, res) => {
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
};

export const addBook = async (req, res) => {
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
};

export const editBook = async (req, res) => {
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
};