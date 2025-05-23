const Order = require('../models/Order');
const Book = require('../models/Book');
const { 
  validateOrderData, 
  calculateTotalPrice, 
  validateOrderStatus 
} = require('../utils/orderHelpers');

class OrderService {
  async createOrder(userId, orderData) {
    validateOrderData(orderData);
    
    const book = await Book.findById(orderData.bookId);
    if (!book) {
      throw new Error('Book not found');
    }

    const totalPrice = calculateTotalPrice(book.price, orderData.quantity);

    const order = new Order({
      user: userId,
      book: orderData.bookId,
      quantity: orderData.quantity,
      totalPrice,
      deliveryInfo: orderData.deliveryInfo
    });

    await order.save();
    
    return await Order.findById(order._id)
      .populate('book')
      .populate('user', 'firstName lastName email');
  }

  async getUserOrders(userId) {
    return await Order.find({ user: userId })
      .populate('book')
      .sort({ orderDate: -1 });
  }

  async getAllOrders() {
    return await Order.find()
      .populate('book')
      .populate('user', 'firstName lastName email')
      .sort({ orderDate: -1 });
  }

  async updateOrderStatus(orderId, status) {
    validateOrderStatus(status);
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }
}

module.exports = new OrderService(); 