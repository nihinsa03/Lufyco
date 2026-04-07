const express = require('express');
const router = express.Router();
const ClosetItem = require('../models/ClosetItem');
const { extractFeatures } = require('../services/mlFeatureExtractor');
const axios = require('axios'); // For fetching image from URL if needed
const buildImageUrl = require("../utils/buildImageUrl");
const closetUpload = require("../middlewares/closetUpload");
const { saveClosetWithImage } = require("../controllers/closetController");

/**
 * @swagger
 * tags:
 *   - name: Closet
 *     description: Closet item management and AI feature extraction APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ClosetItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "67f123abc456def789gh123"
 *         user:
 *           type: string
 *           example: "67f111aaa222bbb333ccc444"
 *         name:
 *           type: string
 *           example: "Blue Denim Jacket"
 *         category:
 *           type: string
 *           example: "Jackets"
 *         image:
 *           type: string
 *           example: "https://example.com/jacket.jpg"
 *         notes:
 *           type: string
 *           example: "Good for casual outings"
 *         color:
 *           type: string
 *           example: "Blue"
 *         occasion:
 *           type: string
 *           example: "Casual"
 *         featureVector:
 *           type: array
 *           items:
 *             type: number
 *       example:
 *         _id: "67f123abc456def789gh123"
 *         user: "67f111aaa222bbb333ccc444"
 *         name: "Blue Denim Jacket"
 *         category: "Jackets"
 *         image: "https://example.com/jacket.jpg"
 *         notes: "Good for casual outings"
 *         color: "Blue"
 *         occasion: "Casual"
 *
 *     ClosetItemCreateRequest:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - image
 *       properties:
 *         userId:
 *           type: string
 *           example: "67f111aaa222bbb333ccc444"
 *         user:
 *           type: string
 *           example: "67f111aaa222bbb333ccc444"
 *         name:
 *           type: string
 *           example: "Blue Denim Jacket"
 *         category:
 *           type: string
 *           example: "Jackets"
 *         image:
 *           type: string
 *           example: "https://example.com/jacket.jpg"
 *         notes:
 *           type: string
 *           example: "Good for casual outings"
 *         color:
 *           type: string
 *           example: "Blue"
 *         occasion:
 *           type: string
 *           example: "Casual"
 *
 *     ClosetItemUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Black Denim Jacket"
 *         category:
 *           type: string
 *           example: "Jackets"
 *         image:
 *           type: string
 *           example: "https://example.com/black-jacket.jpg"
 *         notes:
 *           type: string
 *           example: "Updated notes"
 *         color:
 *           type: string
 *           example: "Black"
 *         occasion:
 *           type: string
 *           example: "Party"
 *
 *     ClosetTrainRequest:
 *       type: object
 *       required:
 *         - itemId
 *       properties:
 *         itemId:
 *           type: string
 *           example: "67f123abc456def789gh123"
 *
 *     ClosetTrainResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         featureVectorDim:
 *           type: integer
 *           example: 1280
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
 * /api/closet:
 *   get:
 *     summary: Get all closet items
 *     description: Optionally filter closet items by userId, category, and search term.
 *     tags: [Closet]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: User ID to filter closet items
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: false
 *         description: Category name to filter items
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search by item name
 *     responses:
 *       200:
 *         description: Closet items fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClosetItem'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// @route   GET /api/closet
// @desc    Get all closet items (optionally filter by user if we passed userId in query)
// GET /api/closet
router.get("/", async (req, res) => {
  try {
    const { userId, search, category, subCategory, type } = req.query;

    const query = {};

    if (userId) query.user = userId;
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (type) query.type = type;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { subCategory: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { occasion: { $regex: search, $options: "i" } },
      ];
    }

    const items = await ClosetItem.find(query).sort({ createdAt: -1 });

    const normalizedItems = items.map((item) => ({
      _id: item._id,
      closetID: item.closetID ?? null,
      user: item.user ?? null,
      name: item.name ?? null,
      category: item.category ?? null,
      subCategory: item.subCategory ?? null,
      type: item.type ?? null,
      color: item.color ?? null,
      colors: Array.isArray(item.colors) ? item.colors : [],
      image: buildImageUrl(item.image),
      notes: item.notes ?? null,
      occasion: item.occasion ?? null,
      sizes: Array.isArray(item.sizes) ? item.sizes : [],
      style_tags: Array.isArray(item.style_tags) ? item.style_tags : [],
      season_tags: Array.isArray(item.season_tags) ? item.season_tags : [],
      material: item.material ?? null,
      fit: item.fit ?? null,
      weather_tag: item.weather_tag ?? null,
      pattern: item.pattern ?? null,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 0),
      rating: Number(item.rating || 0),
      reviewsCount: Number(item.reviewsCount || 0),
      isNewArrival: Boolean(item.isNewArrival),
      isActive: Boolean(item.isActive),
      createdAt: item.createdAt ?? null,
      updatedAt: item.updatedAt ?? null,
      // featureVector intentionally omitted
    }));

    res.json(normalizedItems);
  } catch (error) {
    console.error("Failed to fetch closet items:", error);
    res.status(500).json({ message: error.message || "Failed to fetch closet items" });
  }
});

module.exports = router;

/**
 * @swagger
 * /api/closet:
 *   post:
 *     summary: Add a new closet item
 *     tags: [Closet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClosetItemCreateRequest'
 *     responses:
 *       201:
 *         description: Closet item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClosetItem'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// @route   POST /api/closet
// @desc    Add item to closet
router.post('/', async (req, res) => {
    const { userId, name, category, image, notes, color, occasion, user } = req.body;

    try {
        const newItem = new ClosetItem({
            user: userId, // might be null/undefined if not enforcing auth
            name,
            category,
            image,
            notes,
            color,
            occasion,
            user,
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
       
/**
 * @swagger
 * /api/closet/{id}:
 *   put:
 *     summary: Update a closet item
 *     tags: [Closet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Closet item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClosetItemUpdateRequest'
 *     responses:
 *       200:
 *         description: Closet item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClosetItem'
 *       404:
 *         description: Item not found
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
// @route   PUT /api/closet/:id
// @desc    Update a closet item
router.put('/:id', async (req, res) => {
    try {
        const item = await ClosetItem.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/closet/{id}:
 *   delete:
 *     summary: Delete a closet item
 *     tags: [Closet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Closet item ID
 *     responses:
 *       200:
 *         description: Closet item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       404:
 *         description: Item not found
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
// @route   DELETE /api/closet/:id
// @desc    Delete closet item
router.delete('/:id', async (req, res) => {
    try {
        const item = await ClosetItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        await item.deleteOne();
        res.json({ message: 'Item removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/closet/train:
 *   post:
 *     summary: Extract visual features for a closet item
 *     description: Fetches the image from URL or base64 image data, extracts AI feature vectors, and stores them in the closet item.
 *     tags: [Closet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClosetTrainRequest'
 *     responses:
 *       200:
 *         description: Feature extraction completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClosetTrainResponse'
 *       400:
 *         description: Unsupported image format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Feature extraction failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// @route   POST /api/closet/train
// @desc    Extract visual features for an item (AI Training trigger)
router.post('/train', async (req, res) => {
    try {
        const { itemId } = req.body;
        const item = await ClosetItem.findById(itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        console.log(`🤖 Training item: ${item.name} (${itemId})`);

        let buffer;
        if (item.image.startsWith('http')) {
            const response = await axios.get(item.image, { responseType: 'arraybuffer' });
            buffer = Buffer.from(response.data);
        } else if (item.image.startsWith('data:image')) {
            const base64Data = item.image.split(',')[1];
            buffer = Buffer.from(base64Data, 'base64');
        } else {
            return res.status(400).json({ message: 'Unsupported image format' });
        }

        const features = await extractFeatures(buffer);
        item.featureVector = features;
        await item.save();

        res.json({ success: true, featureVectorDim: features.length });
    } catch (error) {
        console.error('❌ Closet training failed:', error);
        res.status(500).json({ message: error.message });
    }
});





/**
 * @swagger
 * /api/closet/save:
 *   post:
 *     summary: Save a closet item with image upload
 *     tags:
 *       - Closet
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *               - user
 *               - name
 *               - category
 *               - type
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               user:
 *                 type: string
 *                 example: "69ca3fffc879a915a49eb138"
 *               name:
 *                 type: string
 *                 example: "White T-Shirt"
 *               category:
 *                 type: string
 *                 example: "Men"
 *               type:
 *                 type: string
 *                 example: "Top"
 *               color:
 *                 type: string
 *                 example: "#FFFFFF"
 *               occasion:
 *                 type: string
 *                 example: "[\"casual\",\"party\"]"
 *               season_tags:
 *                 type: string
 *                 example: "[\"Summer\"]"
 *               material:
 *                 type: string
 *                 example: "Cotton"
 *               fit:
 *                 type: string
 *                 example: "Regular"
 *               weather_tag:
 *                 type: string
 *                 example: "Hot"
 *               notes:
 *                 type: string
 *                 example: "Basic white t-shirt for daily wear"
 *     responses:
 *       201:
 *         description: Closet item saved successfully
 *       500:
 *         description: Failed to save closet item
 */
router.post("/save", closetUpload.single("image"), saveClosetWithImage);

module.exports = router;
