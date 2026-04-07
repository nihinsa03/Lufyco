const { saveClosetItemWithImage } = require("../services/closetSaveService");

const saveClosetWithImage = async (req, res) => {
  try {
    const closetItem = await saveClosetItemWithImage({
      body: req.body,
      file: req.file,
    });

    return res.status(201).json({
      message: "Closet item saved successfully",
      item: closetItem,
    });
  } catch (error) {
    console.error("saveClosetWithImage error:", error);
    return res.status(500).json({
      message: error.message || "Failed to save closet item",
    });
  }
};

module.exports = {
  saveClosetWithImage,
};