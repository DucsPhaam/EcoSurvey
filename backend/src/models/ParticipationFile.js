const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ParticipationFile = sequelize.define('participation_files', {
  id:               { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  participation_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  file_url:         { type: DataTypes.STRING(500), allowNull: false },
  file_name:        { type: DataTypes.STRING(255), allowNull: false },
  file_type:        { type: DataTypes.STRING(100), allowNull: true },
  file_size:        { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
}, {
  updatedAt: false,
  indexes: [{ fields: ['participation_id'] }],
});

module.exports = ParticipationFile;
