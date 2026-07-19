import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Leaf, Sparkles } from 'lucide-react'
import { aiService } from '../../services/aiService'

import { useTranslation } from 'react-i18next'

export default function LandingChatWidget() {
  const { t } = useTranslation('chatWidget')
  
  const SUGGESTIONS = [
    t('suggestions.s1'),
    t('suggestions.s2'),
    t('suggestions.s3'),
    t('suggestions.s4'),
  ]

  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: t('greeting'),
    },
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [hasNewMsg, setHasNewMsg] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

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
      const res = await aiService.askPublicFAQ(q)
      setMessages((m) => [...m, { role: 'bot', text: res.data.answer }])
    } catch {
      setMessages((m) => [...m, {
        role: 'bot',
        text: t('errorMsg'),
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
          className="fixed bottom-24 right-6 z-50 flex flex-col bg-earth-paper border-[3px] border-earth-ink shadow-brutal-lg animate-slide-up"
          style={{ width: 360, height: 520, overflow: 'hidden' }}
        >
          {/* Header */}
          <div className="bg-earth-forest border-b-[3px] border-earth-ink p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-earth-cream border-[2px] border-earth-paper flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-earth-forest" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-earth-moss border-2 border-earth-paper animate-pulse" />
              </div>
              <div>
                <p className="text-earth-paper font-semibold text-sm leading-tight">{t('assistantName')}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3 text-earth-sand" />
                  <p className="text-earth-cream/80 text-xs font-mono uppercase tracking-widest">{t('aiPowered')}</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="w-8 h-8 bg-earth-cream/20 hover:bg-earth-cream/40 flex items-center justify-center text-earth-paper transition-colors border-2 border-earth-paper">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-earth-cream">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' && (
                  <div className="w-7 h-7 bg-earth-forest border-2 border-earth-ink flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Leaf className="w-3.5 h-3.5 text-earth-cream" />
                  </div>
                )}
                <div className={`max-w-[82%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line border-[2px] border-earth-ink ${
                  m.role === 'user'
                    ? 'bg-earth-moss text-earth-paper'
                    : 'bg-earth-paper text-earth-ink'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 bg-earth-forest border-2 border-earth-ink flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-3.5 h-3.5 text-earth-cream" />
                </div>
                <div className="bg-earth-paper border-2 border-earth-ink px-4 py-3 flex gap-1.5 items-center">
                  {[0, 150, 300].map((delay) => (
                    <span key={delay} className="w-1.5 h-1.5 bg-earth-forest rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 bg-earth-cream flex gap-2 overflow-x-auto flex-shrink-0">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="flex-shrink-0 px-3 py-1.5 text-xs bg-earth-paper border-2 border-earth-ink text-earth-ink ui-title hover:bg-earth-moss hover:text-earth-paper transition-colors whitespace-nowrap">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-earth-paper border-t-[3px] border-earth-ink flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder={t('placeholder')}
              className="flex-1 px-3.5 py-2 text-sm bg-earth-cream border-2 border-earth-ink focus:outline-none focus:bg-earth-paper text-earth-ink"
            />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              className="w-10 h-10 bg-earth-forest text-earth-paper border-2 border-earth-ink hover:bg-earth-moss transition-colors disabled:opacity-40 flex items-center justify-center flex-shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-earth-forest text-earth-paper border-[3px] border-earth-ink shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all duration-100 flex items-center justify-center"
        style={{ display: open ? 'none' : 'flex' }}
        title={t('tooltip')}
      >
        <MessageCircle className="w-6 h-6" />
        {hasNewMsg && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-earth-terracotta border-2 border-earth-paper animate-pulse" />
        )}
      </button>
    </>
  )
}
