import api from './axiosInstance'

export const exportService = {
  exportSurveyExcel: (surveyId) =>
    api.get(`/export/surveys/${surveyId}/excel`, { responseType: 'blob' }),
  exportParticipationsPDF: () =>
    api.get('/export/participations/pdf', { responseType: 'blob' }),
  exportSurveyExcelAdmin: (surveyId) =>
    api.get(`/admin/export/surveys/${surveyId}/excel`, { responseType: 'blob' }),
  exportParticipationsPDFAdmin: () =>
    api.get('/admin/export/participations/pdf', { responseType: 'blob' }),
}

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}
