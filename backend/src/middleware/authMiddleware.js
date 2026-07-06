const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Verifies JWT access token and attaches req.user.
 * Token can be sent via Authorization header (Bearer) or httpOnly cookie.
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Re-verify user still exists and is approved
    const user = await User.findByPk(decoded.user_id, {
      attributes: ['id', 'full_name', 'role', 'status', 'ui_theme', 'avatar_url'],
    });

    if (!user) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại.' });
    }
    if (user.status !== 'Approved') {
      return res.status(401).json({ message: 'Tài khoản chưa được kích hoạt.' });
    }

    req.user = {
      id:        user.id,
      full_name: user.full_name,
      role:      user.role,
      ui_theme:  user.ui_theme,
      avatar_url: user.avatar_url,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Token không hợp lệ.' });
  }
};

module.exports = { authenticate };
