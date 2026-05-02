import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

/* ── Gemini API config ───────────────────────────────────────────────── *
 *  Add your key to .env:   VITE_GEMINI_API_KEY=your_key_here
 *  Get a free key at:      https://aistudio.google.com/app/apikey
 * ───────────────────────────────────────────────────────────────────── */
const GEMINI_KEY      = import.meta.env.VITE_GEMINI_API_KEY || ''
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`

/* ── System prompt: full site knowledge ─────────────────────────────── */
const SYSTEM_PROMPT = `You are the EsportsHub support assistant for a university esports tournament management platform called EsportsHub, built for GIKI University in Pakistan.

You must ONLY answer questions about EsportsHub. If the user asks something unrelated (weather, general coding, etc.), politely redirect them.

WEBSITE STRUCTURE:
---
Pages & navigation:
- / (Landing): public home with hero, features, role cards, and quick demo login buttons
- /login: sign in with email+password, or use demo buttons (Player/Manager/Organizer)
- /signup: create account, choose role (Player / Manager / Organizer), fill details
- /dashboard/player: player home — upcoming match countdown, attendance confirm button, personal stats (wins/K·D/win rate), recent matches
- /dashboard/manager: manager home — team stats, onboarding checklist, next match countdown, roster panel, recent results, FAB with quick actions
- /dashboard/organizer: organizer home — result verification queue, team approval queue, active tournament table
- /tournaments: list of all tournaments with search, game filter, status filter
- /tournaments/:id: tournament detail with tabs — overview, bracket, teams, schedule, rules
- /register-team: 5-step wizard to register a team (Step 1: pick tournament → Step 2: team info → Step 3: build roster → Step 4: accept rules → Step 5: confirm & submit)
- /bracket: visual single-elimination bracket, click matches to see details
- /schedule: all matches list, filter by upcoming/live/completed, attendance confirm button
- /match/:id: full match detail — team rosters, countdown, confirm attendance, submit result, file dispute
- /result-entry: submit match score with winner selection and evidence screenshot
- /roster: manage team roster — add/edit/remove players, add substitute
- /profile: user profile with stats, match history, achievements, security (change password)
- /leaderboard: global player rankings by wins, win rate, K/D

USER ROLES:
- Player 🎮: competes in matches. Must confirm attendance 30 min before each match. Can view stats, bracket, schedule.
- Manager 📋: registers teams, manages rosters, tracks team progress. Cannot play but can coordinate matches.
- Organizer 🛡️: runs tournaments. Approves teams, verifies results, manages brackets. Has override powers.

KEY WORKFLOWS:
1. Register for a tournament: Go to /register-team → Select tournament → Name your team → Add 5 players (name, IGN, role) → Accept rules → Submit. Wait for organizer approval.
2. Confirm match attendance: Dashboard shows a yellow alert. Click "Confirm Now" or go to the match page and click "Confirm Attendance". Must be done 30 min before.
3. Submit match result: After the match ends, go to /result-entry (or click Submit Result on the match page). Select winner, enter score, attach screenshot, confirm.
4. Dispute a result: On the match page, click "File Dispute". You have 10 minutes after result submission.
5. View bracket: Go to /bracket. Click any completed match to see score details.
6. Check your stats: Go to /profile → Stats tab. New users start at 0; stats grow with each match.
7. View leaderboard: Go to /leaderboard. Your row is highlighted with a "YOU" badge.

DEMO ACCOUNTS (password: demo123):
- Player: ahmed@giki.edu.pk (Ahmed Raza, Nova Esports, Valorant Duelist)
- Manager: ali@giki.edu.pk (Ali Khan, manages Nova Esports)
- Organizer: usman@giki.edu.pk (Usman Javed, Spring University Cup 2025)

IMPORTANT RULES:
- All matches are Best of 3 (finals are Best of 5)
- Teams need 5 core players + optional 1 substitute
- Missing attendance check-in = forfeit
- Results must have screenshot evidence
- Disputes must be filed within 10 minutes of result posting

Keep answers concise (under 150 words). Use bullet points for steps. Include the exact page path when directing users somewhere (e.g., "Go to /register-team").`

/* ── Quick suggestion chips ─────────────────────────────────────────── */
const SUGGESTIONS = [
  'How do I register my team?',
  'How do I confirm attendance?',
  'How do I submit a match result?',
  'What are the three roles?',
  'How does the bracket work?',
  'How do I file a dispute?',
]

export default function SupportBot() {
  const { user, isLoggedIn } = useAuth()
  const [open,    setOpen]    = useState(false)
  const [input,   setInput]   = useState('')
  const [messages,setMessages]= useState([
    {
      role: 'bot',
      text: `👋 Hi${user?.name ? `, ${user.name.split(' ')[0]}` : ''}! I'm the EsportsHub assistant. Ask me anything about the platform — registering teams, match rules, your dashboard, or how anything works.`,
      ts: new Date(),
    }
  ])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  // Scroll to bottom when new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const sendMessage = async (text) => {
    const q = (text || input).trim()
    if (!q) return

    setInput('')
    setMessages(m => [...m, { role: 'user', text: q, ts: new Date() }])
    setLoading(true)

    if (!GEMINI_KEY) {
      // No API key — give a helpful placeholder response
      setTimeout(() => {
        setLoading(false)
        setMessages(m => [...m, {
          role: 'bot',
          text: '⚠️ The Gemini API key isn\'t configured yet. To enable AI responses, add your key to the `.env` file:\n\n`VITE_GEMINI_API_KEY=your_key_here`\n\nGet a free key at **aistudio.google.com**.',
          ts: new Date(),
        }])
      }, 500)
      return
    }

    try {
      // Build conversation history for Gemini
      const history = messages.slice(1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }))

      const res = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            ...history,
            { role: 'user', parts: [{ text: q }] }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 400,
          },
        }),
      })

      if (!res.ok) throw new Error(`Gemini error: ${res.status}`)
      const json = await res.json()
      const reply = json.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t generate a response. Please try again.'

      setMessages(m => [...m, { role: 'bot', text: reply, ts: new Date() }])
    } catch (err) {
      setMessages(m => [...m, {
        role: 'bot',
        text: '❌ Failed to connect to the AI assistant. Check your API key in `.env` and try again.',
        ts: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  // Format bot text: bold **text**, code `text`, line breaks
  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="background:var(--bg-4);padding:1px 5px;border-radius:3px;font-family:JetBrains Mono,monospace;font-size:.8em">$1</code>')
      .replace(/\n/g, '<br/>')
  }

  if (!isLoggedIn) return null   // only show when logged in

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Support chat"
        style={{
          position: 'fixed',
          bottom: 88,   // above FAB
          right: 24,
          width: 52, height: 52,
          borderRadius: '50%',
          background: open ? 'var(--bg-3)' : 'linear-gradient(135deg,#4285f4,#34a853)',
          border: `2px solid ${open ? 'var(--border)' : 'transparent'}`,
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,.4)',
          transition: 'all var(--t-fast)',
          zIndex: 900,
          fontSize: open ? '1.1rem' : '1.3rem',
        }}
      >
        {open ? '✕' : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 150,
          right: 24,
          width: 'min(380px, calc(100vw - 48px))',
          height: 'min(520px, calc(100vh - 200px))',
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 60px rgba(0,0,0,.5)',
          zIndex: 900,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-3)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg,#4285f4,#34a853)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '.9rem', flexShrink: 0,
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '.875rem' }}>EsportsHub Assistant</div>
              <div style={{ fontSize: '.7rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                Powered by Gemini
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 8,
              }}>
                {msg.role === 'bot' && (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4285f4,#34a853)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.7rem', flexShrink: 0, alignSelf: 'flex-end',
                  }}>🤖</div>
                )}
                <div style={{
                  maxWidth: '78%',
                  padding: '10px 12px',
                  borderRadius: msg.role === 'user'
                    ? 'var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)'
                    : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px',
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-3)',
                  color: msg.role === 'user' ? '#000' : 'var(--text-primary)',
                  fontSize: '.825rem',
                  lineHeight: 1.5,
                  border: msg.role === 'bot' ? '1px solid var(--border)' : 'none',
                }}>
                  {msg.role === 'bot'
                    ? <span dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                    : msg.text
                  }
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                <div style={{ width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#4285f4,#34a853)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.7rem',flexShrink:0 }}>🤖</div>
                <div style={{ padding:'10px 14px',background:'var(--bg-3)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px',display:'flex',gap:5,alignItems:'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width:7,height:7,borderRadius:'50%',background:'var(--text-faint)',
                      animation:'bounce .9s ease infinite',
                      animationDelay:`${i*0.15}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Suggestion chips (only at start) */}
            {messages.length === 1 && !loading && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:4 }}>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    style={{
                      padding:'5px 10px',
                      background:'var(--bg-3)',
                      border:'1px solid var(--border)',
                      borderRadius:9999,
                      fontSize:'.72rem',
                      color:'var(--text-secondary)',
                      cursor:'pointer',
                      transition:'all var(--t-fast)',
                    }}
                    onMouseEnter={e => { e.target.style.borderColor='var(--accent)'; e.target.style.color='var(--accent)' }}
                    onMouseLeave={e => { e.target.style.borderColor='var(--border)'; e.target.style.color='var(--text-secondary)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px', borderTop: '1px solid var(--border)', background: 'var(--bg-3)', display:'flex', gap:8 }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about EsportsHub…"
              rows={1}
              style={{
                flex: 1,
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-primary)',
                padding: '8px 12px',
                fontSize: '.825rem',
                resize: 'none',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.5,
                maxHeight: 80,
                overflowY: 'auto',
              }}
              onFocus={e => e.target.style.borderColor='var(--accent)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: 36, height: 36,
                borderRadius: 'var(--radius)',
                background: input.trim() ? 'var(--accent)' : 'var(--bg-4)',
                border: 'none',
                color: input.trim() ? '#000' : 'var(--text-faint)',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'all var(--t-fast)',
                alignSelf: 'flex-end',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 21l21-9-21-9v7l15 2-15 2v7z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0) }
          30%           { transform: translateY(-5px) }
        }
      `}</style>
    </>
  )
}
