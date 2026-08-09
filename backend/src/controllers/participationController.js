// Participation controller: Handles submission and approval of extracurricular proof, image upload, and point allocation.
const path = require('path');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Participation, ParticipationFile, PointLog, Notification, User } = require('../models');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');
const { getPagination } = require('../utils/pagination');

// Retrieves list of personal proof reports submitted by student.
exports.getMyParticipations = async (req, res) => {
  try {
    const { status } = req.query;
    const where = { user_id: req.user.id };
    if (status) where.status = status;

    const { page, limit, offset } = getPagination(req.query);
    const { count, rows } = await Participation.findAndCountAll({
      where,
      include: [{ model: ParticipationFile, as: 'files' }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json({ participations: rows, total: count, page, totalPages: Math.ceil(count / limit) });
  } catch (err) {
    logger.error('getMyParticipations error:', err);
    res.status(500).json({ message: 'Failed to fetch participations.' });
  }
};

// Submits extracurricular proof report.
exports.createParticipation = async (req, res) => {
  try {
    const { event_name, location, participant_count, description } = req.body;
    if (!event_name || !location || !description) {
      return res.status(400).json({ message: 'Event name, location, and description are required.' });
    }

    const pendingCount = await Participation.count({
      where: { user_id: req.user.id, status: 'Pending' },
    });
    if (pendingCount >= 3) {
      return res.status(429).json({
        message: 'Bạn đang có 3 báo cáo chờ duyệt. Vui lòng chờ Admin xem xét trước khi nộp thêm.',
      });
    }

    const duplicateApproved = await Participation.findOne({
      where: {
        user_id: req.user.id,
        event_name: event_name.trim(),
        status: 'Approved',
        created_at: { [Op.gte]: new Date(Date.now() - 30 * 86400 * 1000) },
      },
    });
    if (duplicateApproved) {
      return res.status(409).json({
        message: `Bạn đã có báo cáo được duyệt cho sự kiện "${event_name}" trong 30 ngày qua.`,
      });
    }

    const participation = await Participation.create({
      user_id:           req.user.id,
      event_name:        event_name.trim(),
      location,
      participant_count: parseInt(participant_count) || 0,
      description,
      status:            'Pending',
    });

    if (req.files && req.files.length > 0) {
      const storageService = require('../services/storageService');
      const uploadPromises = req.files.map(f => storageService.uploadBuffer(f.buffer, 'participations'));
      const uploadResults = await Promise.all(uploadPromises);

      const fileRecords = req.files.map((f, i) => ({
        participation_id: participation.id,
        file_url:  uploadResults[i].secure_url,
        file_name: f.originalname,
        file_type: f.mimetype,
        file_size: f.size,
      }));
      await ParticipationFile.bulkCreate(fileRecords);
    }

    res.status(201).json({ message: 'Report submitted successfully! Pending admin review.', participation });
  } catch (err) {
    logger.error('createParticipation error:', err);
    res.status(500).json({ message: 'Failed to submit participation report.' });
  }
};

// Retrieves proof submission details by ID.
exports.getParticipationById = async (req, res) => {
  try {
    const part = await Participation.findByPk(req.params.id, {
      include: [
        { model: ParticipationFile, as: 'files' },
        { model: User, as: 'user', attributes: ['id', 'full_name', 'username', 'role'] },
        { model: User, as: 'reviewer', attributes: ['id', 'full_name'] },
      ],
    });
    if (!part) return res.status(404).json({ message: 'Report not found.' });

    if (req.user.role !== 'Admin' && part.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ participation: part });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch report.' });
  }
};

// Retrieves all student proof reports for admin verification.
exports.adminGetParticipations = async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status) where.status = status;

    const userWhere = {};
    const participationWhere = { ...where };
    if (search) {
      participationWhere[Op.or] = [
        { event_name: { [Op.like]: `%${search}%` } },
        { location:   { [Op.like]: `%${search}%` } },
      ];
      userWhere.full_name = { [Op.like]: `%${search}%` };
    }

    const { page, limit, offset } = getPagination(req.query);
    const { count, rows } = await Participation.findAndCountAll({
      where: participationWhere,
      include: [
        {
          model: User, as: 'user',
          attributes: ['id', 'full_name', 'username', 'role'],
          required: false,
        },
        { model: ParticipationFile, as: 'files' },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    res.json({ participations: rows, total: count, page, totalPages: Math.ceil(count / limit) });
  } catch (err) {
    logger.error('adminGetParticipations error:', err);
    res.status(500).json({ message: 'Failed to fetch participations.' });
  }
};

// Approves or rejects extracurricular proof submissions in a DB transaction.
exports.reviewParticipation = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { status, reject_reason } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      await t.rollback();
      return res.status(400).json({ message: 'Status must be Approved or Rejected.' });
    }

    const part = await Participation.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }],
      transaction: t,
    });
    if (!part) { await t.rollback(); return res.status(404).json({ message: 'Report not found.' }); }
    if (part.status !== 'Pending') {
      await t.rollback();
      return res.status(400).json({ message: 'This report has already been reviewed.' });
    }

    await part.update({
      status,
      reject_reason: status === 'Rejected' ? reject_reason : null,
      reviewed_by:   req.user.id,
      reviewed_at:   new Date(),
    }, { transaction: t });

    if (status === 'Approved') {
      const existingPoint = await PointLog.findOne({
        where: {
          user_id:        part.user_id,
          action_type:    'Event_Report',
          reference_id:   part.id,
          reference_type: 'participations',
        },
        transaction: t,
      });
      if (!existingPoint) {
        await PointLog.create({
          user_id:        part.user_id,
          action_type:    'Event_Report',
          points:         50,
          reference_id:   part.id,
          reference_type: 'participations',
          note:           `Approved report: ${part.event_name}`,
        }, { transaction: t });
      }
    }

    const notification = await Notification.create({
      user_id:        part.user_id,
      title:          status === 'Approved' ? 'Report Approved' : 'Report Rejected',
      message:        status === 'Approved'
        ? `Your report "${part.event_name}" has been approved. You earned 50 points!`
        : `Your report "${part.event_name}" was rejected. ${reject_reason || ''}`,
      reference_type: 'participation',
      reference_id:   part.id,
    }, { transaction: t });

    const socketService = require('../services/socketService');
    socketService.emitToUser(part.user_id, 'new_notification', notification);

    await t.commit();

    if (status === 'Approved') {
      const badgeService = require('../services/badgeService');
      badgeService.checkAndAwardBadges(part.user_id).catch(err => {
        logger.error(`Error checking badges for user ${part.user_id} after participation approval:`, err);
      });
    }

    emailService.sendParticipationReviewEmail(
      part.user.email, part.user.full_name, part.event_name, status, reject_reason
    ).catch(logger.error);

    res.json({ message: `Report ${status === 'Approved' ? 'approved' : 'rejected'} successfully.`, participation: part });
  } catch (err) {
    await t.rollback();
    logger.error('reviewParticipation error:', err);
    res.status(500).json({ message: 'Failed to review participation.' });
  }
};

// Uses Gemini AI Service to summarize proof submission report for quick admin review.
exports.summarizeParticipation = async (req, res) => {
  try {
    const part = await Participation.findByPk(req.params.id);
    if (!part) return res.status(404).json({ message: 'Report not found.' });

    const force = req.query.force === 'true';
    if (part.ai_summary && !force) {
      return res.json({ ai_summary: part.ai_summary, cached: true });
    }

    const summary = await aiService.summarizeReport(part.description, part.event_name);
    await part.update({ ai_summary: summary });

    res.json({ ai_summary: summary, cached: false });
  } catch (err) {
    logger.error('summarizeParticipation error:', err);
    res.status(500).json({ message: 'Failed to generate AI summary.' });
  }
};
