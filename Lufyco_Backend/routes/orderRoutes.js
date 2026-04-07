const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Order management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Order not found"
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     description: Creates a new order and updates closet items, saved looks, and product stock.
 *     tags: [Orders]
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
    try {
        const result = await orderService.createOrder(req.body);
        return res.status(201).json(result);
    } catch (error) {
        console.error('Create order error:', error.message);
        return res.status(error.statusCode || 500).json({
            message: error.message || 'Server error while creating order',
        });
    }
});

/**
 * @swagger
 * /api/orders/myorders:
 *   get:
 *     summary: Get orders of a specific user
 *     description: Returns all orders for the provided userId query parameter.
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to fetch orders for
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *       400:
 *         description: User ID is required
 *       500:
 *         description: Server error while fetching user orders
 */
router.get('/myorders', async (req, res) => {
    try {
        const { userId, status } = req.query;
        const orders = await orderService.getMyOrders(userId, status);
        return res.status(200).json(orders);
    } catch (error) {
        console.error('Get my orders error:', error.message);
        return res.status(error.statusCode || 500).json({
            message: error.message || 'Server error while fetching orders',
        });
    }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order details by order ID
 *     description: Returns full details of a single order by its MongoDB _id.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 69d1439bf530d4caded3d6fa
 *         description: Order MongoDB ID
 *     responses:
 *       200:
 *         description: Order details fetched successfully
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error while fetching order details
 */
router.get('/:id', async (req, res) => {
    try {
        const order = await orderService.getOrderDetails(req.params.id);
        return res.status(200).json(order);
    } catch (error) {
        console.error('Get order details error:', error.message);
        return res.status(error.statusCode || 500).json({
            message: error.message || 'Server error while fetching order details',
        });
    }
});



module.exports = router;