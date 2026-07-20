const { Survey, User, SurveyResponse } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

exports.getStats = async (req, res) => {
  try {
    const surveys_published = await Survey.count({ where: { status: 'Published' } });
    const surveys_taken = await SurveyResponse.count();
    const users_active = await User.count({ where: { status: 'Approved' } });
    const trees_planted = Math.floor(surveys_taken / 10);
    res.json({ surveys_published, surveys_taken, users_active, trees_planted });
  } catch (err) {
    logger.error('homepage getStats error:', err);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

exports.getTopSurveys = async (req, res) => {
  try {
    const surveys = await Survey.findAll({
      where: { status: 'Published' },
      order: [['created_at', 'DESC']],
      limit: 3,
      attributes: ['id', 'title', 'description', 'target_role', 'end_date']
    });
    res.json({ surveys });
  } catch (err) {
    logger.error('homepage getTopSurveys error:', err);
    res.status(500).json({ message: 'Error fetching top surveys' });
  }
};

exports.getRecentRespondents = async (req, res) => {
  try {
    const recent = await SurveyResponse.findAll({
      order: [['submitted_at', 'DESC']],
      limit: 5,
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'role', 'avatar_url'] }]
    });
    const formatted = recent.map(p => ({
      id: p.user.id,
      full_name: p.user.full_name,
      role: p.user.role,
      avatar_url: p.user.avatar_url,
      points: 0
    }));
    res.json({ recent: formatted });
  } catch (err) {
    logger.error('homepage getRecentRespondents error:', err);
    res.status(500).json({ message: 'Error fetching recent respondents' });
  }
};
