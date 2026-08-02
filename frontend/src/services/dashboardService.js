/**
 * @module DashboardServiceFrontend
 * @description Dịch vụ API phía Frontend lấy dữ liệu thống kê Dashboard cá nhân và Admin.
 * 
 * @relations
 * - Backend: `backend/src/routes/dashboardRoutes.js`, `backend/src/controllers/dashboardController.js`.
 * - Pages UI: `MyDashboard.jsx`, `AdminDashboard.jsx`.
 */
import api from './axiosInstance'

export const dashboardService = {
  getDashboard: () => api.get('/dashboard'),
}
