import express from 'express';
import BorrowingHistory from '../models/borrowingHistory.model.js';
import Book from '../models/book.model.js';

const router = express.Router();
const allowedRoles = ['admin', 'librarian'];

// Assign a book
router.post('/assign', async (req, res) => {
  const { userId, role } = req.context || {};

  if (!userId || !allowedRoles.includes(role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  // Check if the book is available
  const book = await Book.findById(req.body.bookId);
  if (!book || book.currentQuantity <= 0) {
    return res.status(400).json({ message: 'Book is not available.' });
  }

  // Decrement book's currentQuantity
  book.currentQuantity -= 1;
  await book.save();

  // Create a borrowing record
  const borrowRecord = new BorrowingHistory({
    book: req.body.bookId,
    user: req.body.userId,
    expectedReturnDate: req.body.expectedReturnDate,
  });

  try {
    await borrowRecord.save();

    // populate book and user data
    const populatedRecord = await BorrowingHistory.findById(borrowRecord._id)
      .populate('book')
      .populate({
        path: 'user',
        select:
          'name email dateOfBirth phoneNumber role address batch department -_id',
      });

    res.status(200).json({
      message: 'Book assigned successfully.',
      borrowingHistory: populatedRecord,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal server error.', error: error.message });
  }
});

export default router;
