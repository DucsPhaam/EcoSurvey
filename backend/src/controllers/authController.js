/**
 * @module AuthController
 * @description Controller quản lý các luồng xác thực người dùng: Đăng ký tài khoản, Đăng nhập, Làm mới token, Đăng xuất, Quên/Đặt lại mật khẩu, Xác minh email, và Đăng nhập bằng Google OAuth.
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, RefreshToken } = require('../models');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

const SALT_ROUNDS = 10;
const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_DAYS   = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '7', 10);

/**
 * @function signAccessToken
 * @description Tạo chuỗi JWT Access Token chứa payload thông tin người dùng với thời hạn ngắn (15 phút).
 * @param {Object} user - Bản ghi User từ Sequelize.
 * @returns {string} Chuỗi JWT token mã hóa.
 */
const signAccessToken = (user) =>
  jwt.sign(
    { user_id: user.id, role: user.role, full_name: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );

/**
 * @function createRefreshToken
 * @description Tạo mã Refresh Token ngẫu nhiên (64 bytes), lưu dạng SHA-256 hash vào bảng `refresh_tokens` trong CSDL và trả về chuỗi token gốc.
 * @param {number} userId - Mã ID người dùng.
 * @returns {Promise<string>} Chuỗi token ngẫu nhiên dạng hex.
 */
const createRefreshToken = async (userId) => {
  const raw = crypto.randomBytes(64).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 86400 * 1000);
  await RefreshToken.create({ user_id: userId, token_hash: hash, expires_at: expiresAt });
  return raw;
};

/**
 * @function register
 * @description Tiếp nhận yêu cầu đăng ký tài khoản sinh viên/cán bộ mới.
 * @param {Object} req - Request chứa thông tin đăng ký trong `req.body`.
 * @param {Object} res - Response phản hồi kết quả.
 * 
 * @implementation
 * - Bước 1: Kiểm tra tính hợp lệ của dữ liệu (các trường bắt buộc, độ dài mật khẩu >= 8 gồm chữ hoa và số).
 * - Bước 2: Kiểm tra sự tồn tại của `username` hoặc `email` trong CSDL.
 * - Bước 3: Băm mật khẩu bằng `bcrypt.hash` và lưu người dùng ở trạng thái `status: 'Pending'`.
 * - Bước 4: Gửi email tự động thông báo đăng ký đang chờ Admin duyệt qua `emailService.sendRegistrationEmail`.
 * 
 * @relations
 * - Route: `POST /api/auth/register` trong `authRoutes.js`.
 * - Guard: `captchaMiddleware` (Turnstile CAPTCHA).
 * - Frontend: `authService.register` từ `RegisterPage.jsx`.
 */
exports.register = async (req, res) => {
  try {
    const {
      full_name, username, email, password, confirm_password,
      role, student_staff_id, class_name, department, joined_date,
      google_id
    } = req.body;

    const cleanFullName = (full_name || '').trim();
    const cleanUsername = (username || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanId = (student_staff_id || '').trim();
    const cleanClass = (class_name || '').trim();
    const cleanDepartment = (department || '').trim();

    if (!cleanFullName || !cleanUsername || !cleanEmail || !password || !confirm_password || !role) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters and include an uppercase letter and a number.' });
    }
    if (!['Student', 'Staff'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role selected.' });
    }

    const existing = await User.findOne({
      where: { [Op.or]: [{ username: cleanUsername }, { email: cleanEmail }] },
      attributes: ['id', 'username', 'email'],
    });
    if (existing) {
      if (existing.username === cleanUsername) return res.status(409).json({ message: 'Username already taken.' });
      return res.status(409).json({ message: 'Email address already in use.' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    await User.create({
      full_name: cleanFullName,
      username: cleanUsername,
      email: cleanEmail,
      password_hash,
      role,
      student_staff_id: cleanId,
      class_name: cleanClass,
      department: cleanDepartment,
      joined_date: joined_date || null, 
      status: 'Pending',
      google_id: google_id || null,
      auth_provider: google_id ? 'google' : 'local'
    });

    emailService.sendRegistrationEmail(cleanEmail, cleanFullName).catch(logger.error);

    res.status(201).json({ message: 'Registration successful! Your account is pending admin approval.' });
  } catch (err) {
    logger.error('register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

/**
 * @function checkUsername
 * @description Kiểm tra tên đăng nhập username đã tồn tại trong hệ thống chưa (dùng cho validation real-time ở form đăng ký).
 */
exports.checkUsername = async (req, res) => {
  const username = (req.query.username || '').trim();
  if (!username) return res.json({ available: false });
  const found = await User.findOne({ where: { username }, attributes: ['id'] });
  res.json({ available: !found });
};

/**
 * @function checkEmail
 * @description Kiểm tra địa chỉ email đã tồn tại trong hệ thống chưa (dùng cho validation real-time ở form đăng ký).
 */
exports.checkEmail = async (req, res) => {
  const email = (req.query.email || '').trim().toLowerCase();
  if (!email) return res.json({ available: false });
  const found = await User.findOne({ where: { email }, attributes: ['id'] });
  res.json({ available: !found });
};

/**
 * @function login
 * @description Đăng nhập tài khoản bằng Username/Email và Password.
 * @param {Object} req - Request chứa `login` (username hoặc email) và `password`.
 * @param {Object} res - Response trả về `accessToken` và ghi cookie `refreshToken`.
 * 
 * @implementation
 * - Bước 1: Tìm kiếm tài khoản theo `username` hoặc `email`.
 * - Bước 2: So sánh mật khẩu bằng `bcrypt.compare`.
 * - Bước 3: Kiểm tra trạng thái tài khoản (`Pending`, `Rejected`, `Deactivated`). Nếu chưa duyệt/bị từ chối thì từ chối cấp token.
 * - Bước 4: Cấp `accessToken` và tạo `refreshToken` đặt vào Cookie HTTP-Only.
 * 
 * @relations
 * - Route: `POST /api/auth/login` trong `authRoutes.js`.
 * - Guard: `loginLimiter` (giới hạn số lần đăng nhập).
 * - Frontend: `authService.login` từ `LoginPage.jsx`.
 */
exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;
    const cleanLogin = (login || '').trim();
    if (!cleanLogin || !password) {
      return res.status(400).json({ message: 'Please provide your username/email and password.' });
    }

    const user = await User.findOne({
      where: { [Op.or]: [{ username: cleanLogin }, { email: cleanLogin }] },
    });

    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    if (user.status === 'Pending')  return res.status(403).json({ message: 'Your account is pending admin approval.', code: 'PENDING' });
    if (user.status === 'Rejected') return res.status(403).json({ message: 'Your account has been rejected. Please contact Admin.', reason: user.reject_reason, code: 'REJECTED' });

    const accessToken  = signAccessToken(user);
    const refreshToken = await createRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL?.includes('localhost'),
      sameSite: process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL?.includes('localhost') ? 'strict' : 'lax',
      maxAge: REFRESH_DAYS * 86400 * 1000,
    });

    res.json({
      message: 'Login successful.',
      accessToken,
      user: {
        id:         user.id,
        full_name:  user.full_name,
        username:   user.username,
        email:      user.email,
        role:       user.role,
        ui_theme:   user.ui_theme,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    logger.error('login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

/**
 * @function refresh
 * @description Đổi Refresh Token lấy Access Token mới để duy trì phiên đăng nhập mà không cần người dùng nhập lại mật khẩu.
 */
exports.refresh = async (req, res) => {
  try {
    const raw = req.cookies?.refreshToken;
    if (!raw) return res.status(401).json({ message: 'Refresh token missing.' });

    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    const stored = await RefreshToken.findOne({ where: { token_hash: hash } });

    if (!stored || stored.revoked || new Date(stored.expires_at) < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired refresh token.' });
    }

    const user = await User.findByPk(stored.user_id, { attributes: ['id', 'full_name', 'role', 'status'] });
    if (!user || user.status !== 'Approved') {
      return res.status(401).json({ message: 'Account is not active.' });
    }

    const accessToken = signAccessToken(user);
    res.json({ accessToken });
  } catch (err) {
    logger.error('refresh error:', err);
    res.status(500).json({ message: 'Server error during token refresh.' });
  }
};

/**
 * @function logout
 * @description Đăng xuất tài khoản, thu hồi (revoke) Refresh Token trong CSDL và xóa cookie.
 */
exports.logout = async (req, res) => {
  try {
    const raw = req.cookies?.refreshToken;
    if (raw) {
      const hash = crypto.createHash('sha256').update(raw).digest('hex');
      await RefreshToken.update({ revoked: true }, { where: { token_hash: hash } });
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    logger.error('logout error:', err);
    res.status(500).json({ message: 'Server error during logout.' });
  }
};

/**
 * @function forgotPassword
 * @description Tiếp nhận yêu cầu quên mật khẩu, tạo token đặt lại mật khẩu và gửi email hướng dẫn.
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) return res.status(400).json({ message: 'Email là bắt buộc.' });

    const user = await User.findOne({ where: { email: cleanEmail } });
    if (!user) return res.json({ message: 'Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu.' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await user.update({
      reset_password_token: tokenHash,
      reset_password_expires: expires,
    });

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:8080').replace(/\/+$/, '');
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
    emailService.sendForgotPasswordEmail(email, user.full_name, resetUrl).catch(logger.error);

    res.json({ message: 'Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu.' });
  } catch (err) {
    logger.error('forgotPassword error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * @function resetPassword
 * @description Cập nhật mật khẩu mới bằng token xác thực nhận được qua email.
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, email, password, confirm_password } = req.body;
    if (!token || !email || !password || !confirm_password) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp.' });
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ message: 'Mật khẩu phải ít nhất 8 ký tự, có chữ hoa và chữ số.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ where: { email, reset_password_token: tokenHash } });

    if (!user) return res.status(400).json({ message: 'Liên kết đặt lại mật khẩu không hợp lệ.' });
    if (new Date(user.reset_password_expires) < new Date()) {
      return res.status(400).json({ message: 'Liên kết đặt lại mật khẩu đã hết hạn. Vui lòng thử lại.' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    await user.update({
      password_hash,
      reset_password_token: null,
      reset_password_expires: null,
    });
    await RefreshToken.update({ revoked: true }, { where: { user_id: user.id } });

    res.json({ message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.' });
  } catch (err) {
    logger.error('resetPassword error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * @function sendVerificationEmail
 * @description Gửi lại email xác minh địa chỉ email người dùng.
 */
exports.sendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Tài khoản không tồn tại.' });
    if (user.email_verified) return res.json({ message: 'Email đã được xác minh.' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await user.update({ email_verify_token: tokenHash });

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:8080').replace(/\/+$/, '');
    const verifyUrl = `${clientUrl}/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
    emailService.sendEmailVerificationEmail(user.email, user.full_name, verifyUrl).catch(logger.error);

    res.json({ message: 'Email xác minh đã được gửi.' });
  } catch (err) {
    logger.error('sendVerificationEmail error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * @function verifyEmail
 * @description Xác thực liên kết xác minh địa chỉ email.
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;
    if (!token || !email) return res.status(400).json({ message: 'Thiếu thông tin xác minh.' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ where: { email, email_verify_token: tokenHash } });

    if (!user) return res.status(400).json({ message: 'Liên kết xác minh không hợp lệ hoặc đã được dùng.' });

    await user.update({ email_verified: true, email_verify_token: null });
    res.json({ message: 'Email đã được xác minh thành công!' });
  } catch (err) {
    logger.error('verifyEmail error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * @function googleCallback
 * @description Xử lý chuyển hướng sau khi hoàn tất xác thực từ Google OAuth 2.0.
 */
exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:8080').replace(/\/+$/, '');

    if (user.isNewGoogleUser) {
      const params = new URLSearchParams({
        email: user.email || '',
        name: user.full_name || '',
        google_id: user.google_id || ''
      });
      return res.redirect(`${clientUrl}/register?${params.toString()}`);
    }

    if (user.status === 'Pending') {
      return res.redirect(`${clientUrl}/login?error=pending`);
    }
    if (user.status === 'Rejected') {
      return res.redirect(`${clientUrl}/login?error=rejected`);
    }
    if (user.status === 'Deactivated') {
      return res.redirect(`${clientUrl}/login?error=deactivated`);
    }

    const accessToken = signAccessToken(user);
    const refreshToken = await createRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL?.includes('localhost'),
      sameSite: process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL?.includes('localhost') ? 'strict' : 'lax',
      maxAge: REFRESH_DAYS * 86400 * 1000,
    });

    res.redirect(`${clientUrl}/oauth/callback?accessToken=${accessToken}`);
  } catch (err) {
    logger.error('googleCallback error:', err);
    const fallbackUrl = (process.env.CLIENT_URL || 'http://localhost:8080').replace(/\/+$/, '');
    res.redirect(`${fallbackUrl}/login?error=server_error`);
  }
};
