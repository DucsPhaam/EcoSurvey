const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FAQ = sequelize.define('faqs', {
  id:        { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  question:  { type: DataTypes.TEXT, allowNull: false },
  answer:    { type: DataTypes.TEXT, allowNull: false },
  category:  { type: DataTypes.STRING(100), allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = FAQ;
