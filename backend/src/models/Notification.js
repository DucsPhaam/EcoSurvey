const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('notifications', {
  id:             { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id:        { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  title:          { type: DataTypes.STRING(255), allowNull: false },
  message:        { type: DataTypes.TEXT, allowNull: false },
  is_read:        { type: DataTypes.BOOLEAN, defaultValue: false },
  reference_type: { type: DataTypes.STRING(50), allowNull: true },
  reference_id:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
}, {
  updatedAt: false,
  indexes: [{ fields: ['user_id'] }, { fields: ['is_read'] }],
});

module.exports = Notification;
