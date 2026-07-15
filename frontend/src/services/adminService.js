import api from './axiosInstance'

export const adminService = {
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, data) => api.patch(`/admin/users/${id}/status`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getStats: () => api.get('/admin/stats'),

  // Surveys
  getSurveys: (params) => api.get('/admin/surveys', { params }),
  getSurveyById: (id) => api.get(`/admin/surveys/${id}`),
  createSurvey: (data) => api.post('/admin/surveys', data),
  updateSurvey: (id, data) => api.patch(`/admin/surveys/${id}`, data),
  deleteSurvey: (id) => api.delete(`/admin/surveys/${id}`),
  getSurveyResponses: (id, params) => api.get(`/admin/surveys/${id}/responses`, { params }),
  gradeOpinion: (responseId, score) =>
    api.put(`/admin/surveys/responses/${responseId}/score`, { opinion_score: score }),

  // Questions
  getQuestions: (surveyId) => api.get(`/admin/surveys/${surveyId}/questions`),
  createQuestion: (surveyId, data) => api.post(`/admin/surveys/${surveyId}/questions`, data),
  updateQuestion: (surveyId, questionId, data) =>
    api.patch(`/admin/surveys/${surveyId}/questions/${questionId}`, data),
  deleteQuestion: (surveyId, questionId) =>
    api.delete(`/admin/surveys/${surveyId}/questions/${questionId}`),
  reorderQuestions: (surveyId, order) =>
    api.patch(`/admin/surveys/${surveyId}/questions/reorder`, { order }),

  // Participations
  getParticipations: (params) => api.get('/admin/participations', { params }),
  getParticipationById: (id) => api.get(`/admin/participations/${id}`),
  reviewParticipation: (id, data) => api.patch(`/admin/participations/${id}/review`, data),
  summarizeParticipation: (id, force = false) =>
    api.post(`/admin/participations/${id}/summarize`, null, { params: { force: force ? 'true' : undefined } }),

  // FAQs
  getFAQs: () => api.get('/admin/faqs'),
  createFAQ: (data) => api.post('/admin/faqs', data),
  updateFAQ: (id, data) => api.patch(`/admin/faqs/${id}`, data),
  deleteFAQ: (id) => api.delete(`/admin/faqs/${id}`),
}
