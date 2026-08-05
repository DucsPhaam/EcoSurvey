/**
 * @module FAQController
 * @description Controller phục vụ truy vấn danh sách câu hỏi thường gặp FAQ dành cho giao diện công khai (Landing Page, FAQ Section).
 * 
 * @function getPublicFAQs
 * @description Lấy tất cả các câu hỏi FAQ công khai đang hoạt động (`is_active: true`) mà không cần đăng nhập.
 * 
 * @relations
 * - Route: `GET /api/faqs/public` trong `faqPublicRoutes.js`.
 * - Frontend: `faqService.getPublicFAQs` từ `FaqItem.jsx` và `LandingPage.jsx`.
 */
const { FAQ } = require('../models');

exports.getPublicFAQs = async (_req, res) => {
  try {
    const faqs = await FAQ.findAll({
      where: { is_active: true },
      attributes: ['id', 'question', 'answer', 'category'],
      order: [['created_at', 'ASC']],
    });
    res.json({ faqs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch FAQs.' });
  }
};
