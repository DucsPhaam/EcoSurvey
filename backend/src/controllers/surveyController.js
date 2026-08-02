/**
 * @module SurveyController
 * @description Controller quản lý toàn bộ vòng đời bài khảo sát: Đăng bài, Chỉnh sửa, Quản lý câu hỏi, Phân tích thống kê kết quả, Người dùng làm khảo sát và Admin chấm điểm ý kiến cá nhân.
 */
const { Op, literal } = require('sequelize');
const { sequelize } = require('../config/database');
const { Survey, Question, SurveyResponse, SurveyAnswer, PointLog, Notification, User } = require('../models');
const logger = require('../utils/logger');
const badgeService = require('../services/badgeService');

/**
 * @function getSurveys
 * @description Lấy danh sách đợt khảo sát dành cho sinh viên/cán bộ đang mở (`Published` và chưa hết hạn `end_date`).
 */
exports.getSurveys = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    const { page = 1, limit = 12, search } = req.query;

    const where = {
      status: 'Published',
      end_date: { [Op.gte]: new Date() },
      [Op.or]: [{ target_role: 'All' }, { target_role: userRole }],
    };
    if (search) where.title = { [Op.like]: `%${search}%` };

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: surveys } = await Survey.findAndCountAll({
      where,
      include: [
        { model: Question, as: 'questions', attributes: ['id'], required: false },
        { model: User, as: 'creator', attributes: ['full_name'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    const surveyIds = surveys.map((s) => s.id);
    const completed = await SurveyResponse.findAll({
      where: { user_id: userId, survey_id: { [Op.in]: surveyIds } },
      attributes: ['survey_id'],
    });
    const completedSet = new Set(completed.map((r) => r.survey_id));

    const data = surveys.map((s) => ({
      ...s.toJSON(),
      question_count: s.questions?.length || 0,
      is_completed: completedSet.has(s.id),
    }));

    res.json({ surveys: data, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
  } catch (err) {
    logger.error('getSurveys error:', err);
    res.status(500).json({ message: 'Failed to fetch surveys.' });
  }
};

/**
 * @function getSurveyDetail
 * @description Lấy thông tin chi tiết một bài khảo sát kèm danh sách câu hỏi để sinh viên thực hiện làm bài.
 */
exports.getSurveyDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const survey = await Survey.findByPk(id, {
      include: [
        { model: Question, as: 'questions', order: [['order_num', 'ASC']] },
        { model: User, as: 'creator', attributes: ['full_name'] },
      ],
    });

    if (!survey) return res.status(404).json({ message: 'Survey not found.' });

    if (req.user.role !== 'Admin') {
      if (survey.status !== 'Published') {
        return res.status(403).json({ message: 'Survey is not available.' });
      }
      if (new Date(survey.end_date) < new Date()) {
        return res.status(403).json({ message: 'Survey has ended.' });
      }
    }

    const existing = await SurveyResponse.findOne({
      where: { survey_id: id, user_id: req.user.id },
    });

    res.json({ survey, is_completed: !!existing });
  } catch (err) {
    logger.error('getSurveyDetail error:', err);
    res.status(500).json({ message: 'Failed to fetch survey.' });
  }
};

/**
 * @function submitSurvey
 * @description Người dùng gửi câu trả lời bài khảo sát, ghi nhận kết quả và cộng 10 điểm thưởng rèn luyện trong Transaction an toàn.
 */
exports.submitSurvey = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const survey = await Survey.findByPk(id, {
      include: [{ model: Question, as: 'questions' }],
    });

    if (!survey) { await t.rollback(); return res.status(404).json({ message: 'Survey not found.' }); }

    const now = new Date();

    if (
      survey.status !== 'Published' ||
      now < new Date(survey.start_date) ||
      now > new Date(survey.end_date)
    ) {
      await t.rollback();
      return res.status(400).json({ message: 'Survey is not currently open.' });
    }

    if (survey.target_role !== 'All' && survey.target_role !== req.user.role) {
      await t.rollback();
      return res.status(403).json({ message: 'You are not eligible for this survey.' });
    }

    const requiredIds = survey.questions.filter((q) => q.is_required).map((q) => q.id);
    const answeredIds = (answers || []).map((a) => a.question_id);
    const missing = requiredIds.filter((id) => !answeredIds.includes(id));
    if (missing.length > 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Please answer all required questions.', missing_question_ids: missing });
    }

    const validQuestionIds = new Set(survey.questions.map((q) => q.id));
    const invalidAnswers = (answers || []).filter((a) => !validQuestionIds.has(a.question_id));
    if (invalidAnswers.length > 0) {
      await t.rollback();
      return res.status(400).json({
        message: 'Invalid question IDs detected.',
        invalid_question_ids: invalidAnswers.map((a) => a.question_id),
      });
    }

    let response;
    try {
      response = await SurveyResponse.create({ survey_id: id, user_id: userId, submitted_at: new Date() }, { transaction: t });
    } catch (uniqueErr) {
      await t.rollback();
      return res.status(409).json({ message: 'You have already submitted this survey.' });
    }

    if (answers && answers.length > 0) {
      const answerRecords = answers.map((a) => ({
        response_id: response.id,
        question_id: a.question_id,
        answer_text: Array.isArray(a.answer_text) ? a.answer_text.join('|||') : a.answer_text,
      }));
      await SurveyAnswer.bulkCreate(answerRecords, { transaction: t });
    }

    const existingPoint = await PointLog.findOne({
      where: { user_id: userId, action_type: 'Survey_Completion', reference_id: response.id, reference_type: 'survey_responses' },
      transaction: t,
    });
    if (!existingPoint) {
      await PointLog.create({
        user_id: userId,
        action_type: 'Survey_Completion',
        points: 10,
        reference_id: response.id,
        reference_type: 'survey_responses',
        note: `Completed survey: ${survey.title}`,
      }, { transaction: t });
    }

    await t.commit();

    badgeService.checkAndAwardBadges(userId).catch(err => {
      logger.error(`Error checking badges for user ${userId} after survey submission:`, err);
    });

    res.status(201).json({ message: 'Survey submitted successfully! You earned 10 points.', response_id: response.id });
  } catch (err) {
    await t.rollback();
    logger.error('submitSurvey error:', err);
    res.status(500).json({ message: 'Failed to submit survey.' });
  }
};

/**
 * @function adminGetSurveys
 * @description Admin xem danh sách tất cả các bài khảo sát (Bao gồm Draft, Published, Closed).
 */
exports.adminGetSurveys = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) where.title = { [Op.like]: `%${search}%` };

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Survey.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['full_name'] },
        { model: SurveyResponse, as: 'responses', attributes: ['id'], required: false },
        { model: Question, as: 'questions', attributes: ['id'], required: false },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    const data = rows.map((s) => ({
      ...s.toJSON(),
      response_count: s.responses?.length || 0,
      question_count: s.questions?.length || 0,
    }));

    res.json({ surveys: data, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
  } catch (err) {
    logger.error('adminGetSurveys error:', err);
    res.status(500).json({ message: 'Failed to fetch surveys.' });
  }
};

/**
 * @function adminGetSurveyById
 * @description Admin xem chi tiết bài khảo sát và danh sách câu hỏi trong trang quản trị.
 */
exports.adminGetSurveyById = async (req, res) => {
  try {
    const { id } = req.params;
    const survey = await Survey.findByPk(id, {
      include: [
        { model: Question, as: 'questions', order: [['order_num', 'ASC']] },
        { model: User, as: 'creator', attributes: ['full_name'] },
      ],
    });
    if (!survey) return res.status(404).json({ message: 'Survey not found.' });
    res.json({ survey });
  } catch (err) {
    logger.error('adminGetSurveyById error:', err);
    res.status(500).json({ message: 'Failed to fetch survey.' });
  }
};

/**
 * @function adminGetAnalytics
 * @description Tổng hợp biểu đồ phân tích tỷ lệ chọn từng phương án câu hỏi khảo sát cho Admin.
 */
exports.adminGetAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findByPk(id, {
      attributes: ['id', 'title', 'status', 'start_date', 'end_date'],
      include: [
        { model: Question, as: 'questions', order: [['order_num', 'ASC']] },
        { model: SurveyResponse, as: 'responses', attributes: ['id'] },
      ],
    });

    if (!survey) return res.status(404).json({ message: 'Survey not found.' });

    const totalResponses = survey.responses.length;
    const responseIds = survey.responses.map(r => r.id);

    let allAnswers = [];
    if (responseIds.length > 0) {
      allAnswers = await SurveyAnswer.findAll({
        where: { response_id: { [Op.in]: responseIds } },
        attributes: ['question_id', 'answer_text'],
      });
    }

    const questionsData = survey.questions.map(q => {
      const qAnswers = allAnswers.filter(a => a.question_id === q.id && a.answer_text);
      const answeredCount = qAnswers.length;
      const responseRate = totalResponses > 0 ? Math.round((answeredCount / totalResponses) * 100) : 0;

      let processedAnswers = null;

      if (q.question_type === 'Single_Choice') {
        const counts = {};
        qAnswers.forEach(a => {
          counts[a.answer_text] = (counts[a.answer_text] || 0) + 1;
        });
        processedAnswers = counts;
      } else if (q.question_type === 'Multiple_Choice') {
        const counts = {};
        qAnswers.forEach(a => {
          const parts = a.answer_text.split('|||');
          parts.forEach(p => {
            counts[p] = (counts[p] || 0) + 1;
          });
        });
        processedAnswers = counts;
      } else {
        processedAnswers = qAnswers.map(a => a.answer_text);
      }

      return {
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options,
        answers: processedAnswers,
        response_rate: responseRate,
      };
    });

    res.json({
      survey: {
        id: survey.id,
        title: survey.title,
        status: survey.status,
      },
      total_responses: totalResponses,
      questions: questionsData,
    });

  } catch (err) {
    logger.error('adminGetAnalytics error:', err);
    res.status(500).json({ message: 'Failed to fetch survey analytics.' });
  }
};

/**
 * @function adminCreateSurvey
 * @description Admin tạo bài khảo sát mới, tự động chèn câu hỏi "Ý kiến cá nhân" bắt buộc cuối bài.
 */
exports.adminCreateSurvey = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { title, description, target_role, start_date, end_date, status } = req.body;
    if (!title || !start_date || !end_date) {
      await t.rollback();
      return res.status(400).json({ message: 'Title, start date, and end date are required.' });
    }
    if (new Date(end_date) <= new Date(start_date)) {
      await t.rollback();
      return res.status(400).json({ message: 'End date must be after start date.' });
    }

    const survey = await Survey.create({
      title, description, target_role: target_role || 'All',
      start_date, end_date,
      status: status || 'Draft',
      created_by: req.user.id,
    }, { transaction: t });

    await Question.create({
      survey_id: survey.id,
      question_text: 'Ý kiến cá nhân về bài khảo sát',
      question_type: 'Text',
      is_required: true,
      options: { isOpinion: true, maxLength: 150 },
      order_num: 9999,
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Survey created.', survey });
  } catch (err) {
    await t.rollback();
    logger.error('adminCreateSurvey error:', err);
    res.status(500).json({ message: 'Failed to create survey.' });
  }
};

/**
 * @function adminUpdateSurvey
 * @description Admin cập nhật bài khảo sát. Phát thông báo Socket.IO + Notification khi xuất bản (`Published`).
 */
exports.adminUpdateSurvey = async (req, res) => {
  try {
    const survey = await Survey.findByPk(req.params.id, {
      include: [{ model: Question, as: 'questions', attributes: ['id'] }],
    });
    if (!survey) return res.status(404).json({ message: 'Survey not found.' });

    if (req.body.status === 'Published' && (!survey.questions || survey.questions.length === 0)) {
      return res.status(400).json({ message: 'Survey must have at least one question before publishing.' });
    }

    const { title, description, target_role, start_date, end_date, status } = req.body;

    const newStartDate = start_date || survey.start_date;
    const newEndDate = end_date || survey.end_date;
    if (new Date(newEndDate) <= new Date(newStartDate)) {
      return res.status(400).json({ message: 'End date must be after start date.' });
    }

    const wasPublished = survey.status !== 'Published' && status === 'Published';

    await survey.update({ title, description, target_role, start_date, end_date, status });

    if (wasPublished) {
      _notifyUsersForNewSurvey(survey).catch((err) =>
        logger.error('Failed to send new-survey notifications:', err)
      );
    }

    res.json({ message: 'Survey updated.', survey });
  } catch (err) {
    logger.error('adminUpdateSurvey error:', err);
    res.status(500).json({ message: 'Failed to update survey.' });
  }
};

/**
 * @function _notifyUsersForNewSurvey
 * @description Hàm helper phát thông báo cho tất cả người dùng hợp lệ khi một khảo sát mới được xuất bản.
 */
async function _notifyUsersForNewSurvey(survey) {
  const roleFilter = survey.target_role === 'All'
    ? { role: { [Op.in]: ['Student', 'Staff'] } }
    : { role: survey.target_role };

  const users = await User.findAll({
    where: { ...roleFilter, status: 'Approved' },
    attributes: ['id'],
  });

  if (users.length === 0) return;

  const notifications = users.map((u) => ({
    user_id: u.id,
    title: 'Khảo sát mới dành cho bạn',
    message: `Khảo sát "${survey.title}" vừa được mở. Hãy tham gia ngay để nhận điểm thưởng!`,
    reference_type: 'survey',
    reference_id: survey.id,
  }));

  const BATCH_SIZE = 100;
  for (let i = 0; i < notifications.length; i += BATCH_SIZE) {
    const batch = notifications.slice(i, i + BATCH_SIZE);
    const createdNotes = await Notification.bulkCreate(batch);
    
    const socketService = require('../services/socketService');
    createdNotes.forEach(note => {
      socketService.emitToUser(note.user_id, 'new_notification', note);
    });
  }

  logger.info(`[Survey Publish] Sent notifications to ${users.length} users for survey "${survey.title}"`);
}

/**
 * @function adminDeleteSurvey
 * @description Admin xóa bài khảo sát chưa có lượt làm bài nào.
 */
exports.adminDeleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findByPk(req.params.id, {
      include: [{ model: SurveyResponse, as: 'responses', attributes: ['id'], required: false }],
    });
    if (!survey) return res.status(404).json({ message: 'Survey not found.' });

    if (survey.responses && survey.responses.length > 0) {
      return res.status(400).json({ message: 'Cannot delete a survey that has responses. Please close it instead to preserve data.' });
    }

    await survey.destroy();
    res.json({ message: 'Survey deleted.' });
  } catch (err) {
    logger.error('adminDeleteSurvey error:', err);
    res.status(500).json({ message: 'Failed to delete survey.' });
  }
};

/**
 * @function getQuestions
 * @description Lấy danh sách câu hỏi thuộc một bài khảo sát.
 */
exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll({
      where: { survey_id: req.params.surveyId },
      order: [['order_num', 'ASC']],
    });
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch questions.' });
  }
};

/**
 * @function createQuestion
 * @description Thêm một câu hỏi mới vào bài khảo sát.
 */
exports.createQuestion = async (req, res) => {
  try {
    const { question_text, question_type, options, order_num, is_required } = req.body;
    if (!question_text) return res.status(400).json({ message: 'Question text is required.' });
    if (['Single_Choice', 'Multiple_Choice'].includes(question_type) && (!options || options.length < 2)) {
      return res.status(400).json({ message: 'Choice questions require at least 2 options.' });
    }

    const question = await Question.create({
      survey_id: req.params.surveyId,
      question_text, question_type: question_type || 'Text',
      options: options || null,
      order_num: order_num || 0,
      is_required: is_required !== undefined ? is_required : true,
    });

    res.status(201).json({ message: 'Question created.', question });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create question.' });
  }
};

/**
 * @function updateQuestion
 * @description Chỉnh sửa nội dung câu hỏi trong bài khảo sát (Có kiểm tra bảo mật IDOR).
 */
exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findOne({
      where: { id: req.params.id, survey_id: req.params.surveyId },
    });
    if (!question) return res.status(404).json({ message: 'Question not found in this survey.' });

    const { question_text, question_type, options, order_num, is_required } = req.body;
    await question.update({ question_text, question_type, options, order_num, is_required });
    res.json({ message: 'Question updated.', question });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update question.' });
  }
};

/**
 * @function deleteQuestion
 * @description Xóa câu hỏi khỏi bài khảo sát.
 */
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findOne({
      where: { id: req.params.id, survey_id: req.params.surveyId },
    });
    if (!question) return res.status(404).json({ message: 'Question not found in this survey.' });
    await question.destroy();
    res.json({ message: 'Question deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete question.' });
  }
};

/**
 * @function reorderQuestions
 * @description Sắp xếp lại thứ tự xuất hiện của các câu hỏi trong khảo sát.
 */
exports.reorderQuestions = async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) return res.status(400).json({ message: 'Order must be an array.' });

    await Promise.all(order.map(({ id, order_num }) =>
      Question.update({ order_num }, { where: { id, survey_id: req.params.surveyId } })
    ));
    res.json({ message: 'Questions reordered.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reorder questions.' });
  }
};

/**
 * @function getSurveyResponses
 * @description Admin xem danh sách kết quả bài làm được ẩn danh (Hiển thị "Ẩn danh #1", "Ẩn danh #2" để đảm bảo tính khách quan).
 */
exports.getSurveyResponses = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await SurveyResponse.findAndCountAll({
      where: { survey_id: req.params.id },
      include: [
        { model: User, as: 'user', attributes: ['role'] },
        { model: SurveyAnswer, as: 'answers', include: [{ model: Question, as: 'question' }] },
      ],
      order: [['submitted_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    const anonymousResponses = rows.map((r, idx) => {
      const json = r.toJSON();
      return {
        ...json,
        user: {
          displayName: `Ẩn danh #${offset + idx + 1}`,
          role: json.user?.role || 'Unknown',
        },
      };
    });

    res.json({ responses: anonymousResponses, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch survey responses.' });
  }
};

/**
 * @function gradeOpinion
 * @description Admin chấm điểm ý kiến cá nhân bài khảo sát (từ 0 đến 10 điểm), tự động cập nhật hoặc chèn bản ghi điểm thưởng `PointLog Bonus` duy nhất.
 */
exports.gradeOpinion = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { opinion_score } = req.body;

    if (opinion_score === undefined || opinion_score === null) {
      await t.rollback();
      return res.status(400).json({ message: 'opinion_score is required.' });
    }
    const score = parseInt(opinion_score, 10);
    if (isNaN(score) || score < 0 || score > 10) {
      await t.rollback();
      return res.status(400).json({ message: 'opinion_score must be an integer between 0 and 10.' });
    }

    const response = await SurveyResponse.findByPk(id, { transaction: t });
    if (!response) {
      await t.rollback();
      return res.status(404).json({ message: 'Survey response not found.' });
    }

    const previousScore = response.opinion_score;

    await response.update({ opinion_score: score }, { transaction: t });

    const numericResponseId = parseInt(id, 10);

    const existingLogs = await PointLog.findAll({
      where: {
        reference_id: numericResponseId,
        reference_type: 'opinion_score',
      },
      transaction: t,
    });

    if (existingLogs.length > 0) {
      const primaryLog = existingLogs[0];
      await primaryLog.update({
        user_id: response.user_id,
        action_type: 'Bonus',
        points: score,
        note: `Điểm ý kiến cá nhân bài khảo sát (survey_response #${id})`,
      }, { transaction: t });

      if (existingLogs.length > 1) {
        const duplicateIds = existingLogs.slice(1).map(l => l.id);
        await PointLog.destroy({
          where: { id: duplicateIds },
          transaction: t,
        });
      }
    } else {
      await PointLog.create({
        user_id: response.user_id,
        action_type: 'Bonus',
        points: score,
        reference_id: numericResponseId,
        reference_type: 'opinion_score',
        note: `Điểm ý kiến cá nhân bài khảo sát (survey_response #${id})`,
      }, { transaction: t });
    }

    await t.commit();

    badgeService.checkAndAwardBadges(response.user_id).catch(err => {
      logger.error(`Error checking badges for user ${response.user_id} after grading opinion:`, err);
    });

    res.json({
      message: `Đã chấm ${score}/10 điểm cho bài làm #${id}.`,
      previous_score: previousScore,
      new_score: score,
    });
  } catch (err) {
    await t.rollback();
    logger.error('gradeOpinion error:', err);
    res.status(500).json({ message: 'Failed to grade opinion.' });
  }
};
