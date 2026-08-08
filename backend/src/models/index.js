// Index model: Loads all Sequelize models and defines table associations (hasMany, belongsTo, belongsToMany).
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

// ── Model Associations ─────────────────────
User.hasMany(RefreshToken,     { foreignKey: 'user_id', as: 'refreshTokens' });
User.hasMany(Survey,           { foreignKey: 'created_by', as: 'surveys' });
User.hasMany(SurveyResponse,   { foreignKey: 'user_id', as: 'surveyResponses' });
User.hasMany(Participation,    { foreignKey: 'user_id', as: 'participations' });
User.hasMany(PointLog,         { foreignKey: 'user_id', as: 'pointLogs' });
User.hasMany(Notification,     { foreignKey: 'user_id', as: 'notifications' });
User.belongsToMany(Badge,      { through: UserBadge, foreignKey: 'user_id', as: 'badges' });

RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ── Model Associations ─────────────────────
Survey.belongsTo(User,         { foreignKey: 'created_by', as: 'creator' });
Survey.hasMany(Question,       { foreignKey: 'survey_id', as: 'questions' });
Survey.hasMany(SurveyResponse, { foreignKey: 'survey_id', as: 'responses' });

// ── Model Associations ─────────────────────
Question.belongsTo(Survey,     { foreignKey: 'survey_id', as: 'survey' });
Question.hasMany(SurveyAnswer, { foreignKey: 'question_id', as: 'answers' });

// ── Model Associations ─────────────────────
SurveyResponse.belongsTo(Survey, { foreignKey: 'survey_id', as: 'survey' });
SurveyResponse.belongsTo(User,   { foreignKey: 'user_id', as: 'user' });
SurveyResponse.hasMany(SurveyAnswer, { foreignKey: 'response_id', as: 'answers' });

// ── Model Associations ─────────────────────
SurveyAnswer.belongsTo(SurveyResponse, { foreignKey: 'response_id', as: 'response' });
SurveyAnswer.belongsTo(Question,       { foreignKey: 'question_id', as: 'question' });

// ── Model Associations ─────────────────────
Participation.belongsTo(User,             { foreignKey: 'user_id', as: 'user' });
Participation.belongsTo(User,             { foreignKey: 'reviewed_by', as: 'reviewer' });
Participation.hasMany(ParticipationFile,  { foreignKey: 'participation_id', as: 'files' });

ParticipationFile.belongsTo(Participation, { foreignKey: 'participation_id', as: 'participation' });

// ── Model Associations ─────────────────────
PointLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ── Model Associations ─────────────────────
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ── Model Associations ─────────────────────
Badge.belongsToMany(User, { through: UserBadge, foreignKey: 'badge_id', as: 'users' });

UserBadge.belongsTo(User,  { foreignKey: 'user_id' });
UserBadge.belongsTo(Badge, { foreignKey: 'badge_id' });

module.exports = {
  User, RefreshToken, Survey, Question,
  SurveyResponse, SurveyAnswer,
  Participation, ParticipationFile,
  PointLog, FAQ, Notification, Badge, UserBadge
};
