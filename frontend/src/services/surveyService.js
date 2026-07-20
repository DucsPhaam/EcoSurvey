import api from './axiosInstance'

export const surveyService = {
  getSurveys: (params) => api.get('/surveys', { params }),
  getSurveyDetail: (id) => api.get(`/surveys/${id}`),
  submitSurvey: (id, answers, captchaToken) => api.post(`/surveys/${id}/submit`, { answers, 'cf-turnstile-response': captchaToken }),
}
