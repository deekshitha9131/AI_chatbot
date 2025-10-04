const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    unique: true,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  actionType: {
    type: String,
    required: true,
    enum: ['login', 'view_logs', 'view_stats', 'user_management']
  },
  performedBy: {
    type: String,
    required: true,
    ref: 'User'
  },
  details: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

adminLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AdminLog', adminLogSchema);