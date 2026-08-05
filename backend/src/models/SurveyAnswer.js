/**
 * @module SurveyAnswerModel
 * @description Định nghĩa lược đồ câu trả lời chi tiết cho từng câu hỏi (Bảng `survey_answers`).
 * 
 * @implementation
 * - Bước 1: Khai báo khóa ngoại `response_id` (tham chiếu đến bản ghi lượt nộp `survey_responses`).
 * - Bước 2: Khai báo khóa ngoại `question_id` (tham chiếu đến câu hỏi trong `questions`).
 * - Bước 3: Cột `answer_text` lưu giá trị câu trả lời (văn bản hoặc chuỗi phương án đã chọn).
 * - Bước 4: Tắt timestamps và tạo các chỉ mục trên `response_id` và `question_id`.
 * 
 * @relations
 * - Controller liên quan: `surveyController.js`, `adminController.js`, `exportController.js`.
 * - Các bảng liên kết: `SurveyResponse`, `Question`.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SurveyAnswer = sequelize.define('survey_answers', {
  id:          { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  response_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  question_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  answer_text: { type: DataTypes.TEXT, allowNull: true },
}, {
  timestamps: false,
  indexes: [{ fields: ['response_id'] }, { fields: ['question_id'] }],
});

module.exports = SurveyAnswer;
