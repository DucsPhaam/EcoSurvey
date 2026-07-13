import api from './axiosInstance'

export const fileService = {
  getFileUrl: (filename) => {
    const base = import.meta.env.VITE_API_URL || '/api'
    return `${base}/files/${encodeURIComponent(filename)}`
  },
  fetchFile: (filename) =>
    api.get(`/files/${encodeURIComponent(filename)}`, { responseType: 'blob' }),
}
