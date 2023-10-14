import express from 'express';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      department,
      studentId,
      batch,
      dateOfBirth,
      phoneNumber,
      address,
      role,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const newUser = new User({
      email,
      password,
      name,
      department,
      studentId,
      batch,
      dateOfBirth,
      phoneNumber,
      address,
      role,
    });
    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        name: newUser.name,
        department: newUser.department,
        batch: newUser.batch,
        studentId: newUser.studentId,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '5h',
      }
    );

    res.status(201).json({ token });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Something went wrong.', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User doesn't exist." });
    }

    const isPasswordValid = await existingUser.isValidPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password.' });
    }

    const token = jwt.sign(
      {
        id: existingUser._id,
        name: existingUser.name,
        department: existingUser.department,
        batch: existingUser.batch,
        studentId: existingUser.studentId,
        role: existingUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '5h',
      }
    );

    res.status(200).json({ token });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Something went wrong.', error: error.message });
  }
});

router.patch('/update-profile', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatableFields = [
      'name',
      'department',
      'batch',
      'phoneNumber',
      'address',
    ];
    let update = {};

    updatableFields.forEach((field) => {
      if (req.body[field]) {
        update[field] = req.body[field];
      }
    });

    await User.findByIdAndUpdate(decoded.id, update);

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Something went wrong.', error: error.message });
  }
});

export default router;
