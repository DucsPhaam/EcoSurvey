const path = require('path');
const { Op } = require('sequelize');
const { Participation, ParticipationFile, PointLog, Notification, User } = require('../models');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// ── GET /api/participations — my reports ──────────────────────
exports.getMyParticipations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const where = { user_id: req.user.id };
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Participation.findAndCountAll({
      where,
      include: [{ model: ParticipationFile, as: 'files' }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({ participations: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
  } catch (err) {
    logger.error('getMyParticipations error:', err);
    res.status(500).json({ message: 'Failed to fetch participations.' });
  }
};

// ── POST /api/participations — submit report ──────────────────
exports.createParticipation = async (req, res) => {
  try {
    const { event_name, location, participant_count, description } = req.body;
    if (!event_name || !location || !description) {
      return res.status(400).json({ message: 'Event name, location, and description are required.' });
    }

    const participation = await Participation.create({
      user_id:           req.user.id,
      event_name,
      location,
      participant_count: parseInt(participant_count) || 0,
      description,
      status:            'Pending',
    });

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      const fileRecords = req.files.map((f) => ({
        participation_id: participation.id,
        file_url:  `/uploads/${f.filename}`,
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

// ── GET /api/participations/:id ───────────────────────────────
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

    // Students can only view their own
    if (req.user.role !== 'Admin' && part.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ participation: part });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch report.' });
  }
};

// ── GET /api/admin/participations ────────────────────────────
exports.adminGetParticipations = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const where = {};
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Participation.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'username', 'role'],
          ...(search ? { where: { full_name: { [Op.like]: `%${search}%` } } } : {}) },
        { model: ParticipationFile, as: 'files' },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    res.json({ participations: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
  } catch (err) {
    logger.error('adminGetParticipations error:', err);
    res.status(500).json({ message: 'Failed to fetch participations.' });
  }
};

// ── PATCH /api/admin/participations/:id/review ────────────────
exports.reviewParticipation = async (req, res) => {
  try {
    const { status, reject_reason } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected.' });
    }

    const part = await Participation.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }],
    });
    if (!part) return res.status(404).json({ message: 'Report not found.' });
    if (part.status !== 'Pending') return res.status(400).json({ message: 'This report has already been reviewed.' });

    await part.update({
      status,
      reject_reason: status === 'Rejected' ? reject_reason : null,
      reviewed_by:   req.user.id,
      reviewed_at:   new Date(),
    });

    if (status === 'Approved') {
      await PointLog.create({
        user_id:        part.user_id,
        action_type:    'Event_Report',
        points:         50,
        reference_id:   part.id,
        reference_type: 'participations',
        note:           `Approved report: ${part.event_name}`,
      });
    }

    // In-app notification
    await Notification.create({
      user_id:        part.user_id,
      title:          status === 'Approved' ? 'Report Approved' : 'Report Rejected',
      message:        status === 'Approved'
        ? `Your report "${part.event_name}" has been approved. You earned 50 points!`
        : `Your report "${part.event_name}" was rejected. ${reject_reason || ''}`,
      reference_type: 'participation',
      reference_id:   part.id,
    });

    emailService.sendParticipationReviewEmail(
      part.user.email, part.user.full_name, part.event_name, status, reject_reason
    ).catch(logger.error);

    res.json({ message: `Report ${status === 'Approved' ? 'approved' : 'rejected'} successfully.`, participation: part });
  } catch (err) {
    logger.error('reviewParticipation error:', err);
    res.status(500).json({ message: 'Failed to review participation.' });
  }
};

// ── POST /api/admin/participations/:id/summarize ─────────────
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
