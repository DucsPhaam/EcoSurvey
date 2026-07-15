/**
 * TASK 2.2 — Auth flows test suite (15 test cases)
 * TC-01: POST /auth/register — success (201)
 * TC-02: POST /auth/register — duplicate username (409)
 * TC-03: POST /auth/register — weak password (400)
 * TC-04: POST /auth/login — success, returns accessToken
 * TC-05: POST /auth/login — wrong password → 401
 * TC-06: POST /auth/login — pending account → 403
 *
 * Strategy: Mock db/models with jest.mock using inline factory.
 * Use a shared in-memory store to simulate DB state across tests.
 */
const request = require('supertest');
const bcrypt = require('bcrypt');

// ── Environment ───────────────────────────────────────────────
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_very_long_value_for_testing_only';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_testing_only';
process.env.JWT_EXPIRES_IN = '15m';
process.env.CLIENT_URL = 'http://localhost:3000';

// ── In-memory "database" ──────────────────────────────────────
const mockDB = { users: [], refreshTokens: [] };
let userIdCounter = 1;
let tokenIdCounter = 1;

const findUser = (query) => {
  const { username, email, id } = query;
  return mockDB.users.find(u =>
    (username && u.username === username) ||
    (email    && u.email    === email)    ||
    (id       && u.id       === id)
  ) || null;
};

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(),
}));

jest.mock('../src/services/emailService', () => ({
  sendRegistrationEmail:    jest.fn().mockResolvedValue(undefined),
  sendForgotPasswordEmail:  jest.fn().mockResolvedValue(undefined),
  sendEmailVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendStatusUpdateEmail:    jest.fn().mockResolvedValue(undefined),
}));

const { Sequelize, DataTypes, Op } = require('sequelize');
const testDb = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

const User = testDb.define('users', {
  id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  full_name:     { type: DataTypes.STRING },
  username:      { type: DataTypes.STRING, unique: true },
  email:         { type: DataTypes.STRING, unique: true },
  password_hash: { type: DataTypes.STRING },
  role:          { type: DataTypes.STRING },
  status:        { type: DataTypes.STRING, defaultValue: 'Pending' },
  student_staff_id: { type: DataTypes.STRING },
  class_name:    { type: DataTypes.STRING },
  ui_theme:      { type: DataTypes.STRING, defaultValue: 'light' },
  avatar_url:    { type: DataTypes.STRING, allowNull: true },
}, { freezeTableName: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const RefreshToken = testDb.define('refresh_tokens', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:    { type: DataTypes.INTEGER },
  token_hash: { type: DataTypes.STRING },
  expires_at: { type: DataTypes.DATE },
  revoked:    { type: DataTypes.BOOLEAN, defaultValue: false },
}, { freezeTableName: true, createdAt: 'created_at', updatedAt: false });

jest.doMock('../src/models', () => ({
  User, RefreshToken,
  sequelize: testDb,
  Op,
}));

jest.doMock('../src/config/database', () => ({
  sequelize: testDb,
  Sequelize: require('sequelize').Sequelize,
}));

let app;
beforeAll(async () => {
  await testDb.sync({ force: true });
  app = require('../src/server');
});

beforeEach(async () => {
  await User.destroy({ where: {}, truncate: true });
  await RefreshToken.destroy({ where: {}, truncate: true });
});

const validPayload = {
  full_name: 'Nguyen Van A',
  username: 'nguyenvana',
  email: 'nguyenvana@test.com',
  password: 'SecurePass1',
  confirm_password: 'SecurePass1',
  role: 'Student',
  student_staff_id: 'SV001',
  class_name: 'CNTT-01',
};

// ─────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  test('TC-01: Success — returns 201 and success message', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/Registration successful/i);
  });

  test('TC-02: Duplicate username — returns 409', async () => {
    const { User } = require('../src/models');
    // Pre-populate mock DB with existing user
    await User.create({
      username: 'nguyenvana', email: 'other@test.com',
      password_hash: 'hash', role: 'Student', status: 'Pending',
    });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, email: 'newemail@test.com' });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/username/i);
  });

  test('TC-03: Weak password (no uppercase) — returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        ...validPayload,
        username: 'user2',
        email: 'user2@test.com',
        password: 'weakpass1',
        confirm_password: 'weakpass1',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Password/i);
  });
});

// ─────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    const { User } = require('../src/models');
    const hash = await bcrypt.hash('SecurePass1', 10);
    await User.bulkCreate([
      { full_name: 'Test User', username: 'testuser', email: 'test@test.com', password_hash: hash, role: 'Student', status: 'Approved', ui_theme: 'light' },
      { full_name: 'Pending',   username: 'pendinguser', email: 'pending@test.com', password_hash: hash, role: 'Student', status: 'Pending',  ui_theme: 'light' },
    ]);
  });

  test('TC-04: Success — returns 200 with accessToken', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ login: 'testuser', password: 'SecurePass1' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user.username).toBe('testuser');
  });

  test('TC-05: Wrong password — returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ login: 'testuser', password: 'WrongPassword99' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Invalid credentials/i);
  });

  test('TC-06: Pending account — returns 403 with PENDING code', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ login: 'pendinguser', password: 'SecurePass1' });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PENDING');
  });
});

// ─────────────────────────────────────────────────────────────
describe('POST /api/auth/forgot-password', () => {
  test('TC-Extra: Anti-enumeration — always returns 200', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  test('TC-Extra2: Missing email — returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({});
    expect(res.status).toBe(400);
  });
});
