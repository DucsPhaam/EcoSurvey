import api from './axiosInstance'

export const dashboardService = {
  getDashboard: () => api.get('/dashboard'),
}
