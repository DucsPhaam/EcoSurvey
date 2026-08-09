// Database config: Primary Sequelize ORM database connection configuration.
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Validates required environment variables at startup to prevent silent misconfigurations in production.
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  const required = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`[database] Missing required environment variable: ${key}`);
    }
  }
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ecosurvey',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '12345678',  // fallback only applies in dev/test
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    timezone: '+00:00', // Always store/read DATETIME as UTC
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: false,
      freezeTableName: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

module.exports = { sequelize, Sequelize };
