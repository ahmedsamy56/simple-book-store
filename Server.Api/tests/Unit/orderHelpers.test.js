const {
  validateOrderData,
  calculateTotalPrice,
  validateOrderStatus
} = require('../../utils/orderHelpers');

const validOrderData = {
  bookId: '123',
  quantity: 2,
  deliveryInfo: {
    address: '123 egypt test',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345',
    phone: '1234567890'
  }
};

test('validateOrderData should validate correct order data', () => {
  expect(() => validateOrderData(validOrderData)).not.toThrow();
});

test('validateOrderData should throw error for missing required fields', () => {
  const invalidOrderData = {
    bookId: '123',
  };

  expect(() => validateOrderData(invalidOrderData)).toThrow('Missing required fields');
});

test('validateOrderData should throw error for invalid quantity', () => {
  const invalidOrderData = {
    ...validOrderData,
    quantity: 0
  };

  expect(() => validateOrderData(invalidOrderData)).toThrow('Quantity must be greater than 0');
});

test('validateOrderData should throw error for negative quantity', () => {
  const invalidOrderData = {
    ...validOrderData,
    quantity: -10
  };

  expect(() => validateOrderData(invalidOrderData)).toThrow('Quantity must be greater than 0');
});

test('validateOrderData should throw error for missing delivery info fields', () => {
  const invalidOrderData = {
    bookId: '123',
    quantity: 2,
    deliveryInfo: {
      address: '123 Main St',
    }
  };

  expect(() => validateOrderData(invalidOrderData)).toThrow('Missing delivery information: city, state, zipCode, phone');
});

test('validateOrderData should throw error for invalid phone number format', () => {
  const invalidOrderData = {
    ...validOrderData,
    deliveryInfo: {
      ...validOrderData.deliveryInfo,
      phone: '12556'
    }
  };

  expect(() => validateOrderData(invalidOrderData)).toThrow('Invalid phone number format');
});

test('validateOrderData should throw error for invalid zip code format', () => {
  const invalidOrderData = {
    ...validOrderData,
    deliveryInfo: {
      ...validOrderData.deliveryInfo,
      zipCode: '053'
    }
  };

  expect(() => validateOrderData(invalidOrderData)).toThrow('Invalid zip code format');
});

test('validateOrderData should accept valid phone number with country code', () => {
  const validOrderDataWithCountryCode = {
    ...validOrderData,
    deliveryInfo: {
      ...validOrderData.deliveryInfo,
      phone: '+1234567890'
    }
  };

  expect(() => validateOrderData(validOrderDataWithCountryCode)).not.toThrow();
});

test('validateOrderData should accept valid zip code with extension', () => {
  const validOrderDataWithZipExtension = {
    ...validOrderData,
    deliveryInfo: {
      ...validOrderData.deliveryInfo,
      zipCode: '12345-6789'
    }
  };

  expect(() => validateOrderData(validOrderDataWithZipExtension)).not.toThrow();
});

// calculateTotalPrice tests
test('calculateTotalPrice should calculate total price correctly', () => {
  const result = calculateTotalPrice(50, 3);
  expect(result).toBe(150);
});

test('calculateTotalPrice should handle zero quantity', () => {
  const result = calculateTotalPrice(250, 0);
  expect(result).toBe(0);
});

test('calculateTotalPrice should handle negative price', () => {
  const result = calculateTotalPrice(-50, 2);
  expect(result).toBe(-100);
});

test('calculateTotalPrice should handle decimal quantities', () => {
  const result = calculateTotalPrice(10.50, 2.5);
  expect(result).toBe(26.25);
});

test('calculateTotalPrice should handle large numbers', () => {
  const result = calculateTotalPrice(1000000, 1000);
  expect(result).toBe(1000000000);
});

test('calculateTotalPrice should handle zero price', () => {
  const result = calculateTotalPrice(0, 5);
  expect(result).toBe(0);
});


test('validateOrderStatus should validate all correct order statuses', () => {
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  validStatuses.forEach(status => {
    expect(() => validateOrderStatus(status)).not.toThrow();
  });
});


test('validateOrderStatus should throw error for invalid order status', () => {
  expect(() => validateOrderStatus('invalid')).toThrow(
    'Invalid order status. Must be one of: pending, processing, shipped, delivered, cancelled'
  );
});

test('validateOrderStatus should throw error for empty status', () => {
  expect(() => validateOrderStatus('')).toThrow(
    'Invalid order status. Must be one of: pending, processing, shipped, delivered, cancelled'
  );
});

test('validateOrderStatus should throw error for null status', () => {
  expect(() => validateOrderStatus(null)).toThrow(
    'Invalid order status. Must be one of: pending, processing, shipped, delivered, cancelled'
  );
});

test('validateOrderStatus should throw error for undefined status', () => {
  expect(() => validateOrderStatus(undefined)).toThrow(
    'Invalid order status. Must be one of: pending, processing, shipped, delivered, cancelled'
  );
});

test('validateOrderStatus should be case sensitive', () => {
  expect(() => validateOrderStatus('PENDING')).toThrow(
    'Invalid order status. Must be one of: pending, processing, shipped, delivered, cancelled'
  );
}); 