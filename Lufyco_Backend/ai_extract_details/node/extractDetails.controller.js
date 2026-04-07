const { extractDetailsFromImageBuffer } = require("./extractDetails.service");

async function extractDetailsController(req, res) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        message: "Image file is required",
      });
    }

    const result = await extractDetailsFromImageBuffer(req.file.buffer);

    return res.status(200).json(result);
  } catch (error) {
    console.error("extractDetailsController error:", error);

    return res.status(500).json({
      message: error.message || "Failed to extract clothing details",
    });
  }
}

module.exports = {
  extractDetailsController,
};