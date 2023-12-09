import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  department: { type: String, required: true },
  description: String,
  publishedDate: String,
  isbn: { type: String, required: true },
  totalQuantity: { type: Number, required: true, default: 0 },
  currentQuantity: { type: Number, required: true, default: 0 },
  reviews: [reviewSchema],
});

const Book = mongoose.model('Book', bookSchema);

export default Book;
