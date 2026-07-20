const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserBadge = sequelize.define('user_badges', {
  id:               { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id:          { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  badge_id:         { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  earned_at:        { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false,
  indexes: [
    { unique: true, fields: ['user_id', 'badge_id'] } // A user can only earn a specific badge once
  ]
});

module.exports = UserBadge;
