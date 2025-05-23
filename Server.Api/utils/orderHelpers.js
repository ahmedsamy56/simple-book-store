const validateOrderData = (orderData) => {
  const { bookId, quantity, deliveryInfo } = orderData;
  
  // Validate required fields
  if (!bookId || quantity === null || quantity === undefined || !deliveryInfo) {
    throw new Error('Missing required fields');
  }

  // Validate quantity
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  // Validate delivery info
  const requiredDeliveryFields = ['address', 'city', 'state', 'zipCode', 'phone'];
  const missingDeliveryFields = requiredDeliveryFields.filter(field => !deliveryInfo[field]);
  
  if (missingDeliveryFields.length > 0) {
    throw new Error(`Missing delivery information: ${missingDeliveryFields.join(', ')}`);
  }

  // Validate phone number format
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  if (!phoneRegex.test(deliveryInfo.phone)) {
    throw new Error('Invalid phone number format');
  }

  // Validate zip code format
  const zipRegex = /^\d{5}(-\d{4})?$/;
  if (!zipRegex.test(deliveryInfo.zipCode)) {
    throw new Error('Invalid zip code format');
  }
};

const calculateTotalPrice = (bookPrice, quantity) => {
  return bookPrice * quantity;
};

const validateOrderStatus = (status) => {
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid order status. Must be one of: ${validStatuses.join(', ')}`);
  }
};

module.exports = {
  validateOrderData,
  calculateTotalPrice,
  validateOrderStatus
}; 