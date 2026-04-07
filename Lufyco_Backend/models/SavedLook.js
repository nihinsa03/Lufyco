const mongoose = require('mongoose');

const savedLookSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  outfitName: {
    type: String,
    required: true
  },
  occasion: {
    type: String,
    enum: ['Casual', 'Office', 'Party', 'Date', 'Wedding'],
    required: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  eventDate: {
    type: Date
  },
  weather: {
    condition: String,
    temperature: Number
  },
  mood: {
    type: String,
    enum: ['Happy', 'Confident', 'Sad', 'Tired', 'Excited']
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('SavedLook', savedLookSchema);
