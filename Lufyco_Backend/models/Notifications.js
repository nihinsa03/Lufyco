const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, },
        type: { type: String, required: true },       // e.g., promo, order, wishlist, alert
        title: { type: String, required: true },
        message: { type: String, required: true },
        time: { type: String, required: true },      // e.g., "2 min ago", "Yesterday"
        read: { type: Boolean, default: false },
        icon: { type: String, required: false },     // e.g., "percent", "truck"
        iconColor: { type: String, required: false }, 
        iconBg: { type: String, required: false }
    },
    { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;