import { useState } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { aiService } from '../../services/aiService'
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
      const res = await aiService.askFAQ(q)
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
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 z-50 bg-earth-paper border-[3px] border-earth-ink shadow-brutal-lg animate-slide-up flex flex-col overflow-hidden"
          style={{ height: '480px' }}>
          {/* Header */}
          <div className="bg-earth-forest border-b-[3px] border-earth-ink p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-earth-cream border-2 border-earth-paper flex items-center justify-center">
                <Bot className="w-4 h-4 text-earth-forest" />
              </div>
              <div>
                <p className="text-earth-paper font-semibold text-sm">EcoSurvey Assistant</p>
                <p className="text-earth-cream/80 text-xs font-mono uppercase tracking-widest">Powered by AI</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-earth-paper/70 hover:text-earth-paper transition-colors border-2 border-transparent hover:border-earth-paper p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-earth-cream">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' && (
                  <div className="w-7 h-7 bg-earth-forest border-2 border-earth-ink flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-earth-cream" />
                  </div>
                )}
                <div className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed border-[2px] border-earth-ink ${
                  m.role === 'user'
                    ? 'bg-earth-moss text-earth-paper'
                    : 'bg-earth-paper text-earth-ink'
                }`}>
                  {m.text}
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 bg-earth-clay border-2 border-earth-ink flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-earth-paper" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 bg-earth-forest border-2 border-earth-ink flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-earth-cream" />
                </div>
                <div className="bg-earth-paper border-2 border-earth-ink px-4 py-3 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-earth-forest animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-earth-forest animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-earth-forest animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t-[3px] border-earth-ink bg-earth-paper flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-2 text-sm bg-earth-cream border-2 border-earth-ink focus:outline-none text-earth-ink"
            />
            <button onClick={send} disabled={loading || !input.trim()}
              className="p-2 bg-earth-forest text-earth-paper border-2 border-earth-ink hover:bg-earth-moss transition-colors disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-earth-forest text-earth-paper border-[3px] border-earth-ink shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all duration-100 flex items-center justify-center">
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </>
  )
}
