const {
  calculateTotalProfit,
  calculateTotalBooksSold,
  validateBookData
} = require('../../utils/bookHelpers');

test('calculateTotalProfit should calculate total profit correctly', () => {
  const orders = [
    { totalPrice: 100 },
    { totalPrice: 250 },
    { totalPrice: 300 }
  ];

  const result = calculateTotalProfit(orders);
  expect(result).toBe(650);
});

test('calculateTotalProfit should return 0 for empty orders array', () => {
  const result = calculateTotalProfit([]);
  expect(result).toBe(0);
});

test('calculateTotalBooksSold should calculate total books sold correctly', () => {
  const orders = [
    { quantity: 2 },
    { quantity: 3 },
    { quantity: 1 }
  ];

  const result = calculateTotalBooksSold(orders);
  expect(result).toBe(6);
});

test('calculateTotalBooksSold should return 0 for empty orders array', () => {
  const result = calculateTotalBooksSold([]);
  expect(result).toBe(0);
});

test('validateBookData should validate correct book data', () => {
  const validBookData = {
    title: 'TestBook',
    author: 'TestAuthor',
    price: 255,
    publishedDate: '2004-6-5',
    description: 'test description'
  };

  expect(() => validateBookData(validBookData)).not.toThrow();
});

test('validateBookData should throw error for missing required fields', () => {
  const invalidBookData = {
    title: 'TestBook',
    price: 255,
    publishedDate: '2004-6-5',
    description: 'test book description'
  };

  expect(() => validateBookData(invalidBookData)).toThrow('Missing required fields: author');
});

test('validateBookData should throw error for negative price', () => {
  const invalidBookData = {
    title: 'Test Book',
    author: 'Test Author',
    price: -29.99,
    publishedDate: '2024-01-01',
    description: 'A test book description'
  };

  expect(() => validateBookData(invalidBookData)).toThrow('Price cannot be negative');
});

test('validateBookData should throw error for invalid published date', () => {
  const invalidBookData = {
    title: 'Test Book',
    author: 'Test Author',
    price: 288,
    publishedDate: 'dfjls',
    description: 'book description'
  };

  expect(() => validateBookData(invalidBookData)).toThrow('Invalid published date');
});

test('validateBookData should throw error for empty description', () => {
  const invalidBookData = {
    title: 'Test Book',
    author: 'Test Author',
    price: 288,
    publishedDate: '2004-06-05',
    description: '   '
  };

  expect(() => validateBookData(invalidBookData)).toThrow('Description cannot be empty');
}); 