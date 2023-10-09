import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

// Before saving the user, hash the password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Check if entered password is correct
userSchema.methods.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
