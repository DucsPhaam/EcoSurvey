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
