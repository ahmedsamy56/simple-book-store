const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('../setup');
const app = require('../../app');
const Book = require('../../models/Book');
const User = require('../../models/User');

describe('Books Controller Integration Tests', () => {
  let adminToken;
  let userToken;
  let testBook;

  beforeAll(async () => {
    const mongoUri = 'mongodb://localhost:27017/MyTestDB'; 
    await mongoose.connect(mongoUri);

    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: await require('bcrypt').hash('password123', 10),
      mobileNumber: '01205926527',
      gender: 'male',
      role: 'admin'
    });

   
    const NormalUser = await User.create({
      firstName: 'ahmed',
      lastName: 'User',
      email: 'user@example.com',
      password: await require('bcrypt').hash('password123', 10),
      mobileNumber: '01205926527',
      gender: 'male',
      role: 'user'
    });

    
    adminToken = jwt.sign(
      { _id: adminUser._id, email: adminUser.email, role: adminUser.role },
      process.env.ACCESS_TOKEN_SECRET
    );

    userToken = jwt.sign(
      { _id: NormalUser._id, email: NormalUser.email, role: NormalUser.role },
      process.env.ACCESS_TOKEN_SECRET
    );
  });

  afterAll(async () => {
    await Book.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Book.deleteMany({});
    testBook = await Book.create({
      title: 'Test Book',
      author: 'Test Author',
      price: 290,
      publishedDate: new Date(),
      description: 'test book description'
    });
  });

  describe('GET /books', () => {
    it('should get all books for authenticated user', async () => {
      const response = await request(app)
        .get('/books')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body[0].title).toBe('Test Book');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/books');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /books/:id', () => {
    it('should get a single book by id for authenticated user', async () => {
      const response = await request(app)
        .get(`/books/${testBook._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Test Book');
    });

    it('should return 404 for non-existent book', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/books/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /books', () => {
    const newBook = {
      title: 'New Book',
      author: 'New Author',
      price: 350,
      publishedDate: new Date(),
      description: 'A new book description'
    };

    it('should create a new book when admin', async () => {
      const response = await request(app)
        .post('/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newBook);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(newBook.title);
    });

    it('should fail when regular user tries to create book', async () => {
      const response = await request(app)
        .post('/books')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newBook);

      expect(response.status).toBe(403);
    });

    it('should fail with invalid book data', async () => {
      const invalidBook = { title: 'Invalid Book' };
      const response = await request(app)
        .post('/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidBook);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /books/:id', () => {
    const updatedBook = {
      title: 'Updated Book',
      author: 'Updated Author',
      price: 49.99,
      publishedDate: new Date(),
      description: 'An updated book description'
    };

    it('should update a book when admin', async () => {
      const response = await request(app)
        .put(`/books/${testBook._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedBook);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updatedBook.title);
    });

    it('should fail when regular user tries to update book', async () => {
      const response = await request(app)
        .put(`/books/${testBook._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatedBook);

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /books/:id', () => {
    it('should delete a book when admin', async () => {
      const response = await request(app)
        .delete(`/books/${testBook._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);

      const book = await Book.findById(testBook._id);
      expect(book).toBeNull();
    });

    it('should fail when regular user tries to delete book', async () => {
      const response = await request(app)
        .delete(`/books/${testBook._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /books/analysis/stats', () => {
    it('should get analysis stats when admin', async () => {
      const response = await request(app)
        .get('/books/analysis/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalBooks');
      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('totalAdmins');
      expect(response.body).toHaveProperty('totalProfit');
      expect(response.body).toHaveProperty('totalBooksSold');
    });

    it('should fail when regular user tries to get analysis stats', async () => {
      const response = await request(app)
        .get('/books/analysis/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });
}); 