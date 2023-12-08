import express from 'express';
import User from '../models/user.model.js';
import Book from '../models/book.model.js';
import BorrowingHistory from '../models/borrowingHistory.model.js';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const newUsersLast7Days = await User.count({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const totalBooks = await Book.count();
    const newBooksLast7Days = await Book.count({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });
    const booksByCategory = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const totalBorrowedBooks = await BorrowingHistory.count({
      status: 'borrowed',
    });
    const borrowedBooksLast7Days = await BorrowingHistory.count({
      borrowDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    const mostBorrowedBooks = await BorrowingHistory.aggregate([
      { $group: { _id: '$book', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const totalOverdueBooks = await BorrowingHistory.count({
      status: 'overdue',
    });
    const booksReturnedLast7Days = await BorrowingHistory.count({
      status: 'returned',
      actualReturnDate: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    });

    const mostActiveUsers = await BorrowingHistory.aggregate([
      { $group: { _id: '$user', activityCount: { $sum: 1 } } },
      { $sort: { activityCount: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalUsers,
      newUsersLast7Days,
      usersByRole,
      totalBooks,
      newBooksLast7Days,
      booksByCategory,
      totalBorrowedBooks,
      borrowedBooksLast7Days,
      mostBorrowedBooks,
      totalOverdueBooks,
      booksReturnedLast7Days,
      mostActiveUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

export default router;
