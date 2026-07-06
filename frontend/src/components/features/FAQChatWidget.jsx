import { useState } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import api from '../../services/axiosInstance'
import { useAuth } from '../../contexts/AuthContext'

export default function FAQChatWidget() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm the EcoSurvey AI Assistant. Ask me anything about the portal — surveys, points, participation reports, and more!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return

    setMessages((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/ai/faqs', { question: q })
      setMessages((m) => [...m, { role: 'bot', text: res.data.answer }])
    } catch (err) {
      const msg = err.response?.data?.message || 'Sorry, I encountered an error. Please try again.'
      setMessages((m) => [...m, { role: 'bot', text: msg }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 z-50 card shadow-card-hover animate-slide-up flex flex-col overflow-hidden"
          style={{ height: '480px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-brand-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">EcoSurvey Assistant</p>
                <p className="text-brand-200 text-xs">Powered by AI</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  </div>
                )}
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-tl-sm shadow-sm'
                }`}>
                  {m.text}
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask a question…"
              className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button onClick={send} disabled={loading || !input.trim()}
              className="p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-brand-600 to-brand-500 text-white rounded-2xl shadow-glow-green hover:shadow-glow-green hover:scale-110 transition-all duration-300 flex items-center justify-center">
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </>
  )
}
