import api from './axiosInstance'

export const homepageService = {
  getStats:              () => api.get('/homepage/stats'),
  getTopSurveys:         () => api.get('/homepage/top-surveys'),
  getRecentRespondents:  () => api.get('/homepage/recent-respondents'),
}