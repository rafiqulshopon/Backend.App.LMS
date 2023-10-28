import mongoose from 'mongoose';

const borrowingHistorySchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrowDate: { type: Date, default: Date.now },
  expectedReturnDate: { type: Date, required: true },
  actualReturnDate: Date,
  status: {
    type: String,
    enum: ['borrowed', 'returned', 'overdue'],
    default: 'borrowed',
  },
  fines: { type: Number, default: 0 },
});

export default mongoose.model('BorrowingHistory', borrowingHistorySchema);
