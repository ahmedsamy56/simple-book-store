const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./controllers/auth');
const booksRoutes = require('./controllers/books');
const ordersRoutes = require('./controllers/orders');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/books', booksRoutes);
app.use('/orders', ordersRoutes);


module.exports = app; 