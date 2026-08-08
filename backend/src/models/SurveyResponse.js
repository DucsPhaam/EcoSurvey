// SurveyResponse model: Defines survey submission schema (survey_responses table), submission time, and score.
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
