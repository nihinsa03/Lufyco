const mongoose = require("mongoose");

const ClosetItemSchema = new mongoose.Schema(
  {
    closetID: { type: Number },
    user: { type: String, required: true },

    name: { type: String, default: null },
    category: { type: String, default: null },
    image: { type: String, default: null },
    notes: { type: String, default: null },

    color: { type: String, default: null },
    colors: { type: [String], default: [] },

    subCategory: { type: String, default: null },
    type: { type: String, default: null },

    style_tags: { type: [String], default: [] },
    season_tags: { type: [String], default: [] },

    material: { type: String, default: null },
    fit: { type: String, default: null },
    weather_tag: { type: String, default: "All" },
    pattern: { type: String, default: null },

    occasion: {
            type: [String],
            default: [],
        },

    sizes: { type: [String], default: [] },
    featureVector: { type: [Number], default: [] },

    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },

    isNewArrival: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "closetitems",
  }
);

module.exports = mongoose.model("ClosetItem", ClosetItemSchema);