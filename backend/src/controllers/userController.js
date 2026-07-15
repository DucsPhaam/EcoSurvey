const bcrypt = require('bcrypt');
const { User } = require('../models');
const logger = require('../utils/logger');

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
    res.json({ logs });
  } catch (err) {
    logger.error('getPointHistory error:', err);
    res.status(500).json({ message: 'Failed to fetch point history.' });
  }
};
