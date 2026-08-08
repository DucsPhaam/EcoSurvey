// Frontend API service for fetching personal and admin dashboard analytics.
import api from './axiosInstance'

export const dashboardService = {
  getDashboard: () => api.get('/dashboard'),
}
