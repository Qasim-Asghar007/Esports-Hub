# EsportsHub — React Conversion Progress

> **Use this file to resume work in any AI tool.**  
> Paste this file's contents to give the tool full context of what's done and what's next.

---

## Project Overview

**EsportsHub** is a university esports tournament management platform (GIKI CS272 HCI project).  
Stack: **React 18 + Vite + React Router v6 + plain CSS**.  
No UI framework — custom design system in `src/styles/main.css`.  
The API layer (`src/api/index.js`) uses mock data by default; set `API_BASE_URL` to a real server URL to switch.

---

## Folder Structure

```
EsportsHub-React/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   └── index.js          ✅ API service + MockDB
│   ├── context/
│   │   ├── AuthContext.jsx   ✅ Auth state (user, token, login, logout)
│   │   └── ToastContext.jsx  ✅ Global toast notifications
│   ├── hooks/
│   │   ├── useAuth.js        ✅ useAuth(), useRequireAuth(), useRedirectIfAuthed()
│   │   └── useCountdown.js   ✅ useCountdown(targetISO)
│   ├── components/
│   │   ├── Header.jsx        ✅ Nav, search, role switcher, notifications, help
│   │   ├── Footer.jsx        ✅ Footer with links
│   │   ├── FAB.jsx           ✅ Floating action button menu
│   │   ├── Modal.jsx         ✅ Reusable modal wrapper
│   │   ├── Toast.jsx         ✅ Toast notification renderer
│   │   ├── Countdown.jsx     ✅ Live countdown timer
│   │   ├── TournamentCard.jsx ✅ Tournament card
│   │   ├── MatchCard.jsx     ✅ Match card
│   │   ├── PlayerCard.jsx    ✅ Player/roster card
│   │   └── Alert.jsx         ✅ Alert banner
│   ├── pages/
│   │   ├── Landing.jsx       ✅ Home / hero page
│   │   ├── Login.jsx         ✅ Login form + demo buttons
│   │   ├── Signup.jsx        ✅ Registration form with role selection
│   │   ├── DashboardManager.jsx  ✅ Manager dashboard
│   │   ├── DashboardPlayer.jsx   ✅ Player dashboard
│   │   ├── DashboardOrganizer.jsx ✅ Organizer dashboard + sidebar
│   │   ├── Tournaments.jsx   ✅ Tournament browser with search/filter/tabs
│   │   ├── TournamentDetail.jsx  ✅ Single tournament with tabs
│   │   ├── RegisterTeam.jsx  ✅ 5-step registration wizard
│   │   ├── Bracket.jsx       ✅ 16-team bracket viewer
│   │   ├── MatchDetail.jsx   ✅ Match hero + countdown + attendance
│   │   ├── ResultEntry.jsx   ✅ Score verification + winner selection
│   │   ├── Roster.jsx        ✅ Roster management
│   │   ├── Profile.jsx       ✅ User profile + stats + history
│   │   ├── Leaderboard.jsx   ✅ Rankings table with game filter
│   │   └── Schedule.jsx      ✅ Match schedule grouped by day
│   ├── styles/
│   │   └── main.css          ✅ Full design system (same as HTML version)
│   ├── App.jsx               ✅ React Router setup + protected routes
│   └── main.jsx              ✅ Entry point
├── index.html                ✅ Vite entry HTML
├── package.json              ✅
└── vite.config.js            ✅
```

---

## What's Done ✅

- [x] Project scaffolded (Vite + React + React Router)
- [x] CSS design system ported
- [x] API service layer (`src/api/index.js`) — mock data + backend-ready
- [x] AuthContext — user/token stored in localStorage, role switcher
- [x] ToastContext — global toast queue
- [x] `useAuth` hook — login, logout, demoLogin, role getter
- [x] `useCountdown` hook — live seconds/minutes/hours/days
- [x] Header component — nav, search, role switcher, notifications panel, help modal
- [x] Footer component
- [x] FAB component — animated expandable menu
- [x] Modal component — overlay, Escape key close, focus trap
- [x] Toast component — success/error/warn/info, auto-dismiss
- [x] Countdown component
- [x] TournamentCard, MatchCard, PlayerCard, Alert components
- [x] Landing page
- [x] Login page (form + demo buttons)
- [x] Signup page (form + role selector)
- [x] Manager dashboard
- [x] Player dashboard
- [x] Organizer dashboard
- [x] Tournaments list (search + filter + tabs)
- [x] Tournament detail (tabs: overview / teams / bracket / rules)
- [x] RegisterTeam wizard (5 steps + sidebar summary)
- [x] Bracket page (16-team single-elimination)
- [x] MatchDetail page
- [x] ResultEntry page
- [x] Roster page
- [x] Profile page
- [x] Leaderboard page
- [x] Schedule page
- [x] React Router setup with protected routes
- [x] Responsive design (mobile/tablet/desktop)

---

## What's Left / To Improve

- [ ] Add React Query or SWR for data fetching caching
- [ ] Add loading skeleton states on page load
- [ ] Add error boundaries per page
- [ ] Add proper 404 page
- [ ] Accessibility audit (aria-labels, keyboard traps)
- [ ] Add unit tests (Vitest + Testing Library)

---

## Backend Integration Guide

When you're ready to add a backend:

1. **Open `src/api/index.js`**
2. **Set `export const API_BASE_URL = 'https://your-api.com'`**
3. All `API.*` functions will automatically use real `fetch()` calls
4. Auth token is injected via `Authorization: Bearer <token>` header
5. Every function returns `{ data, error }` — no shape changes in pages

### REST endpoints expected by the API layer:
```
POST   /auth/login
POST   /auth/signup
GET    /auth/me
GET    /tournaments
POST   /tournaments
GET    /tournaments/:id
PUT    /tournaments/:id
GET    /tournaments/:id/bracket
POST   /tournaments/:id/teams
GET    /teams/:id
PUT    /teams/:id/roster
GET    /matches          ?tournamentId= &userId= &status=
GET    /matches/:id
POST   /matches/:id/attendance
POST   /matches/:id/result
POST   /matches/:id/verify
GET    /leaderboard      ?game=
GET    /users/:id
PUT    /users/:id
GET    /users/:id/stats
GET    /notifications
PATCH  /notifications/read
```

---

## How to Run

```bash
cd "EsportsHub-React"
npm install
npm run dev
# → opens at http://localhost:5173
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Manager | ali@giki.edu.pk | demo123 |
| Player | ahmed@giki.edu.pk | demo123 |
| Organizer | usman@giki.edu.pk | demo123 |

Or use the **Quick Demo Login** buttons on the login page.

---

## Resuming Work (prompt for next AI session)

> "I am building EsportsHub, a React 18 + Vite university esports tournament platform. The project is at `C:\Users\hp\Documents\GIKI\Sem 4\HCI\EsportsHub-React`. Read `progress.md` for full context on what's done and what's next. The API layer is in `src/api/index.js` (mock data, set API_BASE_URL to switch to real backend). Continue from where we left off."
