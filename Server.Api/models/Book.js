const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  publishedDate: { type: Date, required: true },
  description: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', BookSchema);
