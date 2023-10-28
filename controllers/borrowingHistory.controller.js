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

router.get('/borrow-list', async (req, res) => {
  // Extracting query parameters
  const {
    userId,
    studentId,
    firstName,
    lastName,
    title,
    author,
    bookDepartment,
    userDepartment,
  } = req.body || {};

  // Building the search criteria dynamically
  let filterCriteria = { status: 'borrowed' };

  if (userId) filterCriteria['user'] = userId;
  if (studentId) filterCriteria['user.studentId'] = studentId;

  try {
    // Fetch borrowing records based on filters
    const borrowedBooks = await BorrowingHistory.find(filterCriteria)
      .populate({
        path: 'book',
        select:
          'title author category department description publishedDate isbn totalQuantity currentQuantity',
        match: {
          ...(title && { title: { $regex: title, $options: 'i' } }),
          ...(author && { author: { $regex: author, $options: 'i' } }),
          ...(bookDepartment && {
            department: { $regex: bookDepartment, $options: 'i' },
          }),
        },
      })
      .populate({
        path: 'user',
        select:
          'name email dateOfBirth phoneNumber role address batch department studentId',
        match: {
          ...(firstName && {
            'name.first': { $regex: firstName, $options: 'i' },
          }),
          ...(lastName && { 'name.last': { $regex: lastName, $options: 'i' } }),
          ...(userDepartment && {
            department: { $regex: userDepartment, $options: 'i' },
          }),
        },
      });

    // Filter out any borrowing records that did not match the book/user populate conditions
    const filteredBorrowedBooks = borrowedBooks.filter(
      (record) => record.book && record.user
    );

    res.status(200).json({ borrowingHistories: filteredBorrowedBooks });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
