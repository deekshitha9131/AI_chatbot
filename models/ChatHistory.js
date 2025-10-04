const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  chatId: {
    type: String,
    unique: true,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  query: {
    type: String,
    required: true
  },
  reply: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  tokens: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

chatHistorySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);