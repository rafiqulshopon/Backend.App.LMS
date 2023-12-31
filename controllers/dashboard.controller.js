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
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'bookDetails',
        },
      },
      {
        $unwind: '$bookDetails',
      },
      {
        $project: {
          count: 1,
          bookTitle: '$bookDetails.title',
          bookAuthor: '$bookDetails.author',
        },
      },
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
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $project: {
          activityCount: 1,
          userName: {
            $concat: ['$userDetails.name.first', ' ', '$userDetails.name.last'],
          },
        },
      },
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

router.get('/user-dashboard', async (req, res) => {
  const { userId } = req.context || {};

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    const currentBorrowings = await BorrowingHistory.find({
      user: userId,
      status: 'borrowed',
    })
      .populate('book', 'title author')
      .select('book borrowDate expectedReturnDate');

    const borrowingHistory = await BorrowingHistory.find({
      user: userId,
      status: { $in: ['returned', 'overdue'] },
    })
      .populate('book', 'title author')
      .select(
        'book borrowDate expectedReturnDate actualReturnDate status fines'
      );

    const overdueBooks = await BorrowingHistory.find({
      user: userId,
      status: 'overdue',
    })
      .populate('book', 'title author')
      .select('book expectedReturnDate fines');

    res.json({
      currentBorrowings,
      borrowingHistory,
      overdueBooks,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

export default router;
