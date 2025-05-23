require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./controllers/auth');
const bookRoutes = require('./controllers/books');
const ordersRoutes = require('./controllers/orders');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Client')));

// Routes
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/orders', ordersRoutes);


if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('MongoDB connected');
      app.listen(4000, () => {
        console.log('Server running on port 4000');
      });
    })
    .catch(err => console.error('MongoDB connection error:', err));
}

module.exports = app;
