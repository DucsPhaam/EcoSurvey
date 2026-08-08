// AI controller: Processes user requests for AI Chatbot and provides FAQ assistance and proof summaries via Gemini AI.
const { FAQ } = require('../models');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

exports.askFAQ = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Please provide a valid question.' });
    }

    const faqs = await FAQ.findAll({
      where: { is_active: true },
      attributes: ['question', 'answer', 'category'],
    });

    const answer = await aiService.answerFAQ(question, faqs);
    res.json({ answer, question });
  } catch (err) {
    logger.error('askFAQ error:', err);
    res.status(500).json({ message: 'Failed to get AI response.' });
  }
};
