/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  // Don't auto-clear mocks between tests — auth tests manage state manually
  clearMocks: false,
  resetMocks: false,
  restoreMocks: false,
  // Run tests serially to avoid DB conflicts
  maxWorkers: 1,
  testTimeout: 30000,
};
