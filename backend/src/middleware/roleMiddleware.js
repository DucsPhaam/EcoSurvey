/**
 * @module RoleMiddleware
 * @description Middleware phân quyền dựa trên vai trò người dùng (RBAC - Role-Based Access Control).
 * 
 * @function authorize
 * @description Hàm tạo middleware (middleware factory) kiểm tra vai trò của người dùng trong `req.user.role` có thuộc danh sách các vai trò được phép hay không.
 * @param {...string} allowedRoles - Danh sách các vai trò được phép truy cập (ví dụ: 'Admin', 'Staff', 'Student').
 * @returns {Function} Express middleware function `(req, res, next)`.
 * 
 * @implementation
 * - Bước 1: Kiểm tra xem thông tin người dùng `req.user` đã tồn tại từ middleware `authenticate` chưa. Nếu chưa, trả về lỗi 401.
 * - Bước 2: Kiểm tra `req.user.role` có nằm trong mảng `allowedRoles` được truyền vào hay không.
 * - Bước 3: Nếu không trùng khớp, trả về lỗi 403 Forbidden cùng thông báo chi tiết danh sách vai trò yêu cầu.
 * - Bước 4: Nếu vai trò hợp lệ, gọi `next()` để tiếp tục chuỗi xử lý.
 * 
 * @relations
 * - Router sử dụng: Được dùng tại `adminRoutes.js` (authorize('Admin')), `surveyRoutes.js` (authorize('Admin', 'Staff')), `exportRoutes.js`, v.v.
 * - Phụ thuộc: Đứng phía sau middleware `authenticate` trong chuỗi middleware của Express.
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
