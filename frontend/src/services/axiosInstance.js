/**
 * @module AxiosInstance
 * @description Đơn vị cấu hình HTTP Client tập trung (Axios) cho toàn bộ ứng dụng Frontend, tự động đính kèm Access Token vào Header và tự động gia hạn token khi hết hạn (JWT Auto-refresh Interceptor).
 * 
 * @constant api
 * @description Thể hiện Axios đã cấu hình `baseURL`, `withCredentials: true` (để gửi kèm cookie refreshToken) và timeout 30s.
 * 
 * @implementation
 * - **Request Interceptor**: Lấy token từ `localStorage.getItem('ecosurvey_token')` và chèn vào `Authorization: Bearer <token>`.
 * - **Response Interceptor**: Bắt lỗi HTTP 401. Nếu không phải yêu cầu đăng nhập/làm mới token, tạm dừng các request và gọi `POST /auth/refresh`. Nếu làm mới thành công, lưu token mới và thực hiện lại yêu cầu bị lỗi. Nếu thất bại, chuyển hướng người dùng về trang `/login`.
 * 
 * @relations
 * - Tất cả các frontend services (`authService.js`, `adminService.js`, `surveyService.js`, v.v.) import và sử dụng thể hiện `api` này.
 * - Backend tương ứng: `backend/src/middleware/authMiddleware.js`, `backend/src/controllers/authController.js`.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecosurvey_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    const isAuthRoute = originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`
          return api(originalRequest)
        }).catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true
      try {
        const res = await api.post('/auth/refresh')
        const newToken = res.data.accessToken
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        localStorage.setItem('ecosurvey_token', newToken)
        processQueue(null, newToken)
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('ecosurvey_token')
        localStorage.removeItem('ecosurvey_user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
