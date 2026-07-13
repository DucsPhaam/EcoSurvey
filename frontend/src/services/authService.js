import api from './axiosInstance'

export const authService = {
  login: (login, password) => api.post('/auth/login', { login, password }),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  checkUsername: (username) => api.get('/auth/check-username', { params: { username } }),
  checkEmail: (email) => api.get('/auth/check-email', { params: { email } }),
}
