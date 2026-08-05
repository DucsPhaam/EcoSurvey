/**
 * @module AuthMiddleware
 * @description Middleware xác thực JWT Access Token của các yêu cầu HTTP truy cập vào các tuyến đường được bảo vệ.
 * 
 * @function authenticate
 * @description Trích xuất token từ Authorization Header, Cookie hoặc Query Parameter; giải mã JWT và gắn thông tin người dùng vào `req.user`.
 * @param {Object} req - Request object từ Express.
 * @param {Object} res - Response object từ Express.
 * @param {Function} next - Callback chuyển tiếp xử lý sang handler tiếp theo.
 * @returns {Promise<void>}
 * 
 * @implementation
 * - Bước 1: Trích xuất token từ Header `Authorization: Bearer <token>`, cookie `accessToken`, hoặc URL query `?token=...`.
 * - Bước 2: Trả về lỗi 401 nếu không tìm thấy token.
 * - Bước 3: Sử dụng `jwt.verify(token, JWT_SECRET)` để xác thực tính hợp lệ của token.
 * - Bước 4: Kiểm tra sự tồn tại của người dùng trong CSDL và đảm bảo `status === 'Approved'`. Trả về lỗi 401 nếu tài khoản bị khóa/chưa duyệt.
 * - Bước 5: Gán thông tin người dùng vào `req.user` (`id`, `full_name`, `role`, `ui_theme`, `avatar_url`) và chuyển sang `next()`.
 * - Bước 6: Nếu token hết hạn, trả về mã lỗi `TOKEN_EXPIRED` để Frontend chủ động gọi API làm mới token (`refreshToken`).
 * 
 * @relations
 * - Router sử dụng: Được áp dụng trên hầu hết các đường dẫn yêu cầu đăng nhập (`adminRoutes.js`, `surveyRoutes.js`, `participationRoutes.js`, `userRoutes.js`, `notificationRoutes.js`, `dashboardRoutes.js`, v.v.).
 * - Model liên quan: `User` (`backend/src/models/User.js`).
 * - Phía Frontend: Tương ứng với việc lưu giữ Access Token trong Axios Instance (`frontend/src/services/axiosInstance.js`).
 */
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
      id: user.id,
      full_name: user.full_name,
      role: user.role,
      ui_theme: user.ui_theme,
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
