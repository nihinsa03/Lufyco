const mongoose = require("mongoose");

const savedMyLooksSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    category: { type: String, required: true },
    occasion: { type: String, required: true },
    mood: { type: String, required: true },
    weather: { type: String, required: true },
    timeNeed: { type: String, required: true },
    selectedDate: { type: Date, required: true },
    items: { type: Array, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SavedMyLooks", savedMyLooksSchema);