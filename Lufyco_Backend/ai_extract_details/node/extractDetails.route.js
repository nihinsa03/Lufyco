const express = require("express");
const uploadMemory = require("./uploadMemory");
const { extractDetailsController } = require("./extractDetails.controller");

const router = express.Router();

/**
 * @swagger
 * /api/ai-new/extract-details:
 *   post:
 *     summary: Extract clothing color and type from an uploaded image
 *     tags:
 *       - AI New
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
 *                 description: Clothing image file to analyze
 *     responses:
 *       200:
 *         description: Clothing details extracted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 color:
 *                   type: string
 *                   example: "#FFFFFF"
 *                 type:
 *                   type: string
 *                   example: "T-Shirt"
 *                 confidence:
 *                   type: number
 *                   example: 0.87
 *       400:
 *         description: Bad request - image file is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Image file is required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to extract clothing details
 */
router.post(
  "/extract-details",
  uploadMemory.single("image"),
  extractDetailsController
);

module.exports = router;