# EsportsHub React — Task Checklist

## ✅ Setup & Config
- [x] Vite + React 18 project scaffolded
- [x] React Router v6 installed
- [x] Google Fonts configured (Rajdhani, Inter, JetBrains Mono)
- [x] CSS design system ported (`src/styles/main.css`)
- [x] `package.json` with all dependencies
- [x] `vite.config.js`

## ✅ API & State Layer
- [x] `src/api/index.js` — unified API service
  - [x] `API_BASE_URL` constant (set for real backend)
  - [x] `request()` helper (mock vs real HTTP)
  - [x] Auth endpoints (`login`, `signup`, `me`)
  - [x] Tournament endpoints (`list`, `get`, `create`, `update`)
  - [x] Team endpoints (`register`, `roster`, `approve`)
  - [x] Match endpoints (`list`, `get`, `attendance`, `result`, `verify`)
  - [x] Bracket endpoints
  - [x] User/profile endpoints
  - [x] Leaderboard endpoint
  - [x] Notification endpoints
  - [x] MockDB with full seed data
- [x] `src/context/AuthContext.jsx`
  - [x] user + token state (localStorage backed)
  - [x] login(), signup(), logout(), demoLogin()
  - [x] Role switcher
- [x] `src/context/ToastContext.jsx`
  - [x] Toast queue management
  - [x] toast.success/error/warn/info helpers

## ✅ Custom Hooks
- [x] `src/hooks/useAuth.js` — useAuth(), useRequireAuth(), useRedirectIfAuthed()
- [x] `src/hooks/useCountdown.js` — real-time countdown to target date

## ✅ Shared Components
- [x] `Header.jsx` — nav, search with results, role switcher, notifications modal, help modal, avatar dropdown
- [x] `Footer.jsx`
- [x] `FAB.jsx` — floating action button with animated actions
- [x] `Modal.jsx` — overlay, Escape key, focus management
- [x] `Toast.jsx` — rendered via ToastContext, auto-dismiss, 4 types
- [x] `Countdown.jsx` — live timer component
- [x] `TournamentCard.jsx`
- [x] `MatchCard.jsx`
- [x] `PlayerCard.jsx`
- [x] `Alert.jsx`

## ✅ Pages
- [x] `Landing.jsx` — hero, features, role cards, CTA, footer
- [x] `Login.jsx` — form + demo login + password toggle
- [x] `Signup.jsx` — form + role selector
- [x] `DashboardManager.jsx` — stats, next match countdown, roster, tournaments, results
- [x] `DashboardPlayer.jsx` — attendance banner, match hero countdown, stats, bracket snapshot
- [x] `DashboardOrganizer.jsx` — sidebar, dispute alert, pending actions, match table
- [x] `Tournaments.jsx` — search, game chips, status tabs, create modal (organizer)
- [x] `TournamentDetail.jsx` — overview/teams/bracket/rules tabs, registration sidebar
- [x] `RegisterTeam.jsx` — 5-step wizard, sidebar summary, validation
- [x] `Bracket.jsx` — 16-team bracket with rounds, your-team highlight, champion card
- [x] `MatchDetail.jsx` — hero countdown, team logos, attendance confirm, sub modal
- [x] `ResultEntry.jsx` — two report cards, winner selection, confirm modal, 10-min undo
- [x] `Roster.jsx` — core players, sub slot, invite modal, readiness banner
- [x] `Profile.jsx` — avatar, stats grid, match history, achievements
- [x] `Leaderboard.jsx` — rank table, game filter, your-row highlight
- [x] `Schedule.jsx` — grouped by day, list/calendar toggle, my-matches filter

## ✅ Routing
- [x] `App.jsx` — React Router routes
- [x] Protected routes (redirect to /login if not authed)
- [x] Role-specific dashboard redirect after login
- [x] 404 redirect

## 🔲 Future / Backend Work
- [ ] Connect real backend: set `API_BASE_URL` in `src/api/index.js`
- [ ] Add JWT refresh token logic in AuthContext
- [ ] Add React Query / SWR for server state caching
- [ ] Add loading skeletons on data-fetch pages
- [ ] Add error boundaries per page
- [ ] Add proper 404 page component
- [ ] Add image upload for result screenshots (replace placeholder)
- [ ] Add real-time updates (WebSocket / SSE) for live match status
- [ ] Write unit tests (Vitest + React Testing Library)
- [ ] Add E2E tests (Playwright)
- [ ] SEO meta tags
- [ ] PWA manifest + service worker
