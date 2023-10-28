import express from 'express';
import http from 'http';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './auth/auth.routes.js';
import { addBook, editBook, getBooks } from './controllers/book.controller.js';

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGODB_URL;
const API_URL = process.env.API_URL;
const SECRET_KEY = process.env.JWT_SECRET;

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to set context
app.use((req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split('Bearer ')[1];
  let userId = null;
  let role = null;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, SECRET_KEY);
      userId = decodedToken.id;
      role = decodedToken.role;
    } catch (err) {
      console.error('Invalid token');
    }
  }

  // Setting the context on the req object
  req.context = { userId, role };

  next();
});

app.use('/auth', authRoutes);

// books api
app.get('/books', getBooks);
app.post('/books', addBook);
app.put('/books/:id', editBook);

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB..');
    http.createServer(app).listen(PORT, () => {
      console.log(`REST server ready at ${API_URL}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
