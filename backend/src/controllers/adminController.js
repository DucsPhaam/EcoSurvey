/**
 * @module AdminController
 * @description Controller xử lý các chức năng quản trị dành cho Admin (Quản lý người dùng, Import Excel, Duyệt/Khóa tài khoản, Thống kê hệ thống, Quản lý FAQ).
 */
const { Op } = require('sequelize');
const { User, Survey, SurveyResponse, Participation, Notification, FAQ } = require('../models');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');
const ExcelJS = require('exceljs');
const bcrypt = require('bcrypt');

/**
 * @function getUsers
 * @description Lấy danh sách người dùng phân trang có hỗ trợ lọc theo vai trò (role), trạng thái (status) và tìm kiếm từ khóa.
 * @param {Object} req - Express Request object chứa req.query (role, status, search, page, limit).
 * @param {Object} res - Express Response object trả về danh sách users và thông tin phân trang.
 * 
 * @implementation
 * - Bước 1: Trích xuất tham số `role`, `status`, `search`, `page`, `limit` từ `req.query`.
 * - Bước 2: Tạo đối tượng lọc `where`, áp dụng `Op.like` cho full_name, username, email, student_staff_id nếu có từ khóa search.
 * - Bước 3: Gọi `User.findAndCountAll` ẩn `password_hash`, sắp xếp giảm dần theo ngày tạo.
 * - Bước 4: Trả về kết quả JSON với dữ liệu phân trang.
 * 
 * @relations
 * - Route: `GET /api/admin/users` trong `adminRoutes.js`.
 * - Guard: `authenticate`, `authorize('Admin')`.
 * - Frontend: `adminService.getUsers` gọi từ trang `UserManagement.jsx`.
 */
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

/**
 * @function importUsers
 * @description Nhập danh sách tài khoản người dùng hàng loạt từ tệp Excel (.xlsx).
 * @param {Object} req - Express Request object chứa tệp Excel trong `req.file.buffer`.
 * @param {Object} res - Express Response object trả về báo cáo số bản ghi thành công/thất bại.
 * 
 * @implementation
 * - Bước 1: Kiểm tra tệp đính kèm trong `req.file`. Sử dụng `exceljs` nạp dữ liệu từ buffer.
 * - Bước 2: Duyệt từng dòng từ dòng thứ 2 (bỏ qua dòng tiêu đề).
 * - Bước 3: Đọc các trường: FullName, Username, Email, Password, Role, ID, Class, Dept.
 * - Bước 4: Mã hóa mật khẩu với `bcrypt.hash` và tự động cấp trạng thái `Approved`, `email_verified: true`.
 * - Bước 5: Tạo người dùng với `User.create`. Bắt lỗi trùng lặp username/email để ghi nhận dòng thất bại.
 * 
 * @relations
 * - Route: `POST /api/admin/users/import` trong `adminRoutes.js`.
 * - Guard: `upload.single('file')`, `authenticate`, `authorize('Admin')`.
 * - Frontend: `adminService.importUsers` từ `UserManagement.jsx`.
 */
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

/**
 * @function updateUserStatus
 * @description Duyệt (`Approved`) hoặc từ chối (`Rejected`) yêu cầu đăng ký tài khoản người dùng.
 * @param {Object} req - Express Request object chứa `req.params.id` và `req.body` (`status`, `reject_reason`).
 * @param {Object} res - Express Response object.
 * 
 * @implementation
 * - Bước 1: Kiểm tra `status` phải là 'Approved' hoặc 'Rejected'.
 * - Bước 2: Tìm người dùng theo ID. Ngăn chặn việc thay đổi trạng thái của tài khoản Admin.
 * - Bước 3: Cập nhật `status` và `reject_reason` trong bảng `users`.
 * - Bước 4: Tạo thông báo trong hệ thống qua `Notification.create`.
 * - Bước 5: Gửi email tự động thông báo kết quả cho người dùng qua `emailService.sendStatusUpdateEmail`.
 * 
 * @relations
 * - Route: `PATCH /api/admin/users/:id/status` trong `adminRoutes.js`.
 * - Service: `emailService.js`.
 * - Frontend: `adminService.updateUserStatus` gọi từ `UserManagement.jsx`.
 */
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

/**
 * @function deleteUser
 * @description Vô hiệu hóa tài khoản người dùng (Soft-delete: chuyển `status = 'Deactivated'`) nhằm bảo toàn lịch sử dữ liệu khảo sát và điểm tích lũy.
 * @param {Object} req - Express Request object chứa `req.params.id`.
 * @param {Object} res - Express Response object.
 * 
 * @implementation
 * - Bước 1: Kiểm tra không cho phép Admin tự vô hiệu hóa tài khoản của chính mình.
 * - Bước 2: Tìm người dùng và kiểm tra nếu tài khoản là Admin hoặc đã bị Deactivated từ trước.
 * - Bước 3: Cập nhật `status = 'Deactivated'`.
 * 
 * @relations
 * - Route: `DELETE /api/admin/users/:id` trong `adminRoutes.js`.
 * - Frontend: `adminService.deleteUser` từ `UserManagement.jsx`.
 */
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

/**
 * @function getStats
 * @description Tổng hợp dữ liệu thống kê tổng quan toàn hệ thống dành cho Admin Dashboard.
 * @param {Object} req - Express Request object.
 * @param {Object} res - Express Response object trả về các chỉ số thống kê.
 * 
 * @implementation
 * - Bước 1: Sử dụng `Promise.all` đếm song song: người dùng theo role, người dùng theo status, khảo sát theo status, và lượt làm khảo sát trong 7 ngày gần nhất.
 * - Bước 2: Đếm số báo cáo minh chứng đang chờ duyệt (`Pending`) và tổng số người dùng.
 * - Bước 3: Trả về kết quả JSON tổng hợp.
 * 
 * @relations
 * - Route: `GET /api/admin/stats` trong `adminRoutes.js`.
 * - Frontend: `adminService.getDashboardStats` từ `AdminDashboard.jsx`.
 */
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

/**
 * @function getPendingParticipations
 * @description Lấy danh sách các bài báo cáo minh chứng ngoại khóa đang chờ duyệt (`status = 'Pending'`).
 * @param {Object} req - Express Request object chứa `req.query` (page, limit).
 * @param {Object} res - Express Response object.
 * 
 * @implementation
 * - Bước 1: Tính toán `offset` phân trang.
 * - Bước 2: Gọi `Participation.findAndCountAll` điều kiện `status: 'Pending'`, bao gồm thông tin người dùng gửi (`User`).
 * - Bước 3: Trả về danh sách và thông tin phân trang.
 * 
 * @relations
 * - Route: `GET /api/admin/pending-participations` trong `adminRoutes.js`.
 * - Frontend: `adminService.getPendingParticipations` từ `ParticipationReview.jsx`.
 */
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

/**
 * @function getFAQs
 * @description Lấy danh sách câu hỏi thường gặp FAQ đang hoạt động cho giao diện quản trị.
 */
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

/**
 * @function createFAQ
 * @description Thêm câu hỏi thường gặp FAQ mới.
 */
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

/**
 * @function updateFAQ
 * @description Chỉnh sửa nội dung câu hỏi thường gặp FAQ.
 */
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

/**
 * @function deleteFAQ
 * @description Xóa câu hỏi thường gặp FAQ.
 */
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
