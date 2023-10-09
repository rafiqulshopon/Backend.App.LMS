import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Author',
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Category',
  },
  description: String,
  publishedDate: String,
  isbn: {
    type: String,
    required: true,
  },
});

const Book = mongoose.model('Book', bookSchema);

export default Book;
