// Admin controller: Handles user management, Excel import, account approval, system stats, and survey grading.
const { Op } = require('sequelize');
const { User, Survey, SurveyResponse, Participation, Notification, FAQ } = require('../models');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');
const ExcelJS = require('exceljs');
const bcrypt = require('bcrypt');

// Retrieves paginated user list with role, status, and keyword search filters.
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

// Imports user accounts in bulk from an Excel file (.xlsx).
exports.importUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No Excel file provided.' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return res.status(400).json({ message: 'Excel file is empty.' });
    }

    let successful = 0;
    let failed = 0;
    const errors = [];

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      if (!row.hasValues) continue;

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
        role = 'Student';
      }

      try {
        const password_hash = await bcrypt.hash(password, 10);
        await User.create({
          full_name,
          username,
          email,
          password_hash,
          role,
          status: 'Approved',
          student_staff_id,
          class_name,
          department,
          email_verified: true,
        });
        successful++;
      } catch (err) {
        failed++;
        errors.push(`Row ${rowNumber}: ${err.errors?.[0]?.message || 'Database error'}`);
      }
    }

    res.json({
      message: `Import completed. ${successful} created, ${failed} failed.`,
      successful,
      failed,
      errors: errors.slice(0, 10),
    });
  } catch (err) {
    logger.error('importUsers error:', err);
    res.status(500).json({ message: 'Failed to process Excel file.' });
  }
};

// Approves (`Approved`) or rejects (`Rejected`) user registration requests.
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

    await Notification.create({
      user_id:        user.id,
      title:          status === 'Approved' ? 'Account Approved' : 'Account Rejected',
      message:        status === 'Approved'
        ? 'Your account has been approved. You can now log in.'
        : `Your account registration was rejected. ${reject_reason ? 'Reason: ' + reject_reason : 'Please contact Admin for details.'}`,
      reference_type: 'user',
      reference_id:   user.id,
    });

    emailService.sendStatusUpdateEmail(user.email, user.full_name, status, reject_reason).catch(logger.error);

    res.json({ message: `Account ${status === 'Approved' ? 'approved' : 'rejected'} successfully.`, user });
  } catch (err) {
    logger.error('updateUserStatus error:', err);
    res.status(500).json({ message: 'Failed to update user status.' });
  }
};

// Soft-deletes user account by setting status to Deactivated.
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

// Aggregates system-wide overview statistics.
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

// Retrieves list of pending extracurricular proof reports (`status = Pending`).
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

// Retrieves list of active FAQs for admin management.
exports.getFAQs = async (_req, res) => {
  try {
    const faqs = await FAQ.findAll({
      where: { is_active: true },
      order: [['created_at', 'DESC']],
    });
    res.json({ faqs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch FAQs.' });
  }
};

// Adds a new FAQ entry.
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

// Updates FAQ content.
exports.updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found.' });

    const { question, answer, category, is_active } = req.body;
    await faq.update({ question, answer, category, is_active });
    res.json({ message: 'FAQ updated.', faq });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update FAQ.' });
  }
};

// Deletes an FAQ entry.
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
