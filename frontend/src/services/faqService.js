/**
 * @module FAQServiceFrontend
 * @description Dịch vụ API phía Frontend lấy câu hỏi FAQ công khai cho Landing Page.
 * 
 * @relations
 * - Backend: `backend/src/routes/faqPublicRoutes.js`, `backend/src/controllers/faqController.js`.
 * - UI Components: `LandingPage.jsx`, `FaqItem.jsx`.
 */
import api from './axiosInstance'

export const faqService = {
  getPublicFAQs: () => api.get('/faqs/public'),
}
