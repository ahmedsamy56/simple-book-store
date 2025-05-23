const {
  hashPassword,
  comparePasswords,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} = require('../../utils/authHelpers');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

beforeEach(() => {
  process.env.ACCESS_TOKEN_SECRET = '0dc9ac4f990fd312c670374bce561ce39afbe61340898726209252612e4c70834ede086c50d4ec660db3c5c4c765dabd0ab34aa818df7c0c4e7020fc81e41e02';
  process.env.REFRESH_TOKEN_SECRET = '584da4549259c6ace995182bc42e42c647d307a38693cc352664ab8944526309b9f3badf8f47cad5e42c23ae962a07990050173e196f7aeaaf7a1ba5deeb5cf9';
});

test('hashPassword should hash password successfully', async () => {
  const password = 'testPassword';
  const hashedPassword = await hashPassword(password);

  expect(hashedPassword).toBeDefined();
  expect(hashedPassword).not.toBe(password);
  expect(hashedPassword.length).toBeGreaterThan(0);
});

test('comparePasswords should return true for matching passwords', async () => {
  const password = 'testPassword';
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await comparePasswords(password, hashedPassword);

  expect(result).toBe(true);
});

test('comparePasswords should return false for not matching passwords', async () => {
  const password = 'testPassword';
  const wrongPassword = 'wrongPassword';
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await comparePasswords(wrongPassword, hashedPassword);

  expect(result).toBe(false);
});

test('generateAccessToken should return a valid JWT token', () => {
  const userPayload = { id: 1, email: 'test@example.com' };

  const token = generateAccessToken(userPayload);

  expect(token).toBeDefined();
  expect(typeof token).toBe('string');

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  expect(decoded.id).toBe(userPayload.id);
  expect(decoded.email).toBe(userPayload.email);
});

test('generateRefreshToken should return a valid JWT refresh token', () => {
  const userPayload = { id: 1, email: 'test@example.com' };

  const token = generateRefreshToken(userPayload);

  expect(token).toBeDefined();
  expect(typeof token).toBe('string');

  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  expect(decoded.id).toBe(userPayload.id);
  expect(decoded.email).toBe(userPayload.email);
});

test('verifyRefreshToken should resolve with valid payload', async () => {
  const payload = { id: 1, email: 'test@example.com' };
  const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);

  const decoded = await verifyRefreshToken(token);

  expect(decoded).toMatchObject(payload);
});

test('verifyRefreshToken should throw for invalid token', async () => {
  const invalidToken = 'jfdndfsfldjflsdfjdjlsndlfnsdlkfjdsflsdkfjlsdflkdsflksdjfljdsf';

  await expect(verifyRefreshToken(invalidToken)).rejects.toThrow();
});
