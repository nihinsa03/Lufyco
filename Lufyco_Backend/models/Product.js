const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        productId: {
            type: Number, 
            index: true,
            unique: true
        },

        seller: {
            type: String,
        },

        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        subCategory: {
            type: String,
        },
        type: {
            type: String,
        },
        gender: {
            type: String,
        },
        compareAtPrice: {
            type: Number,
        },
        colors: {
            type: [String],
        },
        rating: {
            type: Number,
            default: 0,
        },
        reviewsCount: {
            type: Number,
            default: 0,
        },
        featureVector: {
            type: [Number],
            default: []
        },

        occasion: {
            type: [String],
            default: [],
        },

        quantity: {
            type: Number,
            default: 0
        },

        sizes: {
            type: [String],
            default: [],
        },
        style_tags: {
            type: [String],
            default: [],
        },
        season_tags: {
            type: [String],
            default: [],
        },
        material: {
            type: String,
        },
        fit: {
            type: String,
        },
        isNewArrival: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('products', productSchema);

module.exports = Product;