import api from './axiosInstance'

export const faqService = {
  getPublicFAQs: () => api.get('/faqs/public'),
}
