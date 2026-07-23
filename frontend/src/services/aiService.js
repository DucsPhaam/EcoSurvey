import api from './axiosInstance'

export const aiService = {
  askFAQ: (question) => api.post('/ai/faqs', { question }),
  askPublicFAQ: (question) => api.post('/ai/faqs/public', { question }),
}
