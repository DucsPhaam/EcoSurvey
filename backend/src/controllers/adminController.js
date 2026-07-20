const { Op } = require('sequelize');
const { User, Survey, SurveyResponse, Participation, Notification, FAQ } = require('../models');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// ── GET /api/admin/users ─────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;
    const where = {};
    if (role)   where.role   = role;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { full_name:        { [Op.like]: `%${search}%` } },
        { username:         { [Op.like]: `%${search}%` } },
        { email:            { [Op.like]: `%${search}%` } },
        { student_staff_id: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      users: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (err) {
    logger.error('getUsers error:', err);
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
};

// ── POST /api/admin/users/import ─────────────────────────────
const ExcelJS = require('exceljs');
const bcrypt = require('bcrypt');

exports.importUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No Excel file provided.' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    
    // Assume data is in the first worksheet
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return res.status(400).json({ message: 'Excel file is empty.' });
    }

    let successful = 0;
    let failed = 0;
    const errors = [];

    // Iterate starting from row 2 (assuming row 1 is headers)
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      // Skip empty rows
      if (!row.hasValues) continue;

      // Map columns (adjust indices if needed based on plan: 1: FullName, 2: Username, 3: Email, 4: Password, 5: Role, 6: ID, 7: Class, 8: Dept)
      const full_name = row.getCell(1).text?.trim();
      const username = row.getCell(2).text?.trim();
      const email = row.getCell(3).text?.trim();
      const password = row.getCell(4).text?.trim();
      let role = row.getCell(5).text?.trim() || 'Student';
      const student_staff_id = row.getCell(6).text?.trim() || null;
      const class_name = row.getCell(7).text?.trim() || null;
      const department = row.getCell(8).text?.trim() || null;

      if (!full_name || !username || !email || !password) {
        failed++;
        errors.push(`Row ${rowNumber}: Missing required fields.`);
        continue;
      }

      if (!['Student', 'Staff', 'Admin'].includes(role)) {
        role = 'Student'; // Default fallback
      }

      try {
        const password_hash = await bcrypt.hash(password, 10);
        await User.create({
          full_name,
          username,
          email,
          password_hash,
          role,
          status: 'Approved', // Auto-approve imported users
          student_staff_id,
          class_name,
          department,
          email_verified: true, // Imported users are considered verified
        });
        successful++;
      } catch (err) {
        failed++;
        // likely a unique constraint error (username or email already exists)
        errors.push(`Row ${rowNumber}: ${err.errors?.[0]?.message || 'Database error'}`);
      }
    }

    res.json({
      message: `Import completed. ${successful} created, ${failed} failed.`,
      successful,
      failed,
      errors: errors.slice(0, 10), // Send only first 10 errors to avoid huge payloads
    });
  } catch (err) {
    logger.error('importUsers error:', err);
    res.status(500).json({ message: 'Failed to process Excel file.' });
  }
};

// ── PATCH /api/admin/users/:id/status ─────────────────────────
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reject_reason } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Approved or Rejected.' });
    }

    const user = await User.findByPk(id, { attributes: ['id', 'full_name', 'email', 'status', 'role'] });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'Admin') return res.status(403).json({ message: 'Cannot change admin account status this way.' });

    await user.update({ status, reject_reason: status === 'Rejected' ? reject_reason : null });

    // Create in-app notification
    await Notification.create({
      user_id:        user.id,
      title:          status === 'Approved' ? 'Account Approved' : 'Account Rejected',
      message:        status === 'Approved'
        ? 'Your account has been approved. You can now log in.'
        : `Your account registration was rejected. ${reject_reason ? 'Reason: ' + reject_reason : 'Please contact Admin for details.'}`,
      reference_type: 'user',
      reference_id:   user.id,
    });

    // Send email (non-blocking)
    emailService.sendStatusUpdateEmail(user.email, user.full_name, status, reject_reason).catch(logger.error);

    res.json({ message: `Account ${status === 'Approved' ? 'approved' : 'rejected'} successfully.`, user });
  } catch (err) {
    logger.error('updateUserStatus error:', err);
    res.status(500).json({ message: 'Failed to update user status.' });
  }
};

// ── DELETE /api/admin/users/:id ───────────────────────────────
// FIX #9: Soft-delete — đặt status = 'Deactivated' thay vì xóa cứng
// Lý do: Hard delete với ON DELETE CASCADE sẽ xóa toàn bộ lịch sử khảo sát,
// điểm thưởng, và báo cáo hoạt động — làm sai lệch thống kê dữ liệu.
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot deactivate your own account.' });
    }
    const user = await User.findByPk(id, { attributes: ['id', 'full_name', 'email', 'status', 'role'] });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'Admin') return res.status(403).json({ message: 'Cannot deactivate admin accounts.' });
    if (user.status === 'Deactivated') {
      return res.status(400).json({ message: 'User is already deactivated.' });
    }

    await user.update({ status: 'Deactivated' });
    res.json({ message: 'User has been deactivated. Their historical data is preserved.' });
  } catch (err) {
    logger.error('deleteUser error:', err);
    res.status(500).json({ message: 'Failed to deactivate user.' });
  }
};

// ── GET /api/admin/stats ─────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [usersByRole, usersByStatus, surveysByStatus, recentParticipations] = await Promise.all([
      User.findAll({
        attributes: ['role', [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']],
        group: ['role'],
        raw: true,
      }),
      User.findAll({
        attributes: ['status', [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']],
        group: ['status'],
        raw: true,
      }),
      Survey.findAll({
        attributes: ['status', [Survey.sequelize.fn('COUNT', Survey.sequelize.col('id')), 'count']],
        group: ['status'],
        raw: true,
      }),
      SurveyResponse.count({
        where: {
          submitted_at: { [Op.gte]: new Date(Date.now() - 7 * 86400 * 1000) },
        },
      }),
    ]);

    const pendingParticipations = await Participation.count({ where: { status: 'Pending' } });
    const totalUsers = await User.count();

    res.json({ usersByRole, usersByStatus, surveysByStatus, recentParticipations, pendingParticipations, totalUsers });
  } catch (err) {
    logger.error('getStats error:', err);
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
};

// ── GET /api/admin/pending-participations ─────────────────────
exports.getPendingParticipations = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Participation.findAndCountAll({
      where: { status: 'Pending' },
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'username', 'role'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({ participations: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
  } catch (err) {
    logger.error('getPendingParticipations error:', err);
    res.status(500).json({ message: 'Failed to fetch pending participations.' });
  }
};

// ── CRUD FAQs ─────────────────────────────────────────────────
exports.getFAQs = async (_req, res) => {
  try {
    // FIX #19: Lọc theo is_active — loại bỏ FAQs đã bị vô hiệu hoá
    const faqs = await FAQ.findAll({
      where: { is_active: true },
      order: [['created_at', 'DESC']],
    });
    res.json({ faqs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch FAQs.' });
  }
};

exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    if (!question || !answer) return res.status(400).json({ message: 'Question and answer are required.' });
    const faq = await FAQ.create({ question, answer, category });
    res.status(201).json({ message: 'FAQ created.', faq });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create FAQ.' });
  }
};

exports.updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found.' });

    // FIX #5b: Whitelist fields được phép cập nhật
    const { question, answer, category, is_active } = req.body;
    await faq.update({ question, answer, category, is_active });
    res.json({ message: 'FAQ updated.', faq });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update FAQ.' });
  }
};

exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found.' });
    await faq.destroy();
    res.json({ message: 'FAQ deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete FAQ.' });
  }
};
