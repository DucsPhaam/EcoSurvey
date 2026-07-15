/**
 * TASK 2.3 — Survey + Submit test suite
 * TC-07: GET /api/surveys — authenticated, returns only Published surveys
 * TC-08: GET /api/surveys — unauthenticated → 401
 * TC-09: GET /api/surveys/:id — returns survey detail with questions
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes, Op } = require('sequelize');

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(),
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
  email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  email_verify_token: { type: DataTypes.STRING, allowNull: true },
  reset_password_token: { type: DataTypes.STRING, allowNull: true },
  reset_password_expires: { type: DataTypes.DATE, allowNull: true },
}, { freezeTableName: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const Survey = testDb.define('surveys', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title:       { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT, allowNull: true },
  status:      { type: DataTypes.STRING, defaultValue: 'Draft' },
  target_role: { type: DataTypes.STRING, defaultValue: 'All' },
  start_date:  { type: DataTypes.DATE, allowNull: true },
  end_date:    { type: DataTypes.DATE, allowNull: true },
  created_by:  { type: DataTypes.INTEGER, allowNull: true },
  points_reward: { type: DataTypes.INTEGER, defaultValue: 10 },
}, { freezeTableName: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const Question = testDb.define('questions', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  survey_id:   { type: DataTypes.INTEGER },
  question_text: { type: DataTypes.TEXT },
  question_type: { type: DataTypes.STRING, defaultValue: 'Single_Choice' },
  options:     { type: DataTypes.TEXT, allowNull: true },
  is_required: { type: DataTypes.BOOLEAN, defaultValue: true },
  order_num:   { type: DataTypes.INTEGER, defaultValue: 0 },
}, { freezeTableName: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const SurveyResponse = testDb.define('survey_responses', {
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  survey_id: { type: DataTypes.INTEGER },
  user_id:   { type: DataTypes.INTEGER },
  score:     { type: DataTypes.INTEGER, allowNull: true },
  opinion_text: { type: DataTypes.TEXT, allowNull: true },
}, { freezeTableName: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const RefreshToken = testDb.define('refresh_tokens', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:    { type: DataTypes.INTEGER },
  token_hash: { type: DataTypes.STRING },
  expires_at: { type: DataTypes.DATE },
  revoked:    { type: DataTypes.BOOLEAN, defaultValue: false },
}, { freezeTableName: true, createdAt: 'created_at', updatedAt: false });

Survey.hasMany(Question, { foreignKey: 'survey_id', as: 'questions' });
Question.belongsTo(Survey, { foreignKey: 'survey_id' });
Survey.hasMany(SurveyResponse, { foreignKey: 'survey_id', as: 'responses' });
Survey.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

jest.doMock('../src/models', () => ({
  User, Survey, Question, SurveyResponse, RefreshToken,
  sequelize: testDb,
  Op,
}));
jest.doMock('../src/config/database', () => ({
  sequelize: testDb,
  Sequelize: require('sequelize').Sequelize,
}));

let app;
let studentToken;
let testUser;

beforeAll(async () => {
  await testDb.sync({ force: true });
  app = require('../src/server');

  // Create test user
  testUser = await User.create({
    full_name: 'Survey Tester', username: 'surveytester',
    email: 'survey@test.com', password_hash: 'hash', role: 'Student', status: 'Approved',
  });

  studentToken = jwt.sign(
    { user_id: testUser.id, role: 'Student', full_name: 'Survey Tester' },
    process.env.JWT_SECRET || 'test_jwt_secret_very_long_value_for_testing_only',
    { expiresIn: '1h' }
  );
});

afterAll(async () => { await testDb.close(); });

afterEach(async () => { await Survey.destroy({ where: {} }); });

// ─────────────────────────────────────────────────────────────
describe('GET /api/surveys', () => {
  beforeEach(async () => {
    const future = new Date(Date.now() + 86400000);
    await Survey.bulkCreate([
      { title: 'Published Survey', status: 'Published', target_role: 'All', end_date: future, created_by: testUser.id },
      { title: 'Draft Survey',     status: 'Draft',     target_role: 'All', end_date: future, created_by: testUser.id },
    ]);
  });

  // TC-07
  test('TC-07: Authenticated → returns only Published surveys', async () => {
    const res = await request(app)
      .get('/api/surveys')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.surveys).toBeDefined();
    const titles = res.body.surveys.map(s => s.title);
    expect(titles).toContain('Published Survey');
    expect(titles).not.toContain('Draft Survey');
  });

  // TC-08
  test('TC-08: Unauthenticated → returns 401', async () => {
    const res = await request(app).get('/api/surveys');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────
describe('GET /api/surveys/:id', () => {
  // TC-09
  test('TC-09: Returns survey detail with questions', async () => {
    const survey = await Survey.create({
      title: 'Detail Survey', status: 'Published', target_role: 'All',
      end_date: new Date(Date.now() + 86400000), created_by: testUser.id,
    });
    await Question.create({
      survey_id: survey.id, question_text: 'Q1?', question_type: 'Text', order_num: 1,
    });

    const res = await request(app)
      .get(`/api/surveys/${survey.id}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.survey).toBeDefined();
    expect(res.body.survey.questions).toHaveLength(1);
    expect(res.body.survey.questions[0].question_text).toBe('Q1?');
  });
});
