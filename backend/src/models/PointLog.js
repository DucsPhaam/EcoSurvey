const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PointLog = sequelize.define('point_logs', {
  id:             { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id:        { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  action_type:    { type: DataTypes.ENUM('Survey_Completion','Event_Report','Bonus','Deduction'), allowNull: false },
  points:         { type: DataTypes.INTEGER, defaultValue: 0 },
  reference_id:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  reference_type: { type: DataTypes.STRING(50), allowNull: true },
  note:           { type: DataTypes.STRING(255), allowNull: true },
}, {
  updatedAt: false,
  indexes: [{ fields: ['user_id'] }, { fields: ['created_at'] }],
});

module.exports = PointLog;
