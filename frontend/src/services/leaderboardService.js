import api from './axiosInstance'

export const leaderboardService = {
  getLeaderboard: (period = 'all') => api.get('/leaderboard', { params: { period } }),
}
