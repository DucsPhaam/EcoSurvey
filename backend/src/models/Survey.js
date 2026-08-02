/**
 * @module SurveyModel
 * @description Định nghĩa lược đồ đợt khảo sát (Bảng `surveys`), quản lý tiêu đề, mô tả, đối tượng mục tiêu, thời hạn và trạng thái xuất bản khảo sát.
 * 
 * @implementation
 * - Bước 1: Khai báo các cột chính: `id`, `title`, `description`.
 * - Bước 2: Khai báo nhóm đối tượng mục tiêu `target_role` ('All','Student','Staff').
 * - Bước 3: Khai báo thời gian bắt đầu `start_date` và kết thúc `end_date`.
 * - Bước 4: Khai báo trạng thái vòng đời `status` ('Draft','Published','Closed') và khóa ngoại `created_by` tham chiếu đến User tạo khảo sát.
 * - Bước 5: Đặt các chỉ mục tìm kiếm tối ưu truy vấn trên `status`, `target_role`, `end_date`.
 * 
 * @relations
 * - Controller liên quan: `surveyController.js`, `adminController.js`, `exportController.js`.
 * - Service liên quan: `cronService.js` (tự động chuyển status sang Closed khi hết hạn).
 * - Các bảng liên kết: `User` (người tạo), `Question` (danh sách câu hỏi), `SurveyResponse` (kết quả trả lời).
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Survey = sequelize.define('surveys', {
  id:          { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  title:       { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  target_role: { type: DataTypes.ENUM('All','Student','Staff'), defaultValue: 'All' },
  start_date:  { type: DataTypes.DATE, allowNull: false },
  end_date:    { type: DataTypes.DATE, allowNull: false },
  status:      { type: DataTypes.ENUM('Draft','Published','Closed'), defaultValue: 'Draft' },
  created_by:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
}, {
  indexes: [
    { fields: ['status'] },
    { fields: ['target_role'] },
    { fields: ['end_date'] },
  ],
});

module.exports = Survey;
