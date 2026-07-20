/**
 * Test setup: creates an in-memory SQLite DB and syncs all Sequelize models.
 * This avoids touching the real MySQL database during tests.
 */
const { Sequelize } = require('sequelize');

// Override DB config for testing (SQLite in-memory)
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_very_long_value_for_testing_only';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_testing_only';
process.env.JWT_EXPIRES_IN = '15m';
process.env.CLIENT_URL = 'http://localhost:3000';

const testSequelize = new Sequelize('ecosurvey_test', null, null, {
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
  define: {
    underscored: false,
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports = testSequelize;
