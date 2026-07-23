const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Participation = sequelize.define('participations', {
  id:                { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id:           { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  event_name:        { type: DataTypes.STRING(255), allowNull: false },
  location:          { type: DataTypes.STRING(255), allowNull: false },
  participant_count: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
  description:       { type: DataTypes.TEXT, allowNull: false },
  status:            { type: DataTypes.ENUM('Pending','Approved','Rejected'), defaultValue: 'Pending' },
  ai_summary:        { type: DataTypes.TEXT, allowNull: true },
  reject_reason:     { type: DataTypes.TEXT, allowNull: true },
  reviewed_by:       { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  reviewed_at:       { type: DataTypes.DATE, allowNull: true },
}, {
  indexes: [{ fields: ['user_id'] }, { fields: ['status'] }],
});

module.exports = Participation;
