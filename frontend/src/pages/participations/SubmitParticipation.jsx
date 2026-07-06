import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, FileText, Image, ChevronLeft, Send, MapPin, Users, Info } from 'lucide-react'
import api from '../../services/axiosInstance'
import toast from 'react-hot-toast'

export default function SubmitParticipation() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ event_name: '', location: '', participant_count: '', description: '' })
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const addFiles = (newFiles) => {
    const valid = Array.from(newFiles).filter((f) => {
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name}: File too large (max 5MB).`); return false }
      const okTypes = ['image/jpeg','image/png','image/gif','image/webp','application/pdf']
      if (!okTypes.includes(f.type)) { toast.error(`${f.name}: Unsupported file type.`); return false }
      return true
    })
    setFiles((prev) => {
      const combined = [...prev, ...valid]
      if (combined.length > 5) { toast.error('Maximum 5 files allowed.'); return prev }
      return combined
    })
  }

  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.event_name || !form.location || !form.description) {
      toast.error('Please fill in all required fields.'); return
    }
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      files.forEach((f) => fd.append('files', f))
      await api.post('/participations', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Report submitted! Awaiting admin review.')
      navigate('/participations')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate('/participations')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to My Reports
      </button>

      <div className="page-header">
        <h1 className="page-title">Submit Activity Report</h1>
        <p className="page-subtitle">Document your participation in an environmental event or seminar. Earn <span className="text-brand-600 font-semibold">50 points</span> upon approval.</p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-2xl mb-6">
        <Info className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-brand-700 dark:text-brand-300">
          Submit evidence of your participation in environmental activities. An admin will review and approve your report within 1-2 business days.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-8 space-y-6">
        {/* Event name */}
        <div>
          <label className="label">Event / Seminar Name <span className="text-red-400">*</span></label>
          <input type="text" value={form.event_name} onChange={(e) => set('event_name', e.target.value)}
            placeholder="e.g. Campus Green Day 2025" className="input" required />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {/* Location */}
          <div>
            <label className="label">Location <span className="text-red-400">*</span></label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={form.location} onChange={(e) => set('location', e.target.value)}
                placeholder="Building A, Room 101" className="input pl-10" required />
            </div>
          </div>
          {/* Participant count */}
          <div>
            <label className="label">Number of Participants</label>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="number" min="1" value={form.participant_count} onChange={(e) => set('participant_count', e.target.value)}
                placeholder="e.g. 50" className="input pl-10" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label">Activity Description <span className="text-red-400">*</span></label>
          <textarea rows={5} value={form.description} onChange={(e) => set('description', e.target.value)}
            placeholder="Describe the event in detail: purpose, activities conducted, outcomes, and your role…"
            className="input resize-none leading-relaxed" required />
          <p className="text-xs text-gray-400 mt-1">{form.description.length} characters</p>
        </div>

        {/* File upload */}
        <div>
          <label className="label">Evidence Files <span className="text-gray-400 font-normal">(optional, max 5 files, 5MB each)</span></label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
              dragOver ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-brand-400'}`}>
            <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Drag & drop files here, or</p>
            <label className="text-sm text-brand-600 dark:text-brand-400 font-semibold cursor-pointer hover:underline">
              browse files
              <input type="file" multiple accept="image/*,.pdf" className="sr-only"
                onChange={(e) => addFiles(e.target.files)} />
            </label>
            <p className="text-xs text-gray-400 mt-2">Supported: JPG, PNG, GIF, WebP, PDF</p>
          </div>

          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  {f.type.startsWith('image/') ? <Image className="w-4 h-4 text-blue-500 flex-shrink-0" /> : <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-gray-700 dark:text-gray-300">{f.name}</p>
                    <p className="text-xs text-gray-400">{(f.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button type="button" onClick={() => removeFile(i)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/participations')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Send className="w-4 h-4" /> Submit Report</>}
          </button>
        </div>
      </form>
    </div>
  )
}
