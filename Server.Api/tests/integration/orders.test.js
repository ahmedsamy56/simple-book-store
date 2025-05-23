const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('../setup');
const app = require('../../app');
const Order = require('../../models/Order');
const Book = require('../../models/Book');
const User = require('../../models/User');

describe('Orders Controller Integration Tests', () => {
  let adminToken;
  let userToken;
  let testBook;
  let testUser;
  let testOrder;

  beforeAll(async () => {
    const mongoUri = 'mongodb://localhost:27017/MyTestDB'; 
    await mongoose.connect(mongoUri);


    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: await require('bcrypt').hash('password123', 10),
      mobileNumber: '1234567890',
      gender: 'male',
      role: 'admin'
    });

    testUser = await User.create({
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@example.com',
      password: await require('bcrypt').hash('password123', 10),
      mobileNumber: '1234567890',
      gender: 'male',
      role: 'user'
    });

    adminToken = jwt.sign(
      { _id: adminUser._id, email: adminUser.email, role: adminUser.role },
      process.env.ACCESS_TOKEN_SECRET
    );

    userToken = jwt.sign(
      { _id: testUser._id, email: testUser.email, role: testUser.role },
      process.env.ACCESS_TOKEN_SECRET
    );
  });

  afterAll(async () => {
    await Order.deleteMany({});
    await Book.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Order.deleteMany({});
    await Book.deleteMany({});

    testBook = await Book.create({
      title: 'Test Book',
      author: 'Test Author',
      price: 250,
      publishedDate: new Date(),
      description: 'test description'
    });

    testOrder = await Order.create({
      user: testUser._id,
      book: testBook._id,
      quantity: 2,
      totalPrice: 59.98,
      deliveryInfo: {
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        phone: '01205926527'
      },
      status: 'pending'
    });
  });

  describe('POST /orders', () => {
    const newOrder = {
      bookId: null, // Will be set in beforeEach
      quantity: 1,
      deliveryInfo: {
        address: '123 New St',
        city: 'New City',
        state: 'New State',
        zipCode: '54321',
        phone: '9876543210'
      }
    };

    beforeEach(() => {
      newOrder.bookId = testBook._id;
    });

    it('should create a new order for authenticated user', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newOrder);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.quantity).toBe(newOrder.quantity);
      expect(response.body.totalPrice).toBe(testBook.price * newOrder.quantity);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/orders')
        .send(newOrder);

      expect(response.status).toBe(401);
    });

    it('should fail with invalid order data', async () => {
      const invalidOrder = {
        bookId: testBook._id,
        quantity: 0,
        deliveryInfo: {
          address: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          phone: '01205926527'
        }
      };

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidOrder);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /orders/my-orders', () => {
    it('should get user orders for authenticated user', async () => {
      const response = await request(app)
        .get('/orders/my-orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body[0]._id.toString()).toBe(testOrder._id.toString());
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/orders/my-orders');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /orders', () => {
    it('should get all orders for admin', async () => {
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
    });

    it('should fail for regular user', async () => {
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /orders/:id/status', () => {
    it('should update order status for admin', async () => {
      const response = await request(app)
        .put(`/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('processing');
    });

    it('should fail for regular user', async () => {
      const response = await request(app)
        .put(`/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'processing' });

      expect(response.status).toBe(403);
    });

    it('should fail with invalid status', async () => {
      const response = await request(app)
        .put(`/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' });

      expect(response.status).toBe(400);
    });

    it('should fail for not exist order', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/orders/${fakeId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing' });

      expect(response.status).toBe(404);
    });
  });
}); 