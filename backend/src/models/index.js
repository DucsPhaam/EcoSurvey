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

// ── User associations ─────────────────────────────────────────
User.hasMany(RefreshToken,     { foreignKey: 'user_id', as: 'refreshTokens' });
User.hasMany(Survey,           { foreignKey: 'created_by', as: 'surveys' });
User.hasMany(SurveyResponse,   { foreignKey: 'user_id', as: 'surveyResponses' });
User.hasMany(Participation,    { foreignKey: 'user_id', as: 'participations' });
User.hasMany(PointLog,         { foreignKey: 'user_id', as: 'pointLogs' });
User.hasMany(Notification,     { foreignKey: 'user_id', as: 'notifications' });
User.belongsToMany(Badge,      { through: UserBadge, foreignKey: 'user_id', as: 'badges' });

RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ── Survey associations ───────────────────────────────────────
Survey.belongsTo(User,         { foreignKey: 'created_by', as: 'creator' });
Survey.hasMany(Question,       { foreignKey: 'survey_id', as: 'questions' });
Survey.hasMany(SurveyResponse, { foreignKey: 'survey_id', as: 'responses' });

// ── Question associations ─────────────────────────────────────
Question.belongsTo(Survey,     { foreignKey: 'survey_id', as: 'survey' });
Question.hasMany(SurveyAnswer, { foreignKey: 'question_id', as: 'answers' });

// ── SurveyResponse associations ───────────────────────────────
SurveyResponse.belongsTo(Survey, { foreignKey: 'survey_id', as: 'survey' });
SurveyResponse.belongsTo(User,   { foreignKey: 'user_id', as: 'user' });
SurveyResponse.hasMany(SurveyAnswer, { foreignKey: 'response_id', as: 'answers' });

// ── SurveyAnswer associations ─────────────────────────────────
SurveyAnswer.belongsTo(SurveyResponse, { foreignKey: 'response_id', as: 'response' });
SurveyAnswer.belongsTo(Question,       { foreignKey: 'question_id', as: 'question' });

// ── Participation associations ────────────────────────────────
Participation.belongsTo(User,             { foreignKey: 'user_id', as: 'user' });
Participation.belongsTo(User,             { foreignKey: 'reviewed_by', as: 'reviewer' });
Participation.hasMany(ParticipationFile,  { foreignKey: 'participation_id', as: 'files' });

ParticipationFile.belongsTo(Participation, { foreignKey: 'participation_id', as: 'participation' });

// ── PointLog associations ─────────────────────────────────────
PointLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ── Notification associations ─────────────────────────────────
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ── Badge associations ────────────────────────────────────────
Badge.belongsToMany(User, { through: UserBadge, foreignKey: 'badge_id', as: 'users' });

UserBadge.belongsTo(User,  { foreignKey: 'user_id' });
UserBadge.belongsTo(Badge, { foreignKey: 'badge_id' });

module.exports = {
  User, RefreshToken, Survey, Question,
  SurveyResponse, SurveyAnswer,
  Participation, ParticipationFile,
  PointLog, FAQ, Notification, Badge, UserBadge
};
