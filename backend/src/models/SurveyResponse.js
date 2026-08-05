/**
 * @module SurveyResponseModel
 * @description Định nghĩa lược đồ bản ghi lượt nộp bài khảo sát (Bảng `survey_responses`), lưu giữ thời điểm nộp bài và điểm số đánh giá ý kiến của Admin.
 * 
 * @implementation
 * - Bước 1: Đặt các cột khóa ngoại `survey_id` (khảo sát được trả lời) và `user_id` (người thực hiện khảo sát).
 * - Bước 2: Lưu thời điểm hoàn thành `submitted_at`.
 * - Bước 3: Đặt cột `opinion_score` (điểm chấm ý kiến đóng góp từ 0 đến 10 do Admin chấm thủ công).
 * - Bước 4: Đặt chỉ mục duy nhất `unique: true` trên cặp cột `['survey_id', 'user_id']` để đảm bảo mỗi người dùng chỉ được thực hiện khảo sát 1 lần.
 * 
 * @relations
 * - Controller liên quan: `surveyController.js`, `adminController.js` (chấm điểm khảo sát), `exportController.js`.
 * - Các bảng liên kết: `Survey`, `User`, `SurveyAnswer` (chi tiết câu trả lời từng câu hỏi).
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SurveyResponse = sequelize.define('survey_responses', {
  id:            { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  survey_id:     { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  user_id:       { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  submitted_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  opinion_score: { type: DataTypes.TINYINT.UNSIGNED, allowNull: true, defaultValue: null },
}, {
  updatedAt: false,
  createdAt: false,
  indexes: [
    { unique: true, fields: ['survey_id', 'user_id'] },
    { fields: ['survey_id'] },
    { fields: ['user_id'] },
  ],
});

module.exports = SurveyResponse;
