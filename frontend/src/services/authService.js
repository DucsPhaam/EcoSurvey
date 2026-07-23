import api from './axiosInstance'

export const authService = {
  login: (login, password, captchaToken) => api.post('/auth/login', { login, password, 'cf-turnstile-response': captchaToken }),
  register: (data, captchaToken) => api.post('/auth/register', { ...data, 'cf-turnstile-response': captchaToken }),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  checkUsername: (username) => api.get('/auth/check-username', { params: { username } }),
  checkEmail: (email) => api.get('/auth/check-email', { params: { email } }),
}
