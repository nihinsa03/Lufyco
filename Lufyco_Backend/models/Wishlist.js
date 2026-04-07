const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Optional for now
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: false, // Optional if we just store raw details
        },
        // Store snapshot of details so we can display even if product is deleted or just loose reference
        title: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
