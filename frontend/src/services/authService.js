/**
 * @module AuthServiceFrontend
 * @description Dịch vụ API phía Frontend thực hiện Đăng nhập, Đăng ký, Đăng xuất, Làm mới token và kiểm tra trùng lặp tài khoản.
 * 
 * @relations
 * - Backend: `backend/src/routes/authRoutes.js`, `backend/src/controllers/authController.js`.
 * - Context & Pages: `AuthContext.jsx`, `LoginPage.jsx`, `RegisterPage.jsx`.
 */
import api from './axiosInstance'

export const authService = {
  login: (login, password, captchaToken) => api.post('/auth/login', { login, password, 'cf-turnstile-response': captchaToken }),
  register: (data, captchaToken) => api.post('/auth/register', { ...data, 'cf-turnstile-response': captchaToken }),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  checkUsername: (username) => api.get('/auth/check-username', { params: { username } }),
  checkEmail: (email) => api.get('/auth/check-email', { params: { email } }),
}
