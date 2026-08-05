/**
 * @module PassportGoogleStrategy
 * @description Cấu hình Middleware Passport.js xử lý xác thực đăng nhập / liên kết tài khoản bằng Google OAuth 2.0.
 * 
 * @implementation
 * - Bước 1: Đăng ký `GoogleStrategy` vào Passport với clientID, clientSecret và callbackURL từ biến môi trường.
 * - Bước 2: Trong hàm callback xác thực `(accessToken, refreshToken, profile, done)`:
 *   - Lấy địa chỉ email từ hồ sơ Google `profile.emails`.
 *   - Tìm kiếm người dùng trong DB theo email hoặc theo `google_id`.
 *   - Nếu tìm thấy user theo email nhưng chưa gán `google_id`, tiến hành cập nhật `google_id` và lưu DB (liên kết tài khoản).
 *   - Nếu user đã tồn tại, trả về user thông qua `done(null, user)`.
 *   - Nếu user chưa tồn tại, trả về một đối tượng tạm thời `{ isNewGoogleUser: true, google_id, email, full_name }` để controller tiếp tục xử lý đăng ký.
 * 
 * @relations
 * - Route liên quan: `GET /api/auth/google` và `GET /api/auth/google/callback` trong `backend/src/routes/authRoutes.js`.
 * - Controller liên quan: `googleCallback` trong `backend/src/controllers/authController.js`.
 * - Model sử dụng: `User` model (`backend/src/models/User.js`).
 */
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'placeholder_client_id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'placeholder_client_secret';

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        let user = null;

        if (email) {
          user = await User.findOne({ where: { email } });
        }

        if (!user) {
          user = await User.findOne({ where: { google_id: profile.id } });
        }

        if (user) {
          // Nếu người dùng đã tồn tại nhưng chưa lưu google_id, tiến hành liên kết tài khoản
          if (!user.google_id) {
            user.google_id = profile.id;
            await user.save();
          }
          return done(null, user);
        } else {
          // Người dùng chưa tồn tại trong hệ thống, trả về thông tin tạm thời để đăng ký
          return done(null, {
            isNewGoogleUser: true,
            google_id: profile.id,
            email: email,
            full_name: profile.displayName,
          });
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
