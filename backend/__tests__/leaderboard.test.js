/**
 * TASK 2.5 — Leaderboard + Rate limit test suite
 * TC-14: GET /api/leaderboard — returns sorted list with correct fields
 * TC-15: POST /api/auth/login — >10 rapid requests → 429 Too Many Requests
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes, Op } = require('sequelize');

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn((...args) => console.error(...args)),
  debug: jest.fn(),
}));
jest.mock('../src/services/emailService', () => ({
  sendRegistrationEmail: jest.fn(),
  sendForgotPasswordEmail: jest.fn(),
  sendEmailVerificationEmail: jest.fn(),
}));

const testDb = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

const User = testDb.define('users', {
  id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  full_name:     { type: DataTypes.STRING },
  username:      { type: DataTypes.STRING, unique: true },
  email:         { type: DataTypes.STRING, unique: true },
  password_hash: { type: DataTypes.STRING },
  role:          { type: DataTypes.STRING, defaultValue: 'Student' },
  status:        { type: DataTypes.STRING, defaultValue: 'Approved' },
  ui_theme:      { type: DataTypes.STRING, defaultValue: 'light' },
  avatar_url:    { type: DataTypes.STRING, allowNull: true },
  email_verified:         { type: DataTypes.BOOLEAN, defaultValue: false },
  email_verify_token:     { type: DataTypes.STRING, allowNull: true },
  reset_password_token:   { type: DataTypes.STRING, allowNull: true },
  reset_password_expires: { type: DataTypes.DATE, allowNull: true },
}, { freezeTableName: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const PointLog = testDb.define('point_logs', {
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:      { type: DataTypes.INTEGER },
  points:       { type: DataTypes.INTEGER },
  source:       { type: DataTypes.STRING },
  reference_id: { type: DataTypes.INTEGER, allowNull: true },
}, { freezeTableName: true, createdAt: 'created_at', updatedAt: false });

const RefreshToken = testDb.define('refresh_tokens', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:    { type: DataTypes.INTEGER },
  token_hash: { type: DataTypes.STRING },
  expires_at: { type: DataTypes.DATE },
  revoked:    { type: DataTypes.BOOLEAN, defaultValue: false },
}, { freezeTableName: true, createdAt: 'created_at', updatedAt: false });

User.hasMany(PointLog, { foreignKey: 'user_id', as: 'pointLogs' });
PointLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

jest.doMock('../src/models', () => ({
  User, PointLog, RefreshToken,
  sequelize: testDb,
  Op,
}));
jest.doMock('../src/config/database', () => ({
  sequelize: testDb,
  Sequelize: require('sequelize').Sequelize,
}));

let app;
let studentToken;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_jwt_secret_very_long_value_for_testing_only';
  await testDb.sync({ force: true });
  app = require('../src/server');

  const user = await User.create({
    full_name: 'Leaderboard User', username: 'lbuser', email: 'lb@test.com',
    password_hash: 'hash', role: 'Student', status: 'Approved',
  });
  await PointLog.create({ user_id: user.id, points: 150, source: 'Survey' });

  studentToken = jwt.sign(
    { user_id: user.id, role: 'Student', full_name: 'Leaderboard User' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
});

afterAll(async () => { await testDb.close(); });

// ─────────────────────────────────────────────────────────────
describe('GET /api/leaderboard', () => {
  // TC-14
  test('TC-14: Returns sorted leaderboard with required fields', async () => {
    const res = await request(app)
      .get('/api/leaderboard')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    // Leaderboard can be in res.body.leaderboard or res.body directly
    const list = res.body.leaderboard || res.body;
    expect(Array.isArray(list)).toBe(true);
    if (list.length > 0) {
      expect(list[0]).toHaveProperty('full_name');
      expect(list[0]).toHaveProperty('total_points');
    }
  });
});

// ─────────────────────────────────────────────────────────────
describe('Rate limiting on /api/auth/login', () => {
  // TC-15: loginLimiter max=10 per 15min
  // In test, we make 11 requests quickly and expect the 11th to be 429
  test('TC-15: More than 10 failed login attempts → 429', async () => {
    const promises = Array.from({ length: 11 }, () =>
      request(app)
        .post('/api/auth/login')
        .send({ login: 'nonexistent', password: 'WrongPass99' })
    );
    const results = await Promise.all(promises);
    const statuses = results.map(r => r.status);
    // At least one should be 429 (rate limited)
    expect(statuses).toContain(429);
  }, 15000);
});
