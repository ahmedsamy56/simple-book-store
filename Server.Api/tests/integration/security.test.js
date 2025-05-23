const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Basic Security Tests', () => {

  // Unauthorized Access Test
  test('should reject access to protected books route without valid token', async () => {
    const response = await request(app)
      .get('/books')
      .set('Authorization', 'Bearer invalid-token');
    
    expect(response.status).toBe(401);
  });

  // XSS Prevention Test
  test('should reject XSS payload in login form', async () => {
    const xssPayload = {
      email: '<script>alert("xss")</script>@test.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/auth/login')
      .send(xssPayload);

    expect(response.status).toBe(400);
  });

  // SQL Injection Prevention Test
  test('should reject SQL injection in login', async () => {
    const sqlPayload = {
      email: "' OR '1'='1",
      password: "' OR '1'='1"
    };

    const response = await request(app)
      .post('/auth/login')
      .send(sqlPayload);

    expect(response.status).toBe(400);
  });

});
