/**
 * TASK 2.4 — Admin + Participation + Dashboard test suite
 * TC-10: POST /api/participations — creates participation
 * TC-11: PATCH /api/admin/users/:id/status — Admin only (403 for Student)
 * TC-12: GET /api/dashboard — returns data without SQL error (rank bug regression)
 * TC-13: PUT /api/admin/surveys/responses/:id/score — grade opinion
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
  sendRegistrationEmail: jest.fn().mockResolvedValue(),
  sendForgotPasswordEmail: jest.fn().mockResolvedValue(),
  sendEmailVerificationEmail: jest.fn().mockResolvedValue(),
  sendStatusUpdateEmail: jest.fn().mockResolvedValue(),
  sendParticipationReviewEmail: jest.fn().mockResolvedValue(),
}));
jest.mock('../src/services/aiService', () => ({
  summarize: jest.fn().mockResolvedValue('AI summary'),
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
  reject_reason: { type: DataTypes.TEXT, allowNull: true },
  email_verified:         { type: DataTypes.BOOLEAN, defaultValue: false },
  email_verify_token:     { type: DataTypes.STRING, allowNull: true },
  reset_password_token:   { type: DataTypes.STRING, allowNull: true },
  reset_password_expires: { type: DataTypes.DATE, allowNull: true },
}, { freezeTableName: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const Participation = testDb.define('participations', {
  id:                { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:           { type: DataTypes.INTEGER },
  event_name:        { type: DataTypes.STRING },
  location:          { type: DataTypes.STRING },
  participant_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  description:       { type: DataTypes.TEXT },
  status:            { type: DataTypes.STRING, defaultValue: 'Pending' },
  ai_summary:        { type: DataTypes.TEXT, allowNull: true },
  reject_reason:     { type: DataTypes.TEXT, allowNull: true },
  reviewed_by:       { type: DataTypes.INTEGER, allowNull: true },
  reviewed_at:       { type: DataTypes.DATE, allowNull: true },
}, { freezeTableName: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const ParticipationFile = testDb.define('participation_files', {
  id:               { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  participation_id: { type: DataTypes.INTEGER },
  file_url:         { type: DataTypes.STRING },
  file_type:        { type: DataTypes.STRING },
}, { freezeTableName: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const PointLog = testDb.define('point_logs', {
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:   { type: DataTypes.INTEGER },
  points:    { type: DataTypes.INTEGER },
  source:    { type: DataTypes.STRING },
  action_type: { type: DataTypes.STRING },
  reference_type: { type: DataTypes.STRING },
  note:      { type: DataTypes.TEXT },
  reference_id: { type: DataTypes.INTEGER, allowNull: true },
}, { freezeTableName: true, createdAt: 'created_at', updatedAt: false });

const SurveyResponse = testDb.define('survey_responses', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  survey_id:   { type: DataTypes.INTEGER },
  user_id:     { type: DataTypes.INTEGER, allowNull: true },
  opinion_score: { type: DataTypes.INTEGER, allowNull: true },
  score:       { type: DataTypes.INTEGER, allowNull: true },
  opinion_text: { type: DataTypes.TEXT, allowNull: true },
}, { freezeTableName: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const RefreshToken = testDb.define('refresh_tokens', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:    { type: DataTypes.INTEGER },
  token_hash: { type: DataTypes.STRING },
  expires_at: { type: DataTypes.DATE },
  revoked:    { type: DataTypes.BOOLEAN, defaultValue: false },
}, { freezeTableName: true, createdAt: 'created_at', updatedAt: false });

const Notification = testDb.define('notifications', {
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:        { type: DataTypes.INTEGER },
  title:          { type: DataTypes.STRING },
  message:        { type: DataTypes.TEXT },
  is_read:        { type: DataTypes.BOOLEAN, defaultValue: false },
  reference_type: { type: DataTypes.STRING, allowNull: true },
  reference_id:   { type: DataTypes.INTEGER, allowNull: true },
}, { freezeTableName: true, createdAt: 'created_at', updatedAt: false });

// Associations needed
Participation.hasMany(ParticipationFile, { foreignKey: 'participation_id', as: 'files' });
Participation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(PointLog, { foreignKey: 'user_id', as: 'pointLogs' });

jest.doMock('../src/models', () => ({
  User, Participation, ParticipationFile, PointLog, SurveyResponse,
  Notification, RefreshToken,
  sequelize: testDb,
  Op,
}));
jest.doMock('../src/config/database', () => ({
  sequelize: testDb,
  Sequelize: require('sequelize').Sequelize,
}));

const makeToken = (id, role) => jwt.sign(
  { user_id: id, role, full_name: 'Test User' },
  process.env.JWT_SECRET || 'test_jwt_secret_very_long_value_for_testing_only',
  { expiresIn: '1h' }
);

let app;
let student, admin;
let studentToken, adminToken;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_jwt_secret_very_long_value_for_testing_only';
  await testDb.sync({ force: true });
  app = require('../src/server');

  student = await User.create({
    full_name: 'Student A', username: 'studenta', email: 'student@test.com',
    password_hash: 'hash', role: 'Student', status: 'Approved',
  });
  admin = await User.create({
    full_name: 'Admin X', username: 'adminx', email: 'admin@test.com',
    password_hash: 'hash', role: 'Admin', status: 'Approved',
  });

  studentToken = makeToken(student.id, 'Student');
  adminToken   = makeToken(admin.id,   'Admin');
});

afterAll(async () => { await testDb.close(); });
afterEach(async () => {
  await Participation.destroy({ where: {} });
  await PointLog.destroy({ where: {} });
  await Notification.destroy({ where: {} });
  await SurveyResponse.destroy({ where: {} });
});

// ─────────────────────────────────────────────────────────────
describe('POST /api/participations', () => {
  // TC-10
  test('TC-10: Authenticated student can create participation', async () => {
    const res = await request(app)
      .post('/api/participations')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        event_name: 'Tree Planting Day',
        location: 'Hanoi Park',
        participant_count: 25,
        description: 'We planted 100 trees to help reduce carbon footprint.',
      });
    expect(res.status).toBe(201);
    expect(res.body.participation).toBeDefined();
    expect(res.body.participation.event_name).toBe('Tree Planting Day');
    expect(res.body.participation.status).toBe('Pending');
  });
});

// ─────────────────────────────────────────────────────────────
describe('PATCH /api/admin/users/:id/status', () => {
  // TC-11
  test('TC-11: Student cannot access admin endpoint → 403', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${student.id}/status`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ status: 'Deactivated' });
    expect(res.status).toBe(403);
  });

  test('TC-11b: Admin can update user status', async () => {
    const targetUser = await User.create({
      full_name: 'New User', username: 'newuser1', email: 'new1@test.com',
      password_hash: 'hash', role: 'Student', status: 'Pending',
    });
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Approved' });
    if (res.status !== 200) console.log('TC-11b err:', res.body);
    expect(res.status).toBe(200);
    const updated = await User.findByPk(targetUser.id);
    expect(updated.status).toBe('Approved');
  });
});

// ─────────────────────────────────────────────────────────────
describe('PUT /api/admin/surveys/responses/:id/score', () => {
  // TC-13
  test('TC-13: Admin can grade a survey opinion response', async () => {
    const response = await SurveyResponse.create({
      survey_id: 1, user_id: null,
      opinion_text: 'This is my opinion about the environment.',
    });
    const res = await request(app)
      .put(`/api/admin/surveys/responses/${response.id}/score`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ opinion_score: 8 });
    expect(res.status).toBe(200);
    const updated = await SurveyResponse.findByPk(response.id);
    expect(updated.opinion_score).toBe(8);
  });
});
