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
