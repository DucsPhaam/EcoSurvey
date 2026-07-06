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

const signAccessToken = (user) =>
  jwt.sign(
    { user_id: user.id, role: user.role, full_name: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );

const createRefreshToken = async (userId) => {
  const raw = crypto.randomBytes(64).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 86400 * 1000);
  await RefreshToken.create({ user_id: userId, token_hash: hash, expires_at: expiresAt });
  return raw;
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const {
      full_name, username, email, password, confirm_password,
      role, student_staff_id, class_name, department, joined_date,
    } = req.body;

    if (!full_name || !username || !email || !password || !confirm_password || !role) {
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
      where: { [Op.or]: [{ username }, { email }] },
      attributes: ['id', 'username', 'email'],
    });
    if (existing) {
      if (existing.username === username) return res.status(409).json({ message: 'Username already taken.' });
      return res.status(409).json({ message: 'Email address already in use.' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    await User.create({
      full_name, username, email, password_hash, role,
      student_staff_id, class_name, department,
      joined_date: joined_date || null,
      status: 'Pending',
    });

    emailService.sendRegistrationEmail(email, full_name).catch(logger.error);

    res.status(201).json({ message: 'Registration successful! Your account is pending admin approval.' });
  } catch (err) {
    logger.error('register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// GET /api/auth/check-username?username=xxx
exports.checkUsername = async (req, res) => {
  const { username } = req.query;
  if (!username) return res.json({ available: false });
  const found = await User.findOne({ where: { username }, attributes: ['id'] });
  res.json({ available: !found });
};

// GET /api/auth/check-email?email=xxx
exports.checkEmail = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.json({ available: false });
  const found = await User.findOne({ where: { email }, attributes: ['id'] });
  res.json({ available: !found });
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ message: 'Please provide your username/email and password.' });
    }

    const user = await User.findOne({
      where: { [Op.or]: [{ username: login }, { email: login }] },
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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
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

// POST /api/auth/refresh
exports.refresh = async (req, res) => {
  try {
    const raw = req.cookies?.refreshToken;
    if (!raw) return res.status(401).json({ message: 'No refresh token found.' });

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

// POST /api/auth/logout
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
