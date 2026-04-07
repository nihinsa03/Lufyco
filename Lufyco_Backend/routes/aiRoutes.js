const express = require('express');
const router = express.Router();
const {
    upload,
    imageSearch,
    extractImageDetails,
    recommendOutfit,
    getSavedLooks,
    saveLook,
    deleteSavedLook,
    saveMyLook,
    getSavedLooksByUser,
    deleteSavedLookById,
    getUpcomingSavedLooks,
    getFeatures
} = require('../controllers/aiController');


/**
 * @swagger
 * tags:
 *   - name: AI
 *     description: AI image search, feature extraction, outfit recommendation, and saved looks APIs
 */

/**
 * @swagger
 * /api/ai/image-search:
 *   post:
 *     summary: Search products using an uploaded image
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Matching products returned successfully
 *       400:
 *         description: Invalid request or image missing
 *       500:
 *         description: Server error
 */
// @route   POST /api/ai/image-search
// @desc    Search products by uploaded image
// @access  Public
router.post('/image-search', upload.single('image'), imageSearch);

/**
 * @swagger
 * /api/ai/extract-details:
 *   post:
 *     summary: Extract clothing details from an uploaded image
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image details extracted successfully
 *       400:
 *         description: Invalid request or image missing
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// @route   POST /api/ai/extract-details
// @desc    Extract features from image
// @access  Private
router.post('/extract-details', upload.single('image'), extractImageDetails);

/**
 * @swagger
 * /api/ai/recommend-outfit:
 *   post:
 *     summary: Generate outfit recommendations
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "67f123abc456def789gh123"
 *               mood:
 *                 type: string
 *                 example: "happy"
 *               occasion:
 *                 type: string
 *                 example: "party"
 *               weather:
 *                 type: string
 *                 example: "rainy"
 *               style:
 *                 type: string
 *                 example: "casual"
 *     responses:
 *       200:
 *         description: Outfit recommendation generated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// @route   POST /api/ai/recommend-outfit
// @desc    Generate outfit recommendation
// @access  Private (userId in body for now)
router.post("/recommend-outfit", recommendOutfit);

/**
 * @swagger
 * /api/ai/saved-looks:
 *   get:
 *     summary: Get saved outfit looks
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Saved looks fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// @route   GET /api/ai/saved-looks
// @desc    Get user's saved outfits
// @access  Private
router.get('/saved-looks', getSavedLooks);

/**
 * @swagger
 * /api/ai/saved-looks:
 *   post:
 *     summary: Save an outfit combination
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "67f123abc456def789gh123"
 *               outfit:
 *                 type: array
 *                 items:
 *                   type: object
 *               title:
 *                 type: string
 *                 example: "Weekend Casual Look"
 *     responses:
 *       201:
 *         description: Outfit saved successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// @route   POST /api/ai/saved-looks
// @desc    Save outfit combination
// @access  Private
router.post('/saved-looks', saveLook);

/**
 * @swagger
 * /api/ai/saved-looks/{id}:
 *   delete:
 *     summary: Delete a saved outfit look
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Saved look ID
 *     responses:
 *       200:
 *         description: Saved look deleted successfully
 *       404:
 *         description: Saved look not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// @route   DELETE /api/ai/saved-looks/:id
// @desc    Delete saved outfit
// @access  Private
router.delete('/saved-looks/:id', deleteSavedLook);


/**
 * @swagger
 * /api/ai/saved-my-looks:
 *   post:
 *     summary: Save a look to my personal looks
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "67f123abc456def789gh123"
 *               title:
 *                 type: string
 *                 example: "Office Look"
 *               date:
 *                 type: string
 *                 example: "2026-03-28"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: My look saved successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/saved-my-looks', saveMyLook);


/**
 * @swagger
 * /api/ai/saved-my-looks:
 *   get:
 *     summary: Get saved my looks by user
 *     tags: [AI]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: User ID
 *     responses:
 *       200:
 *         description: My saved looks fetched successfully
 *       500:
 *         description: Server error
 */
router.get('/saved-my-looks', getSavedLooksByUser);


/**
 * @swagger
 * /api/ai/saved-my-looks/{id}:
 *   delete:
 *     summary: Delete a saved my look by ID
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Saved my look ID
 *     responses:
 *       200:
 *         description: Saved my look deleted successfully
 *       404:
 *         description: Saved my look not found
 *       500:
 *         description: Server error
 */
router.delete('/saved-my-looks/:id', deleteSavedLookById);


/**
 * @swagger
 * /api/ai/my-upcomming:
 *   get:
 *     summary: Get upcoming saved looks
 *     tags: [AI]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: User ID
 *     responses:
 *       200:
 *         description: Upcoming saved looks fetched successfully
 *       500:
 *         description: Server error
 */
router.get('/my-upcomming', getUpcomingSavedLooks);

/**
 * @swagger
 * /api/ai/extract-feature:
 *   get:
 *     summary: Get extracted image features
 *     tags: [AI]
 *     parameters:
 *       - in: query
 *         name: imageUrl
 *         schema:
 *           type: string
 *         required: false
 *         description: Image URL or other feature source input
 *     responses:
 *       200:
 *         description: Features fetched successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.get('/extract-feature', getFeatures);

module.exports = router;
