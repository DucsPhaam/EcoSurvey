/**
 * @module HomepageController
 * @description Controller cung cấp dữ liệu thống kê ấn tượng cho trang chủ (Landing Page) như số lượng khảo sát, cây xanh đã đóng góp, khảo sát nổi bật và lượt làm bài mới nhất.
 * 
 * @function getStats
 * @description Lấy các số liệu ấn tượng hiển thị trên trang chủ (Số khảo sát, Số lượt làm bài, Số người dùng kích hoạt, Số cây trồng quy đổi).
 * 
 * @function getTopSurveys
 * @description Lấy 3 đợt khảo sát mới nhất đang phát động.
 * 
 * @function getRecentRespondents
 * @description Lấy danh sách 6 lượt hoàn thành khảo sát mới nhất để hiển thị bảng vinh danh trên trang chủ.
 * 
 * @relations
 * - Routes: `GET /api/homepage/stats`, `GET /api/homepage/top-surveys`, `GET /api/homepage/recent-respondents` trong `homepageRoutes.js`.
 * - Frontend UI: `LandingPage.jsx`, `TrendingSurveyCard.jsx`.
 */
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
      limit: 6,
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'role', 'department', 'avatar_url'] },
        { model: Survey, as: 'survey', attributes: ['id', 'title'] }
      ]
    });
    const formatted = recent.map(p => ({
      response_id: p.id,
      user_id: p.user?.id,
      full_name: p.user?.full_name || 'Anonymous',
      role: p.user?.role || 'Student',
      department: p.user?.department,
      avatar_url: p.user?.avatar_url,
      survey_title: p.survey?.title || 'Eco Survey',
      submitted_at: p.submitted_at
    }));
    res.json({ respondents: formatted, recent: formatted });
  } catch (err) {
    logger.error('homepage getRecentRespondents error:', err);
    res.status(500).json({ message: 'Error fetching recent respondents' });
  }
};
