// Auth controller: Handles user registration, login, token refresh, logout, password reset, email verification, and Google OAuth.
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, RefreshToken } = require('../models');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');
const { allowedOrigins, primaryClientUrl } = require('../config/clientOrigins');

const SALT_ROUNDS = 10;
const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN || '15m';
// Number of days the refresh token (cookie + DB row) stays valid.
// Controlled by REFRESH_TOKEN_EXPIRES_DAYS env variable (integer, e.g. "30").
const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10);

// Generates a JWT Access Token with user payload (15m expiration).
const signAccessToken = (user) =>
  jwt.sign(
    { user_id: user.id, role: user.role, full_name: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );

// Generates a random 64-byte Refresh Token, stores its SHA-256 hash in the database, and returns the raw token.
const createRefreshToken = async (userId) => {
  const raw = crypto.randomBytes(64).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 86400 * 1000);
  await RefreshToken.create({ user_id: userId, token_hash: hash, expires_at: expiresAt });
  return raw;
};

// Registers a new student or staff user account.
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

// Checks if the username is already registered.
exports.checkUsername = async (req, res) => {
  const username = (req.query.username || '').trim();
  if (!username) return res.json({ available: false });
  const found = await User.findOne({ where: { username }, attributes: ['id'] });
  res.json({ available: !found });
};

// Checks if the email address is already registered.
exports.checkEmail = async (req, res) => {
  const email = (req.query.email || '').trim().toLowerCase();
  if (!email) return res.json({ available: false });
  const found = await User.findOne({ where: { email }, attributes: ['id'] });
  res.json({ available: !found });
};

// Authenticates user with username/email and password.
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
      // SameSite=None + Secure is required for cross-site cookies (Vercel frontend → Railway API).
      // In development (non-production), use Lax to allow cookies over HTTP.
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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

// Exchanges Refresh Token for a new Access Token.
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

// Logs out user, revokes Refresh Token in database, and clears auth cookie.
exports.logout = async (req, res) => {
  try {
    const raw = req.cookies?.refreshToken;
    if (raw) {
      const hash = crypto.createHash('sha256').update(raw).digest('hex');
      await RefreshToken.update({ revoked: true }, { where: { token_hash: hash } });
    }
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    logger.error('logout error:', err);
    res.status(500).json({ message: 'Server error during logout.' });
  }
};

// Handles forgot password request, generates reset token, and sends instruction email.
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

    const resetUrl = `${primaryClientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
    emailService.sendForgotPasswordEmail(email, user.full_name, resetUrl).catch(logger.error);

    res.json({ message: 'Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu.' });
  } catch (err) {
    logger.error('forgotPassword error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// Resets user password using email verification token.
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

// Resends email verification link to user.
exports.sendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Tài khoản không tồn tại.' });
    if (user.email_verified) return res.json({ message: 'Email đã được xác minh.' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await user.update({ email_verify_token: tokenHash });

    const verifyUrl = `${primaryClientUrl}/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
    emailService.sendEmailVerificationEmail(user.email, user.full_name, verifyUrl).catch(logger.error);

    res.json({ message: 'Email xác minh đã được gửi.' });
  } catch (err) {
    logger.error('sendVerificationEmail error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// Verifies email address via token.
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

// Handles Google OAuth 2.0 callback redirect.
exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;

    let targetClientUrl = primaryClientUrl;
    if (req.query.state) {
      try {
        const refererUrl = Buffer.from(req.query.state, 'base64url').toString('utf8');
        const matched = allowedOrigins.find(origin => refererUrl.startsWith(origin));
        if (matched) {
          targetClientUrl = matched;
        }
      } catch (e) {
        // fallback to primaryClientUrl
      }
    }

    if (user.isNewGoogleUser) {
      const params = new URLSearchParams({
        email: user.email || '',
        name: user.full_name || '',
        google_id: user.google_id || ''
      });
      return res.redirect(`${targetClientUrl}/register?${params.toString()}`);
    }

    if (user.status === 'Pending') {
      return res.redirect(`${targetClientUrl}/login?error=pending`);
    }
    if (user.status === 'Rejected') {
      return res.redirect(`${targetClientUrl}/login?error=rejected`);
    }
    if (user.status === 'Deactivated') {
      return res.redirect(`${targetClientUrl}/login?error=deactivated`);
    }

    const accessToken = signAccessToken(user);
    const refreshToken = await createRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      // SameSite=None + Secure is required for cross-site cookies (Vercel frontend → Railway API).
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: REFRESH_DAYS * 86400 * 1000,
    });

    res.redirect(`${targetClientUrl}/oauth/callback?accessToken=${accessToken}`);
  } catch (err) {
    logger.error('googleCallback error:', err);
    res.redirect(`${primaryClientUrl}/login?error=server_error`);
  }
};
