const { User } = require('../models');
const logger = require('../utils/logger');

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
