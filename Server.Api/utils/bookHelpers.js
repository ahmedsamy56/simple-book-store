const calculateTotalProfit = (orders) => {
  return orders.reduce((sum, order) => sum + order.totalPrice, 0);
};

const calculateTotalBooksSold = (orders) => {
  return orders.reduce((sum, order) => sum + order.quantity, 0);
};

const validateBookData = (bookData) => {
  const requiredFields = ['title', 'author', 'price', 'publishedDate', 'description'];
  const missingFields = requiredFields.filter(field => !bookData[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  if (bookData.price < 0) {
    throw new Error('Price cannot be negative');
  }

  // Validate publishedDate is a valid date
  const publishedDate = new Date(bookData.publishedDate);
  if (isNaN(publishedDate.getTime())) {
    throw new Error('Invalid published date');
  }

  // Validate description is not empty
  if (bookData.description.trim().length === 0) {
    throw new Error('Description cannot be empty');
  }
};

module.exports = {
  calculateTotalProfit,
  calculateTotalBooksSold,
  validateBookData
}; 