import api from './axiosInstance'

export const userService = {
  getMe: () => api.get('/users/me'),
  updateTheme: (ui_theme) => api.patch('/users/me/theme', { ui_theme }),
  changePassword: (current_password, new_password, confirm_password) =>
    api.patch('/users/me/password', { current_password, new_password, confirm_password }),
  getPointHistory: () => api.get('/users/me/points'),
  getBadges: () => api.get('/users/me/badges'),
  uploadAvatar: (formData) => api.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}
