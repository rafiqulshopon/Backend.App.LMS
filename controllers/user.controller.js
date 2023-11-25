import express from 'express';
import mongoose from 'mongoose';
import User from '../models/user.model.js';

const router = express.Router();

// Edit Profile
router.put('/edit-profile', async (req, res) => {
  const { userId } = req.context || {};
  const input = req.body || {};

  if (!userId) {
    return res
      .status(403)
      .json({ message: 'Authentication failed. Please log in.' });
  }

  try {
    const { isActive, isVerified, _id, ...updates } = input;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user profile.' });
  }
});

// Fetch all users
router.get('/users', async (req, res) => {
  const { role } = req.context || {};

  if (role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const users = await User.find().select('-password').sort({ _id: -1 });
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      users: [],
    });
  }
});

// Fetch a single user by ID
router.get('/user/:id', async (req, res) => {
  const { role } = req.context || {};

  if (role !== 'admin' && role !== 'librarian') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json(user);
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }
    return res.status(500).json({ message: 'Failed to fetch user.' });
  }
});

// search users
router.post('/search-users', async (req, res) => {
  const { role } = req.context || {};

  if (role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const { search_keyword } = req.body || {};

  try {
    let pipeline = [
      {
        $addFields: {
          fullName: { $concat: ['$name.first', ' ', '$name.last'] },
        },
      },
      {
        $match: {},
      },
      {
        $project: { password: 0 },
      },
    ];

    if (search_keyword) {
      const regex = { $regex: search_keyword, $options: 'i' };
      pipeline[1].$match.$or = [
        { fullName: regex },
        { email: regex },
        { department: regex },
        { studentId: regex },
        { batch: regex },
        { phoneNumber: regex },
        { address: regex },
        { role: regex },
      ];
    }

    const users = await User.aggregate(pipeline).exec();

    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      users: [],
    });
  }
});

// Fetch my profile
router.get('/profile', async (req, res) => {
  const { userId } = req.context || {};

  if (!userId) {
    return res
      .status(403)
      .json({ message: 'Authentication failed. Please log in.' });
  }

  try {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
});

//Deactivate user
router.put('/deactivate/:userId', async (req, res) => {
  const { userId, role } = req.context || {};
  const targetUserId = req.params.userId;

  if (!(role === 'admin' || role === 'librarian')) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  if (userId === targetUserId) {
    return res.status(403).json({ message: `Can't deactivate own account` });
  }

  try {
    const user = await User.findByIdAndUpdate(
      targetUserId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ message: 'User successfully deactivated.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to deactivate user.' });
  }
});

//Active user

router.put('/activate/:id', async (req, res) => {
  const { role } = req.context || {};

  if (role !== 'admin' && role !== 'librarian') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true, isVerified: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ message: 'User activated successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to activate user.' });
  }
});

// Delete a user permanently
router.delete('/user/:id', async (req, res) => {
  const { userId, role } = req.context || {};

  if (role !== 'admin' && role !== 'librarian') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  if (userId === req.params.id) {
    return res.status(403).json({ message: `Can't delete own profile.` });
  }

  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }
    return res.status(500).json({ message: 'Failed to delete user.' });
  }
});

export default router;
