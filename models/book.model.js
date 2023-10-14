import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  department: { type: String, required: true },
  description: String,
  publishedDate: String,
  isbn: { type: String, required: true },
});

const Book = mongoose.model('Book', bookSchema);

export default Book;
