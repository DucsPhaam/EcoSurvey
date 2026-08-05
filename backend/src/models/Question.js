/**
 * @module QuestionModel
 * @description Định nghĩa lược đồ câu hỏi của bài khảo sát (Bảng `questions`), hỗ trợ nhiều dạng câu hỏi (Text, Single_Choice, Multiple_Choice) và lưu trữ danh sách phương án dưới dạng JSON.
 * 
 * @implementation
 * - Bước 1: Khai báo cột khóa ngoại `survey_id` liên kết với bảng `surveys`.
 * - Bước 2: Khai báo cột `question_text` nội dung câu hỏi và `question_type` quy định kiểu trả lời.
 * - Bước 3: Cột `options` lưu mảng các phương án lựa chọn theo định dạng JSON.
 * - Bước 4: Khai báo thứ tự hiển thị `order_num` và cờ bắt buộc `is_required`.
 * - Bước 5: Tắt trường `updatedAt` và thiết lập chỉ mục tìm kiếm theo `survey_id`.
 * 
 * @relations
 * - Controller liên quan: `surveyController.js`, `aiController.js` (gợi ý câu hỏi AI).
 * - Các bảng liên kết: `Survey` (thuộc về khảo sát nào), `SurveyAnswer` (chứa các câu trả lời cho câu hỏi này).
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Question = sequelize.define('questions', {
  id:            { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  survey_id:     { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  question_text: { type: DataTypes.TEXT, allowNull: false },
  question_type: { type: DataTypes.ENUM('Text','Single_Choice','Multiple_Choice'), defaultValue: 'Text' },
  options:       { type: DataTypes.JSON, allowNull: true },
  order_num:     { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
  is_required:   { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  updatedAt: false,
  indexes: [{ fields: ['survey_id'] }],
});

module.exports = Question;
