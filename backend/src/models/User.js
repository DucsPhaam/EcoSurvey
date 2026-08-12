// User model: Defines user data schema (users table), auth methods, roles, and status.
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('users', {
  id:               { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  full_name:        { type: DataTypes.STRING(150), allowNull: false },
  username:         { type: DataTypes.STRING(80),  allowNull: false, unique: true },
  email:            { type: DataTypes.STRING(191), allowNull: false, unique: true },
  password_hash:    { type: DataTypes.STRING(255), allowNull: true },
  auth_provider:    { type: DataTypes.ENUM('local', 'google'), defaultValue: 'local' },
  google_id:        { type: DataTypes.STRING(255), allowNull: true, unique: true },
  role:             { type: DataTypes.ENUM('Student','Staff','Admin'), defaultValue: 'Student' },
  status:           { type: DataTypes.ENUM('Pending','Approved','Rejected','Locked','Deactivated'), defaultValue: 'Pending' },
  student_staff_id: { type: DataTypes.STRING(30),  allowNull: true },
  class_name:       { type: DataTypes.STRING(100), allowNull: true },
  department:       { type: DataTypes.STRING(150), allowNull: true },
  joined_date:      { type: DataTypes.DATEONLY,    allowNull: true },
  ui_theme:         { type: DataTypes.ENUM('light','dark'), defaultValue: 'light' },
  avatar_url:       { type: DataTypes.STRING(500), allowNull: true },
  reject_reason:    { type: DataTypes.TEXT,        allowNull: true },
  email_verified:           { type: DataTypes.BOOLEAN,     defaultValue: false },
  email_verify_token:       { type: DataTypes.STRING(255), allowNull: true },
  reset_password_token:     { type: DataTypes.STRING(255), allowNull: true },
  reset_password_expires:   { type: DataTypes.DATE,        allowNull: true },
}, {
  indexes: [{ fields: ['role'] }, { fields: ['status'] }],
});

module.exports = User;
