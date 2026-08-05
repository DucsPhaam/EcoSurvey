/**
 * @module FAQModel
 * @description Định nghĩa lược đồ các câu hỏi thường gặp (Bảng `faqs`), hỗ trợ tra cứu trực tiếp và làm tri thức cho Gemini AI Chatbot.
 * 
 * @implementation
 * - Bước 1: Khai báo cột `question` (câu hỏi) và `answer` (câu trả lời).
 * - Bước 2: Khai báo `category` (phân loại chủ đề) và `is_active` (trạng thái kích hoạt hiển thị).
 * 
 * @relations
 * - Controller liên quan: `faqController.js`, `aiController.js` (RAG tri thức cho Chatbot AI).
 * - Frontend UI: `FAQChatWidget.jsx`, `LandingPage.jsx`, `FAQManagement.jsx`.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FAQ = sequelize.define('faqs', {
  id:        { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  question:  { type: DataTypes.TEXT, allowNull: false },
  answer:    { type: DataTypes.TEXT, allowNull: false },
  category:  { type: DataTypes.STRING(100), allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = FAQ;
