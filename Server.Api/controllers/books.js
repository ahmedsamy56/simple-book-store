const express = require('express');
const bookService = require('../services/bookService');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all books (accessible to all authenticated users)
router.get('/', verifyToken, async (req, res) => {
  try {
    const books = await bookService.getAllBooks();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get analysis data (admin only)
router.get('/analysis/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const stats = await bookService.getAnalysisStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single book (accessible to all authenticated users)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    res.json(book);
  } catch (error) {
    res.status(error.message === 'Book not found' ? 404 : 500)
      .json({ error: error.message });
  }
});

// Add new book (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const book = await bookService.createBook(req.body);
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update book (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const book = await bookService.updateBook(req.params.id, req.body);
    res.json(book);
  } catch (error) {
    res.status(error.message === 'Book not found' ? 404 : 400)
      .json({ error: error.message });
  }
});

// Delete book (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await bookService.deleteBook(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(error.message === 'Book not found' ? 404 : 400)
      .json({ error: error.message });
  }
});

module.exports = router;
