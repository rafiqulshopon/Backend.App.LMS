import express from 'express';
import mongoose from 'mongoose';
import User from '../models/user.model.js';

const router = express.Router();

// Edit Profile
router.put('/profile', async (req, res) => {
  const { userId } = req.context || {};
  const input = req.body || {};

  if (!userId) {
    return res
      .status(403)
      .json({ message: 'Authentication failed. Please log in.' });
  }

  try {
    const updates = {};

    if (input.address) updates.address = input.address;
    if (input.phoneNumber) updates.phoneNumber = input.phoneNumber;
    if (input.department) updates.department = input.department;
    if (input.batch) updates.batch = input.batch;

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
  const { userId, role } = req.context || {};

  if (role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const input = req.body || {};

  try {
    const query = {};

    if (input) {
      if (input.studentId)
        query['studentId'] = { $regex: input.studentId, $options: 'i' };
      if (input.batch) query['batch'] = { $regex: input.batch, $options: 'i' };
      if (input.department)
        query['department'] = { $regex: input.department, $options: 'i' };
      if (input.email) query['email'] = { $regex: input.email, $options: 'i' };
      if (input.phoneNumber)
        query['phoneNumber'] = { $regex: input.phoneNumber, $options: 'i' };
      if (input.address)
        query['address'] = { $regex: input.address, $options: 'i' };
      if (input.isVerified !== undefined && input.isVerified !== null)
        query['isVerified'] = input.isVerified;
      if (input.name)
        query['name.first'] = { $regex: input.name, $options: 'i' };
      if (input.name)
        query['name.last'] = { $regex: input.name, $options: 'i' };
    }

    const users = await User.find(query).select('-password');
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
