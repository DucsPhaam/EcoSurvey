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
