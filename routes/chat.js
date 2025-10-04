const express = require('express');
const ChatHistory = require('../models/ChatHistory');
const aiService = require('../services/aiService');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Send query and get AI response
router.post('/query', authenticate, async (req, res) => {
  try {
    const { query, model } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const aiResponse = await aiService.generateResponse(query, model);
    
    const chatHistory = new ChatHistory({
      userId: req.user.userId,
      query,
      reply: aiResponse.reply,
      model: aiResponse.model,
      tokens: aiResponse.tokens
    });
    
    await chatHistory.save();

    res.json({
      chatId: chatHistory.chatId,
      reply: aiResponse.reply,
      model: aiResponse.model,
      timestamp: chatHistory.timestamp
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat history for user
router.get('/history/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    
    // Users can only access their own history, admins can access any
    if (req.user.role !== 'admin' && req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filter = { userId };
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const history = await ChatHistory.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ChatHistory.countDocuments(filter);

    res.json({
      history,
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

module.exports = router;