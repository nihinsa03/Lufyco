const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');

/**
 * @swagger
 * tags:
 *   - name: Wishlist
 *     description: Wishlist management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     WishlistItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "67f123abc456def789gh123"
 *         user:
 *           type: string
 *           example: "67f111aaa222bbb333ccc444"
 *         product:
 *           type: string
 *           example: "67f999zzz888yyy777xxx666"
 *         title:
 *           type: string
 *           example: "Blue Casual Shirt"
 *         price:
 *           type: number
 *           example: 3500
 *         image:
 *           type: string
 *           example: "https://example.com/product.jpg"
 *         createdAt:
 *           type: string
 *           example: "2026-03-28T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           example: "2026-03-28T10:05:00.000Z"
 *
 *     WishlistCreateRequest:
 *       type: object
 *       required:
 *         - userId
 *         - productId
 *         - title
 *       properties:
 *         userId:
 *           type: string
 *           example: "67f111aaa222bbb333ccc444"
 *         productId:
 *           type: string
 *           example: "67f999zzz888yyy777xxx666"
 *         title:
 *           type: string
 *           example: "Blue Casual Shirt"
 *         price:
 *           type: number
 *           example: 3500
 *         image:
 *           type: string
 *           example: "https://example.com/product.jpg"
 *
 *     MessageResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Item removed"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Something went wrong"
 */

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get wishlist items
 *     description: Returns all wishlist items, optionally filtered by userId.
 *     tags: [Wishlist]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: User ID to filter wishlist items
 *     responses:
 *       200:
 *         description: Wishlist items fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WishlistItem'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// @route   GET /api/wishlist
// @desc    Get all wishlist items for a user
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        let query = {};
        if (userId) query.user = userId;

        const items = await Wishlist.find(query).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/wishlist:
 *   post:
 *     summary: Add item to wishlist
 *     description: Adds a product to the user's wishlist if it is not already there.
 *     tags: [Wishlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WishlistCreateRequest'
 *     responses:
 *       201:
 *         description: Wishlist item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WishlistItem'
 *       400:
 *         description: Item already exists or invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// @route   POST /api/wishlist
// @desc    Add item to wishlist
router.post('/', async (req, res) => {
    const { userId, productId, title, price, image } = req.body;

    try {
        const exists = await Wishlist.findOne({
            user: userId,
            $or: [{ product: productId }, { title: title }]
        });

        if (exists) {
            return res.status(400).json({ message: 'Item already in wishlist' });
        }

        const newItem = new Wishlist({
            user: userId,
            product: productId,
            title,
            price,
            image
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/wishlist/{id}:
 *   delete:
 *     summary: Remove item from wishlist
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Wishlist item ID
 *     responses:
 *       200:
 *         description: Wishlist item removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       404:
 *         description: Wishlist item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// @route   DELETE /api/wishlist/:id
// @desc    Remove from wishlist
router.delete('/:id', async (req, res) => {
    try {
        const item = await Wishlist.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        await item.deleteOne();
        res.json({ message: 'Item removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;