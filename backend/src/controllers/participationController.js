const path = require('path');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
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

    // FIX #8: Giới hạn tối đa 3 báo cáo đang Pending mỗi user để tránh spam
    const pendingCount = await Participation.count({
      where: { user_id: req.user.id, status: 'Pending' },
    });
    if (pendingCount >= 3) {
      return res.status(429).json({
        message: 'Bạn đang có 3 báo cáo chờ duyệt. Vui lòng chờ Admin xem xét trước khi nộp thêm.',
      });
    }

    // FIX #8: Kiểm tra báo cáo trùng lặp (cùng event_name đã Approved trong 30 ngày gần đây)
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

    // Handle uploaded files
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

    // FIX #18: Cho phép tìm kiếm theo tên sự kiện (event_name) hoặc tên người nộp
    const userWhere = {};
    const participationWhere = { ...where };
    if (search) {
      participationWhere[Op.or] = [
        { event_name: { [Op.like]: `%${search}%` } },
        { location:   { [Op.like]: `%${search}%` } },
      ];
      userWhere.full_name = { [Op.like]: `%${search}%` };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Participation.findAndCountAll({
      where: participationWhere,
      include: [
        {
          model: User, as: 'user',
          attributes: ['id', 'full_name', 'username', 'role'],
          // FIX #18: Không dùng required:true để tránh loại bỏ kết quả khi filter event_name
          required: false,
        },
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
  // FIX #1: Bọc toàn bộ logic review trong transaction để đảm bảo tính toàn vẹn dữ liệu
  // Nếu bất kỳ bước nào thất bại (update status, tạo PointLog, tạo Notification),
  // toàn bộ sẽ rollback — tránh trường hợp Approved nhưng không cộng điểm.
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
      // FIX #2: Application-level guard chống cộng điểm 2 lần cho cùng một participation
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

    // In-app notification (trong transaction để nhất quán)
    const notification = await Notification.create({
      user_id:        part.user_id,
      title:          status === 'Approved' ? 'Report Approved' : 'Report Rejected',
      message:        status === 'Approved'
        ? `Your report "${part.event_name}" has been approved. You earned 50 points!`
        : `Your report "${part.event_name}" was rejected. ${reject_reason || ''}`,
      reference_type: 'participation',
      reference_id:   part.id,
    }, { transaction: t });

    // Emit real-time notification
    const socketService = require('../services/socketService');
    socketService.emitToUser(part.user_id, 'new_notification', notification);

    await t.commit();

    // Email là non-critical — gửi sau khi commit
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
