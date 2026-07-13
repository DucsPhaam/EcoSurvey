import api from './axiosInstance'

export const participationService = {
  getMyParticipations: (params) => api.get('/participations', { params }),
  getParticipationById: (id) => api.get(`/participations/${id}`),
  createParticipation: (formData) =>
    api.post('/participations', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
}
