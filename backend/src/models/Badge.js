const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Badge = sequelize.define('badges', {
  id:               { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name:             { type: DataTypes.STRING(100), allowNull: false },
  icon_emoji:       { type: DataTypes.STRING(20), allowNull: false }, // Increased to 20 for complex emojis
  description:      { type: DataTypes.STRING(255), allowNull: false },
  condition_type:   { type: DataTypes.ENUM('SURVEY_COUNT', 'PARTICIPATION_COUNT', 'TOTAL_POINTS', 'LEADERBOARD_RANK', 'ECO_SURVEY_COUNT', 'HIGH_RATING_COUNT'), allowNull: false },
  condition_value:  { type: DataTypes.INTEGER, allowNull: false },
}, {
  timestamps: false,
});

module.exports = Badge;
