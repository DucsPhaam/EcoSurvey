/**
 * @module ModelRegistry
 * @description Tệp trung tâm nạp tất cả các Sequelize Model và thiết lập mối quan hệ (associations: hasMany, belongsTo, belongsToMany) giữa các bảng trong CSDL.
 * 
 * @implementation
 * - Bước 1: Import tất cả 13 Sequelize Models trong hệ thống EcoSurvey.
 * - Bước 2: Thiết lập mối quan hệ cho `User` (với RefreshToken, Survey, SurveyResponse, Participation, PointLog, Notification và Badge thông qua UserBadge).
 * - Bước 3: Thiết lập quan hệ phân cấp Khảo sát: `Survey` -> `Question`, `Survey` -> `SurveyResponse` -> `SurveyAnswer`.
 * - Bước 4: Thiết lập quan hệ Minh chứng: `Participation` -> `User` (người nộp & người duyệt) và `Participation` -> `ParticipationFile`.
 * - Bước 5: Thiết lập quan hệ Huy hiệu: `Badge` <-> `User` (nhiều - nhiều thông qua `UserBadge`).
 * - Bước 6: Export tất cả các model để Controller và Service nạp trực tiếp qua `require('../models')`.
 * 
 * @relations
 * - Tất cả Backend Controllers (`adminController`, `authController`, `surveyController`, `participationController`, v.v.) và Services (`badgeService`, `emailService`, v.v.) import các model từ file này.
 */
const User             = require('./User');
const RefreshToken     = require('./RefreshToken');
const Survey           = require('./Survey');
const Question         = require('./Question');
const SurveyResponse   = require('./SurveyResponse');
const SurveyAnswer     = require('./SurveyAnswer');
const Participation    = require('./Participation');
const ParticipationFile= require('./ParticipationFile');
const PointLog         = require('./PointLog');
const FAQ              = require('./FAQ');
const Notification     = require('./Notification');
const Badge            = require('./Badge');
const UserBadge        = require('./UserBadge');

// ── Quan hệ của Model User ──────────────────────────────────────
User.hasMany(RefreshToken,     { foreignKey: 'user_id', as: 'refreshTokens' });
User.hasMany(Survey,           { foreignKey: 'created_by', as: 'surveys' });
User.hasMany(SurveyResponse,   { foreignKey: 'user_id', as: 'surveyResponses' });
User.hasMany(Participation,    { foreignKey: 'user_id', as: 'participations' });
User.hasMany(PointLog,         { foreignKey: 'user_id', as: 'pointLogs' });
User.hasMany(Notification,     { foreignKey: 'user_id', as: 'notifications' });
User.belongsToMany(Badge,      { through: UserBadge, foreignKey: 'user_id', as: 'badges' });

RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ── Quan hệ của Model Survey ────────────────────────────────────
Survey.belongsTo(User,         { foreignKey: 'created_by', as: 'creator' });
Survey.hasMany(Question,       { foreignKey: 'survey_id', as: 'questions' });
Survey.hasMany(SurveyResponse, { foreignKey: 'survey_id', as: 'responses' });

// ── Quan hệ của Model Question ──────────────────────────────────
Question.belongsTo(Survey,     { foreignKey: 'survey_id', as: 'survey' });
Question.hasMany(SurveyAnswer, { foreignKey: 'question_id', as: 'answers' });

// ── Quan hệ của Model SurveyResponse ────────────────────────────
SurveyResponse.belongsTo(Survey, { foreignKey: 'survey_id', as: 'survey' });
SurveyResponse.belongsTo(User,   { foreignKey: 'user_id', as: 'user' });
SurveyResponse.hasMany(SurveyAnswer, { foreignKey: 'response_id', as: 'answers' });

// ── Quan hệ của Model SurveyAnswer ──────────────────────────────
SurveyAnswer.belongsTo(SurveyResponse, { foreignKey: 'response_id', as: 'response' });
SurveyAnswer.belongsTo(Question,       { foreignKey: 'question_id', as: 'question' });

// ── Quan hệ của Model Participation ─────────────────────────────
Participation.belongsTo(User,             { foreignKey: 'user_id', as: 'user' });
Participation.belongsTo(User,             { foreignKey: 'reviewed_by', as: 'reviewer' });
Participation.hasMany(ParticipationFile,  { foreignKey: 'participation_id', as: 'files' });

ParticipationFile.belongsTo(Participation, { foreignKey: 'participation_id', as: 'participation' });

// ── Quan hệ của Model PointLog ──────────────────────────────────
PointLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ── Quan hệ của Model Notification ──────────────────────────────
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ── Quan hệ của Model Badge ─────────────────────────────────────
Badge.belongsToMany(User, { through: UserBadge, foreignKey: 'badge_id', as: 'users' });

UserBadge.belongsTo(User,  { foreignKey: 'user_id' });
UserBadge.belongsTo(Badge, { foreignKey: 'badge_id' });

module.exports = {
  User, RefreshToken, Survey, Question,
  SurveyResponse, SurveyAnswer,
  Participation, ParticipationFile,
  PointLog, FAQ, Notification, Badge, UserBadge
};
