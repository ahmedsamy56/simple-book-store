const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('../setup'); 
const app = require('../../app');
const User = require('../../models/User');
const RefreshToken = require('../../models/RefreshToken');

describe('Auth Controller Integration Tests', () => {
  let testUser;
  let refreshToken;

  beforeAll(async () => {
    const mongoUri = 'mongodb://localhost:27017/MyTestDB'; 
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await RefreshToken.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await RefreshToken.deleteMany({});
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        firstName: 'Ahmed',
        lastName: 'samy',
        email: 'Ahmed@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        mobileNumber: '1234567890',
        gender: 'male'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');

      
      const user = await User.findOne({ email: userData.email });
      expect(user).not.toBeNull();     
      expect(user).toBeDefined();
    });

    it('should fail when passwords do not match', async () => {
      const userData = {
        firstName: 'Ahmed',
        lastName: 'samy',
        email: 'Ahmed@example.com',
        password: 'password123',
        confirmPassword: 'password1235555',
        mobileNumber: '1234567890',
        gender: 'male'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Passwords do not match');
    });
  });



  describe('POST /auth/login', () => {
    beforeEach(async () => {
      const hashedPassword = await require('bcrypt').hash('password123', 10);
      testUser = await User.create({
        firstName: 'Ahmed',
        lastName: 'samy',
        email: 'Ahmed@example.com',
        password: hashedPassword,
        mobileNumber: '01205926527',
        gender: 'male',
        role: 'user'
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'Ahmed@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.name).toBe('Ahmed samy');
      expect(response.body.role).toBe('user');
    });

    it('should fail with invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'Ahmed@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid password');
    });
  });



  describe('POST /auth/token', () => {
    beforeEach(async () => {
      // Create a test user and refresh token
      const hashedPassword = await require('bcrypt').hash('password123', 10);
      testUser = await User.create({
        firstName: 'Ahmed',
        lastName: 'samy',
        email: 'Ahmed@example.com',
        password: hashedPassword,
        mobileNumber: '01205926527',
        gender: 'male',
        role: 'user'
      });

      const userPayload = {
        _id: testUser._id,
        name: `${testUser.firstName} ${testUser.lastName}`,
        email: testUser.email,
        role: testUser.role
      };

      const validRefreshToken = jwt.sign(userPayload, process.env.REFRESH_TOKEN_SECRET);

      refreshToken = await RefreshToken.create({
        token: validRefreshToken,
        email: testUser.email,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    });

    it('should refresh access token successfully', async () => {
      const response = await request(app)
        .post('/auth/token')
        .send({
          token: refreshToken.token
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
    });

    it('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/auth/token')
        .send({
          token: 'lfldfd fsdflhkdfsalkfdsajfjdsf'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid refresh token');
    });
  });



  describe('DELETE /auth/logout', () => {
    beforeEach(async () => {
      const userPayload = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Ahmed samy',
        email: 'Ahmed@example.com',
        role: 'user'
      };

      const validRefreshToken = jwt.sign(userPayload, process.env.REFRESH_TOKEN_SECRET);

      refreshToken = await RefreshToken.create({
        token: validRefreshToken,
        email: 'Ahmed@example.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .delete('/auth/logout')
        .send({
          token: refreshToken.token
        });

      expect(response.status).toBe(204);

      // Verify refresh token was deleted
      const token = await RefreshToken.findOne({ token: refreshToken.token });
      expect(token).toBeNull();
    });
  });
}); 