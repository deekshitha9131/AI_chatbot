const express = require('express');
const ChatHistory = require('../models/ChatHistory');
const AdminLog = require('../models/AdminLog');
const User = require('../models/User');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all query logs with filters
router.get('/logs', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, startDate, endDate, model } = req.query;
    
    const filter = {};
    if (userId) filter.userId = userId;
    if (model) filter.model = model;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const logs = await ChatHistory.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email');

    const total = await ChatHistory.countDocuments(filter);

    // Log admin action
    await new AdminLog({
      actionType: 'view_logs',
      performedBy: req.user.userId,
      details: `Viewed query logs with filters: ${JSON.stringify(req.query)}`
    }).save();

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chatbot usage statistics
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const [totalQueries, totalUsers, modelStats, recentActivity] = await Promise.all([
      ChatHistory.countDocuments({ timestamp: { $gte: startDate } }),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      ChatHistory.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        { $group: { _id: '$model', count: { $sum: 1 }, totalTokens: { $sum: '$tokens' } } }
      ]),
      ChatHistory.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Log admin action
    await new AdminLog({
      actionType: 'view_stats',
      performedBy: req.user.userId,
      details: `Viewed statistics for period: ${period}`
    }).save();

    res.json({
      period,
      totalQueries,
      totalUsers,
      modelStats,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;