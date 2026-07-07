import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, Leaf, Sparkles } from 'lucide-react'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const SUGGESTIONS = [
  'How does the points system work?',
  'How do I join a survey?',
  'How do I submit an activity report?',
  'How long does account approval take?',
]

export default function LandingChatWidget() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "👋 Hi there! I'm the EcoSurvey AI Assistant.\n\nI can answer any questions about the portal — surveys, points, activity reports, and more!",
    },
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [hasNewMsg, setHasNewMsg] = useState(false)
  const bottomRef = useRef(null)

  // Auto scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Show notification badge when panel is closed and new message arrives
  useEffect(() => {
    if (!open && messages.length > 1) setHasNewMsg(true)
  }, [messages])

  const handleOpen = () => {
    setOpen(true)
    setHasNewMsg(false)
  }

  const send = async (question) => {
    const q = (question || input).trim()
    if (!q || loading) return

    setMessages((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setLoading(true)

    try {
      const res = await axios.post(`${BASE_URL}/ai/faqs/public`, { question: q })
      setMessages((m) => [...m, { role: 'bot', text: res.data.answer }])
    } catch {
      setMessages((m) => [...m, {
        role: 'bot',
        text: "Sorry, I'm unable to respond right now. Please try again later.",
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col shadow-2xl animate-slide-up"
          style={{ width: 360, height: 520, borderRadius: 20, overflow: 'hidden' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-accent-500 p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-brand-700 animate-pulse" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">EcoSurvey Assistant</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  <p className="text-brand-200 text-xs">AI-Powered • Always ready to help</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-accent-400 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Leaf className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-gradient-to-br from-brand-600 to-brand-500 text-white rounded-tr-sm shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-accent-400 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                  {[0, 150, 300].map((delay) => (
                    <span key={delay} className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions — show only before first user message */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 bg-gray-50 dark:bg-gray-900 flex gap-2 overflow-x-auto flex-shrink-0">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="flex-shrink-0 px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:border-brand-300 transition-all whitespace-nowrap">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white dark:bg-gray-900 border-t dark:border-gray-800 flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask a question…"
              className="flex-1 px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white rounded-xl transition-all disabled:opacity-40 flex items-center justify-center shadow-sm flex-shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-brand-600 to-accent-500 text-white rounded-2xl shadow-glow-green hover:scale-110 hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        style={{ display: open ? 'none' : 'flex' }}
        title="Chat with AI Assistant"
      >
        <MessageCircle className="w-6 h-6" />
        {hasNewMsg && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>
    </>
  )
}
