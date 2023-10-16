import express from 'express';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

dotenv.config();

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

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
      otp,
      otpExpires,
      isVerified: false,
    });

    await newUser.save();

    await transporter.sendMail({
      to: email,
      subject: 'Your OTP for Signup',
      text: `Your OTP for signup is: ${otp}`,
    });

    res.status(201).json({
      message:
        'OTP sent to your email. Please verify to complete registration.',
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Something went wrong.', error: error.message });
  }
});

router.post('/forget-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    // Generate OTP and set expiry time
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via email
    await transporter.sendMail({
      to: email,
      subject: 'Your OTP for Password Reset',
      text: `Your OTP for password reset is: ${otp}`,
    });

    res.status(200).json({
      message: 'OTP sent to your email. Please verify to reset password.',
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Something went wrong.', error: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (user && user.otp === otp && user.otpExpires > new Date()) {
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();

      const token = jwt.sign(
        {
          id: user._id,
          name: user.name,
          department: user.department,
          batch: user.batch,
          studentId: user.studentId,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: '5h' }
      );

      res
        .status(200)
        .json({ message: 'OTP verified, signup successful.', token });
    } else {
      throw new Error('Invalid or expired OTP.');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // Hash the new password and update the user record.
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been successfully reset.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    if (!existingUser.isVerified) {
      return res
        .status(400)
        .json({ message: 'Please verify your email before logging in.' });
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

export default router;
