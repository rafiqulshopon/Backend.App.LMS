import express from 'express';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

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
    });
    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        name: newUser.name,
        department: newUser.department,
        batch: newUser.batch,
        studentId: newUser.studentId,
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

export default router;
