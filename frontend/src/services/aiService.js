/**
 * @module AIServiceFrontend
 * @description Dịch vụ API phía Frontend gửi yêu cầu hỏi đáp AI cho Chatbot.
 * 
 * @relations
 * - Backend: `backend/src/routes/aiRoutes.js`, `backend/src/controllers/aiController.js`.
 * - UI Components: `FAQChatWidget.jsx`, `LandingChatWidget.jsx`.
 */
import api from './axiosInstance'

export const aiService = {
  askFAQ: (question) => api.post('/ai/faqs', { question }),
  askPublicFAQ: (question) => api.post('/ai/faqs/public', { question }),
}
