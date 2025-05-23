const Book = require('../models/Book');
const Order = require('../models/Order');
const User = require('../models/User');
const { 
  calculateTotalProfit, 
  calculateTotalBooksSold, 
  validateBookData 
} = require('../utils/bookHelpers');

class BookService {
  async getAllBooks() {
    const books = await Book.find();
    return books;
  }

  async getBookById(id) {
    const book = await Book.findById(id);
    if (!book) {
      throw new Error('Book not found');
    }
    return book;
  }

  async createBook(bookData) {
    validateBookData(bookData);
    const book = new Book(bookData);
    await book.save();
    return book;
  }

  async updateBook(id, bookData) {
    validateBookData(bookData);
    const book = await Book.findByIdAndUpdate(
      id,
      bookData,
      { new: true, runValidators: true }
    );
    if (!book) {
      throw new Error('Book not found');
    }
    return book;
  }

  async deleteBook(id) {
    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      throw new Error('Book not found');
    }
    return { message: 'Book deleted successfully' };
  }

  async getAnalysisStats() {
    const [totalBooks, totalUsers, totalAdmins, orders] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'admin' }),
      Order.find()
    ]);

    return {
      totalBooks,
      totalUsers,
      totalAdmins,
      totalProfit: calculateTotalProfit(orders),
      totalBooksSold: calculateTotalBooksSold(orders)
    };
  }
}

module.exports = new BookService(); 