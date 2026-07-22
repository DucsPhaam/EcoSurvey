const bcrypt = require('bcrypt');
const { User } = require('../models');
const logger = require('../utils/logger');

// PATCH /api/users/me/profile
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, email, department } = req.body;
    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name.trim();
    if (email !== undefined) {
      // Check email uniqueness
      const existing = await User.findOne({ where: { email: email.trim() } });
      if (existing && existing.id !== req.user.id) {
        return res.status(409).json({ message: 'Email is already in use by another account.' });
      }
      updates.email = email.trim();
    }
    if (department !== undefined) updates.department = department.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update.' });
    }

    await User.update(updates, { where: { id: req.user.id } });
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash', 'reset_password_token', 'reset_password_expires', 'email_verify_token'] }
    });
    res.json({ message: 'Profile updated successfully.', user: updatedUser });
  } catch (err) {
    logger.error('updateProfile error:', err);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};

// PATCH /api/users/me/password
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }
    if (new_password !== confirm_password) {
      return res.status(400).json({ message: 'New password and confirmation do not match.' });
    }
    if (new_password.length < 8 || !/[A-Z]/.test(new_password) || !/[0-9]/.test(new_password)) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters and include an uppercase letter and a number.',
      });
    }

    const user = await User.findByPk(req.user.id, { attributes: ['id', 'password_hash'] });
    if (!user) return res.status(404).json({ message: 'Account not found.' });

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    if (current_password === new_password) {
      return res.status(400).json({ message: 'New password must be different from the current password.' });
    }

    const password_hash = await bcrypt.hash(new_password, 10);
    await user.update({ password_hash });

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    logger.error('changePassword error:', err);
    res.status(500).json({ message: 'Server error while changing password.' });
  }
};

// PATCH /api/users/me/theme
exports.updateTheme = async (req, res) => {
  try {
    const { ui_theme } = req.body;
    if (!['light', 'dark'].includes(ui_theme)) {
      return res.status(400).json({ message: 'Invalid theme. Must be light or dark.' });
    }
    await User.update({ ui_theme }, { where: { id: req.user.id } });
    res.json({ message: 'Theme updated.', ui_theme });
  } catch (err) {
    logger.error('updateTheme error:', err);
    res.status(500).json({ message: 'Failed to update theme.' });
  }
};

// GET /api/users/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
};

// GET /api/users/me/points
exports.getPointHistory = async (req, res) => {
  try {
    const { PointLog } = require('../models');
    const logs = await PointLog.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 50
    });
    const totalResult = await PointLog.sum('points', { where: { user_id: req.user.id } });
    const total = totalResult || 0;
    res.json({ logs, total });
  } catch (err) {
    logger.error('getPointHistory error:', err);
    res.status(500).json({ message: 'Failed to fetch point history.' });
  }
};

// POST /api/users/me/avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    const storageService = require('../services/storageService');
    const result = await storageService.uploadBuffer(req.file.buffer, 'avatars');
    
    await User.update({ avatar_url: result.secure_url }, { where: { id: req.user.id } });
    res.json({ message: 'Avatar updated successfully.', avatar_url: result.secure_url });
  } catch (err) {
    logger.error('uploadAvatar error:', err);
    res.status(500).json({ message: 'Failed to upload avatar.' });
  }
};

// GET /api/users/me/badges
exports.getBadges = async (req, res) => {
  try {
    const { Badge, UserBadge } = require('../models');
    
    // Get all available badges
    const allBadges = await Badge.findAll({ order: [['id', 'ASC']] });
    
    // Get badges earned by user
    const earnedBadges = await UserBadge.findAll({
      where: { user_id: req.user.id }
    });
    const earnedBadgeIds = new Set(earnedBadges.map(ub => ub.badge_id));

    // Map to include earned status and earned_at date
    const badgesWithStatus = allBadges.map(b => {
      const earned = earnedBadges.find(ub => ub.badge_id === b.id);
      return {
        id: b.id,
        name: b.name,
        icon_emoji: b.icon_emoji,
        description: b.description,
        is_earned: !!earned,
        earned_at: earned ? earned.earned_at : null
      };
    });

    res.json({ badges: badgesWithStatus });
  } catch (err) {
    logger.error('getBadges error:', err);
    res.status(500).json({ message: 'Failed to fetch badges.' });
  }
};
