/**
 * @module AIController
 * @description Controller tiếp nhận yêu cầu từ người dùng gửi cho AI Chatbot và sử dụng Gemini AI Service để trả lời thắc mắc.
 * 
 * @function askFAQ
 * @description Tiếp nhận câu hỏi, nạp cơ sở tri thức FAQ và gửi cho `aiService.answerFAQ` xử lý.
 * @param {Object} req - Request chứa `req.body.question`.
 * @param {Object} res - Response chứa câu trả lời `answer`.
 * 
 * @implementation
 * - Bước 1: Kiểm tra tính hợp lệ của `question`.
 * - Bước 2: Truy vấn danh sách tất cả các FAQ đang hoạt động (`is_active: true`).
 * - Bước 3: Gọi `aiService.answerFAQ(question, faqs)` để sinh phản hồi từ Gemini AI.
 * - Bước 4: Trả về kết quả JSON.
 * 
 * @relations
 * - Route: `POST /api/ai/faqs` trong `aiRoutes.js`.
 * - Service: `aiService.js` (`backend/src/services/aiService.js`).
 * - Frontend UI: `FAQChatWidget.jsx`, `LandingChatWidget.jsx`.
 */
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
