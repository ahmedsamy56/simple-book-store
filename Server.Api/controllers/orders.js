const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Create new order (for users)
router.post('/', verifyToken, async (req, res) => {
    try {
        const order = await orderService.createOrder(req.user._id, req.body);
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ 
            error: error.message
        });
    }
});

// Get user's orders
router.get('/my-orders', verifyToken, async (req, res) => {
    try {
        const orders = await orderService.getUserOrders(req.user._id);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all orders (admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update order status (admin only)
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await orderService.updateOrderStatus(req.params.id, status);
        res.json(order);
    } catch (error) {
        res.status(error.message === 'Order not found' ? 404 : 400)
            .json({ error: error.message });
    }
});

module.exports = router; 