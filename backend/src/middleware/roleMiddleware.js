/**
 * Role-Based Access Control middleware factory.
 * Usage: authorize('Admin') or authorize('Admin', 'Staff')
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa xác thực.' });
  }
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Bạn không có quyền truy cập. Yêu cầu vai trò: ${allowedRoles.join(' hoặc ')}.`,
    });
  }
  next();
};

module.exports = { authorize };
