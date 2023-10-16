import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: {
    first: { type: String, required: true },
    last: { type: String, required: true },
  },
  department: { type: String, required: false },
  studentId: { type: String, required: false, unique: true },
  batch: { type: String, required: false },
  dateOfBirth: { type: Date, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  address: { type: String, required: false },
  role: {
    type: String,
    required: true,
    enum: ['student', 'teacher', 'librarian', 'admin'],
  },
  otp: String,
  otpExpires: Date,
  isVerified: { type: Boolean, default: false },
});

// Before saving the user, hash the password
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Check if entered password is correct
userSchema.methods.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
