/**
 * @module ExportServiceFrontend
 * @description Dịch vụ API phía Frontend tải tệp báo cáo Excel (`.xlsx`) và PDF (`.pdf`) kèm hàm trợ giúp kích hoạt tải tệp trên trình duyệt.
 * 
 * @function downloadBlob
 * @description Nhận đối tượng Blob từ API và tạo thẻ <a> ảo để tải tệp trực tiếp xuống thiết bị người dùng.
 * 
 * @relations
 * - Backend: `backend/src/routes/exportRoutes.js`, `backend/src/controllers/exportController.js`.
 * - UI Components: `SurveyAnalytics.jsx`, `ParticipationReview.jsx`.
 */
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
