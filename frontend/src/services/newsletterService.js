import api from './axiosInstance'

export const newsletterService = {
  subscribe: (email) => api.post('/newsletter/subscribe', { email }),
}