/**
 * EsportsHub — API Service Layer
 *
 * ─── BACKEND INTEGRATION ────────────────────────────────────────
 * 1. Set  API_BASE_URL = 'https://your-api.com'  (one line)
 * 2. All functions switch from MockDB → real fetch() automatically
 * 3. JWT token from AuthContext is injected into every request
 * 4. Every function returns { data, error } — page code never changes
 * ────────────────────────────────────────────────────────────────
 *
 * REST endpoints your backend must implement (see progress.md for full list)
 */

// Read from .env (VITE_API_BASE_URL=http://localhost:3001) or leave empty for MockDB
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Token getter — AuthContext stores it; this lets api.js read it without circular imports
let _tokenGetter = () => null
export const setTokenGetter = (fn) => { _tokenGetter = fn }

// ── Core request ─────────────────────────────────────────────────
async function request(method, endpoint, body = null) {
  if (!API_BASE_URL) return MockDB.handle(method, endpoint, body)

  const token = _tokenGetter()
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
  if (body) opts.body = JSON.stringify(body)
  try {
    const res = await fetch(API_BASE_URL + endpoint, opts)
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.error || json.message || `HTTP ${res.status}`)
    return { data: json.data !== undefined ? json.data : json, error: null }
  } catch (err) {
    if (import.meta.env.DEV) return MockDB.handle(method, endpoint, body)
    return { data: null, error: err.message }
  }
}

const get    = (ep)      => request('GET',    ep)
const post   = (ep, b)   => request('POST',   ep, b)
const put    = (ep, b)   => request('PUT',    ep, b)
const patch  = (ep, b)   => request('PATCH',  ep, b)
const del    = (ep)      => request('DELETE', ep)

// ── Exported API namespaces ───────────────────────────────────────
export const API = {
  auth: {
    login:  (email, password) => post('/auth/login', { email, password }),
    signup: (data)            => post('/auth/signup', data),
    logout: ()                => post('/auth/logout'),
    me:     ()                => get('/auth/me'),
  },
  tournaments: {
    list:   (filters = {}) => get('/tournaments?' + new URLSearchParams(filters)),
    get:    (id)           => get(`/tournaments/${id}`),
    create: (data)         => post('/tournaments', data),
    update: (id, data)     => put(`/tournaments/${id}`, data),
    delete: (id)           => del(`/tournaments/${id}`),
  },
  teams: {
    register:     (tournamentId, data) => post(`/teams`, { ...data, tournament: tournamentId }),
    get:          (id)                 => get(`/teams/${id}`),
    list:         (tournamentId)       => get(`/tournaments/${tournamentId}/teams`),
    update:       (id, data)           => put(`/teams/${id}`, data),
    roster:       (id)                 => get(`/teams/${id}/roster`),
    updateRoster: (id, data)           => put(`/teams/${id}/roster`, data),
    approve:      (id)                 => patch(`/teams/${id}/approve`),
    reject:       (id)                 => patch(`/teams/${id}/reject`),
  },
  matches: {
    list:              (filters = {})    => get('/matches?' + new URLSearchParams(filters)),
    get:               (id)              => get(`/matches/${id}`),
    confirmAttendance: (id, playerId)    => post(`/matches/${id}/attendance`, { playerId }),
    submitResult:      (id, data)        => post(`/matches/${id}/result`, data),
    verifyResult:      (id, winnerId)    => post(`/matches/${id}/verify`, { winnerId }),
    dispute:           (id, reason)      => post(`/matches/${id}/dispute`, { reason }),
  },
  bracket: {
    get:     (tournamentId)      => get(`/tournaments/${tournamentId}/bracket`),
    advance: (matchId, winnerId) => post('/bracket/advance', { matchId, winnerId }),
  },
  users: {
    profile: (id)    => get(`/users/${id}`),
    update:  (id, d) => put(`/users/${id}`, d),
    stats:   (id)    => get(`/users/${id}/stats`),
  },
  notifications: {
    list:     ()    => get('/notifications'),
    markRead: (ids) => patch('/notifications/read', { ids }),
    markAll:  ()    => patch('/notifications/read-all'),
  },
  leaderboard: {
    global:     (game) => get(`/leaderboard${game ? '?game=' + game : ''}`),
    tournament: (id)   => get(`/tournaments/${id}/leaderboard`),
  },
}

// ═══════════════════════════════════════════════════════════════
//  MOCK DATABASE  — remove or leave as fallback when backend ready
// ═══════════════════════════════════════════════════════════════
export const MockDB = {
  _users: [
    { id: 'u1', username: 'AliKhan',    email: 'ali@giki.edu.pk',    password: 'demo123', role: 'manager',   name: 'Ali Khan',    avatar: 'AK', game: 'Valorant', team: 'Nova Esports' },
    { id: 'u2', username: 'AhmedRaza',  email: 'ahmed@giki.edu.pk',  password: 'demo123', role: 'player',    name: 'Ahmed Raza',  avatar: 'AR', game: 'Valorant', team: 'Nova Esports', ign: 'PhoenixAR' },
    { id: 'u3', username: 'UsmanJaved', email: 'usman@giki.edu.pk',  password: 'demo123', role: 'organizer', name: 'Usman Javed', avatar: 'UJ', game: null, team: null },
  ],

  _tournaments: [
    { id: 't1', title: 'Spring University Cup 2025', game: 'Valorant',         status: 'active',     format: 'Single Elimination', teamSize: 5, maxTeams: 16, registeredTeams: 14, prizePool: 'PKR 15,000', startDate: '2025-05-10', endDate: '2025-05-25', registrationDeadline: '2025-05-08', organizer: 'GIKI Esports Club', description: 'The annual Spring University Cup — 16 teams compete for the championship and PKR 15,000.' },
    { id: 't2', title: 'CS2 Open Championship',       game: 'CS2',              status: 'upcoming',   format: 'Double Elimination', teamSize: 5, maxTeams: 8,  registeredTeams: 3,  prizePool: 'PKR 10,000', startDate: '2025-06-01', endDate: '2025-06-15', registrationDeadline: '2025-05-28', organizer: 'GIKI Esports Club', description: 'Open Counter-Strike 2 championship for all skill levels.' },
    { id: 't3', title: 'League of Legends Clash',     game: 'League of Legends', status: 'upcoming',  format: 'Round Robin + Playoffs', teamSize: 5, maxTeams: 12, registeredTeams: 5, prizePool: 'PKR 8,000', startDate: '2025-06-10', endDate: '2025-06-30', registrationDeadline: '2025-06-05', organizer: 'GIKI Esports Club', description: 'University-level LoL tournament with round robin group stage.' },
    { id: 't4', title: 'Winter Clash 2024',           game: 'Valorant',         status: 'completed',  format: 'Single Elimination', teamSize: 5, maxTeams: 8, registeredTeams: 8, prizePool: 'PKR 12,000', startDate: '2024-12-01', endDate: '2024-12-15', registrationDeadline: '2024-11-28', organizer: 'GIKI Esports Club', description: 'Completed.', winner: 'Phoenix Squad' },
    { id: 't5', title: 'PUBG Mobile Open',            game: 'PUBG Mobile',      status: 'upcoming',   format: 'Battle Royale Points', teamSize: 4, maxTeams: 20, registeredTeams: 8, prizePool: 'PKR 6,000', startDate: '2025-06-20', endDate: '2025-06-22', registrationDeadline: '2025-06-15', organizer: 'GIKI Esports Club', description: 'PUBG Mobile tournament with points-based scoring across multiple matches.' },
  ],

  _teams: [
    { id: 'tm1', tournamentId: 't1', name: 'Nova Esports',  captain: 'u1', status: 'approved', roster: ['Ahmed Raza','Sara Malik','Hamza Ali','Omar Baig','Zain Khan'], sub: null },
    { id: 'tm2', tournamentId: 't1', name: 'Phoenix Squad', captain: 'p2', status: 'approved', roster: ['Bilal R.','Kamran S.','Faisal M.','Umar T.','Sana K.'], sub: 'Ali G.' },
    { id: 'tm3', tournamentId: 't1', name: 'Team Tempo',    captain: 'p7', status: 'approved', roster: ['Asad H.','Noman Q.','Raza A.','Saad M.','Tariq B.'], sub: 'Imran Z.' },
    { id: 'tm4', tournamentId: 't1', name: 'Lunar Force',   captain: 'p13', status: 'pending', roster: ['Omar K.','Bilal S.','Hassan R.','Waqar M.','Adeel T.'], sub: null },
    { id: 'tm5', tournamentId: 't1', name: 'Falcon Strike', captain: 'p18', status: 'approved', roster: ['Zeeshan A.','Dawood K.','Babar M.','Hamid S.','Khalid R.'], sub: 'Rehan T.' },
  ],

  _matches: [
    { id: 'm1', tournamentId: 't1', round: 'Quarterfinal', team1: { id: 'tm1', name: 'Nova Esports', logo: 'NE' }, team2: { id: 'tm2', name: 'Phoenix Squad', logo: 'PS' }, status: 'upcoming', scheduledAt: new Date(Date.now() + 2*3600000).toISOString(), score: null, winner: null, server: 'SG1', maps: ['Haven','Bind','Split'], lobbyCode: 'NOVA-2025', attendance: { team1: false, team2: true } },
    { id: 'm2', tournamentId: 't1', round: 'Quarterfinal', team1: { id: 'tm5', name: 'Falcon Strike', logo: 'FS' }, team2: { id: 'tm3', name: 'Team Tempo', logo: 'TT' }, status: 'result_pending', scheduledAt: new Date(Date.now() - 3600000).toISOString(), score: { team1: 2, team2: 1 }, winner: null, reports: { team1: { score: '2-1', submitted: true }, team2: { score: '2-1', submitted: true } }, server: 'SG1', maps: ['Ascent','Fracture'], lobbyCode: 'FALC-2025', attendance: { team1: true, team2: true } },
    { id: 'm3', tournamentId: 't1', round: 'Quarterfinal', team1: { id: 'tm4', name: 'Lunar Force', logo: 'LF' }, team2: { id: 'tm6', name: 'Storm Riders', logo: 'SR' }, status: 'completed', scheduledAt: new Date(Date.now() - 3*3600000).toISOString(), score: { team1: 2, team2: 0 }, winner: 'tm4', server: 'SG1', maps: ['Bind'], lobbyCode: null, attendance: { team1: true, team2: true } },
  ],

  _notifications: [
    { id: 'n1', type: 'match',      message: '<strong>Nova Esports vs Phoenix Squad</strong> starts in 2 hours.',          time: '2h ago', read: false },
    { id: 'n2', type: 'result',     message: 'Match result vs <strong>Storm Riders</strong> has been verified.',            time: '3h ago', read: false },
    { id: 'n3', type: 'team',       message: '<strong>Nova Esports</strong> has been approved for Spring Cup 2025.',        time: '1d ago', read: true  },
    { id: 'n4', type: 'tournament', message: 'CS2 Open Championship registration is now open.',                             time: '2d ago', read: true  },
    { id: 'n5', type: 'dispute',    message: 'Dispute filed for <strong>Falcon vs Tempo</strong> — review required.',      time: '5h ago', read: false },
  ],

  _leaderboard: [
    { id:'lb1',  rank:1,  userId:'lb1',  name:'PhoenixAR',    ign:'PhoenixAR#001',  team:'Nova Esports',   game:'Valorant',           wins:24, losses:4,  winRate:85, kd:'2.1', points:1420, avatar:'PA' },
    { id:'lb2',  rank:2,  userId:'lb2',  name:'ShadowKnight', ign:'ShadowK#007',    team:'Storm Riders',   game:'CS2',                wins:21, losses:5,  winRate:80, kd:'1.9', points:1310, avatar:'SK' },
    { id:'lb3',  rank:3,  userId:'lb3',  name:'NightOwl',     ign:'NightOwl#999',   team:'Cyber Wolves',   game:'Valorant',           wins:19, losses:6,  winRate:76, kd:'1.7', points:1205, avatar:'NO' },
    { id:'lb4',  rank:4,  userId:'u2',   name:'AhmedRaza',    ign:'PhoenixAR#002',  team:'Nova Esports',   game:'Valorant',           wins:17, losses:5,  winRate:77, kd:'1.8', points:1150, avatar:'AR' },
    { id:'lb5',  rank:5,  userId:'lb5',  name:'StormBreaker', ign:'StormB#003',     team:'Lunar Force',    game:'League of Legends',  wins:16, losses:5,  winRate:76, kd:'—',   points:1090, avatar:'SB' },
    { id:'lb6',  rank:6,  userId:'lb6',  name:'VoidWalker',   ign:'VoidW#420',      team:'BlazeCore',      game:'Valorant',           wins:15, losses:5,  winRate:75, kd:'1.6', points:1020, avatar:'VW' },
    { id:'lb7',  rank:7,  userId:'lb7',  name:'CrimsonAce',   ign:'CrimsonA#005',   team:'Iron Wolves',    game:'CS2',                wins:14, losses:6,  winRate:70, kd:'1.5', points: 960, avatar:'CA' },
    { id:'lb8',  rank:8,  userId:'lb8',  name:'EliteSniper',  ign:'EliteS#911',     team:'Nexus Gaming',   game:'PUBG Mobile',        wins:13, losses:5,  winRate:72, kd:'—',   points: 900, avatar:'ES' },
    { id:'lb9',  rank:9,  userId:'lb9',  name:'BlazeRunner',  ign:'BlazeR#101',     team:'Phoenix Squad',  game:'Valorant',           wins:12, losses:6,  winRate:66, kd:'1.4', points: 840, avatar:'BR' },
    { id:'lb10', rank:10, userId:'lb10', name:'IceQueen',     ign:'IceQ#202',       team:'Alpha Squad',    game:'League of Legends',  wins:11, losses:6,  winRate:64, kd:'—',   points: 790, avatar:'IQ' },
  ],

  async handle(method, endpoint, body) {
    await new Promise(r => setTimeout(r, 200))
    const [path] = endpoint.split('?')
    const seg = path.replace(/^\//, '').split('/')

    if (path === '/auth/login')  return this._login(body)
    if (path === '/auth/signup') return this._signup(body)
    if (path === '/auth/me')     return { data: null, error: 'Use AuthContext.user' }

    if (path === '/notifications') {
      if (method === 'GET') return { data: [...this._notifications], error: null }
      this._notifications.forEach(n => { n.read = true }); return { data: { ok: true }, error: null }
    }
    if (path === '/leaderboard') {
      const params = new URLSearchParams(endpoint.split('?')[1] || '')
      const game = params.get('game')
      return { data: game ? this._leaderboard.filter(r => r.game === game) : [...this._leaderboard], error: null }
    }
    if (path === '/tournaments') {
      if (method === 'GET')  return { data: [...this._tournaments], error: null }
      if (method === 'POST') {
        const t = { id: 't' + Date.now(), registeredTeams: 0, status: 'upcoming', ...body }
        this._tournaments.push(t); return { data: t, error: null }
      }
    }
    if (seg[0] === 'tournaments' && seg[1]) {
      const t = this._tournaments.find(x => x.id === seg[1])
      if (seg[2] === 'teams') {
        if (method === 'GET') return { data: this._teams.filter(x => x.tournamentId === seg[1]), error: null }
        if (method === 'POST') {
          const team = { id: 'tm' + Date.now(), tournamentId: seg[1], status: 'pending', ...body }
          this._teams.push(team)
          if (t) t.registeredTeams = (t.registeredTeams || 0) + 1
          return { data: team, error: null }
        }
      }
      if (seg[2] === 'bracket') return { data: this._buildBracket(seg[1]), error: null }
      if (!seg[2]) {
        if (method === 'GET') return t ? { data: { ...t }, error: null } : { data: null, error: 'Not found' }
        if (method === 'PUT') { Object.assign(t, body); return { data: { ...t }, error: null } }
      }
    }
    if (path === '/teams') {
      if (method === 'GET') return { data: [...this._teams], error: null }
      if (method === 'POST') {
        const team = { id: 'tm' + Date.now(), status: 'pending', ...body }
        this._teams.push(team)
        const t = this._tournaments.find(x => x.id === body.tournament)
        if (t) t.registeredTeams = (t.registeredTeams || 0) + 1
        return { data: team, error: null }
      }
    }
    if (path === '/matches') return { data: [...this._matches], error: null }
    if (seg[0] === 'matches' && seg[1]) {
      const m = this._matches.find(x => x.id === seg[1])
      if (!m) return { data: null, error: 'Match not found' }
      if (seg[2] === 'attendance') { m.attendance = { ...m.attendance, confirmed: true }; return { data: { ok: true }, error: null } }
      if (seg[2] === 'result')     { m.status = 'result_pending'; return { data: { ok: true }, error: null } }
      if (seg[2] === 'verify')     { m.winner = body.winnerId; m.status = 'completed'; return { data: { ok: true }, error: null } }
      if (!seg[2]) return { data: { ...m }, error: null }
    }
    if (seg[0] === 'teams' && seg[1]) {
      const team = this._teams.find(x => x.id === seg[1])
      if (seg[2] === 'approve') { if (team) team.status = 'approved'; return { data: { ok: true }, error: null } }
      if (seg[2] === 'reject')  { if (team) team.status = 'rejected'; return { data: { ok: true }, error: null } }
      if (!seg[2] && method === 'GET') return { data: team ? { ...team } : null, error: null }
    }
    if (seg[0] === 'users' && seg[1]) {
      const u = this._users.find(x => x.id === seg[1])
      if (seg[2] === 'stats') return { data: { userId: seg[1], totalMatches: 22, wins: 17, losses: 5, winRate: 77, tournamentsPlayed: 4, tournamentsWon: 1, currentStreak: 3, avgKD: 1.42, points: 1150 }, error: null }
      if (!seg[2] && method === 'GET')  return { data: u ? { ...u } : null, error: null }
      if (!seg[2] && method === 'PUT')  { if (u) Object.assign(u, body); return { data: { ...u }, error: null } }
    }
    return { data: null, error: 'Endpoint not found: ' + endpoint }
  },

  _login({ email, password }) {
    const user = this._users.find(u => u.email === email && u.password === password)
    if (!user) return { data: null, error: 'Invalid email or password.' }
    return { data: { user: { ...user }, token: 'mock-token-' + user.id }, error: null }
  },
  _signup(data) {
    if (this._users.find(u => u.email === data.email)) return { data: null, error: 'Email already registered.' }
    const user = { id: 'u' + Date.now(), avatar: (data.name || 'U').slice(0, 2).toUpperCase(), ...data }
    this._users.push(user)
    return { data: { user: { ...user }, token: 'mock-token-' + user.id }, error: null }
  },
  _buildBracket(tournamentId) {
    return {
      rounds: [
        { name: 'Round of 16', matches: [
          { id:'bm1', team1:{name:'Nova Esports',seed:1,logo:'NE'}, team2:{name:'Iron Wolves',seed:16,logo:'IW'}, score:null, status:'upcoming' },
          { id:'bm2', team1:{name:'Phoenix Squad',seed:8,logo:'PS'}, team2:{name:'Lunar Force',seed:9,logo:'LF'}, score:null, status:'upcoming' },
          { id:'bm3', team1:{name:'Falcon Strike',seed:4,logo:'FS'}, team2:{name:'Neon Blaze',seed:13,logo:'NB'}, score:null, status:'upcoming' },
          { id:'bm4', team1:{name:'Team Tempo',seed:5,logo:'TT'}, team2:{name:'Storm Riders',seed:12,logo:'SR'}, score:null, status:'upcoming' },
          { id:'bm5', team1:{name:'Crimson Edge',seed:2,logo:'CE'}, team2:{name:'Ghost Protocol',seed:15,logo:'GP'}, score:null, status:'upcoming' },
          { id:'bm6', team1:{name:'Shadow Tigers',seed:7,logo:'ST'}, team2:{name:'Dark Matter',seed:10,logo:'DM'}, score:null, status:'upcoming' },
          { id:'bm7', team1:{name:'Vortex Gaming',seed:3,logo:'VG'}, team2:{name:'Team Aura',seed:14,logo:'TA'}, score:null, status:'upcoming' },
          { id:'bm8', team1:{name:'BlazeCore',seed:6,logo:'BC'}, team2:{name:'Neon Panthers',seed:11,logo:'NP'}, score:null, status:'upcoming' },
        ]},
        { name: 'Quarterfinals', matches: [
          { id:'bm9', team1:{name:'Nova Esports',logo:'NE'}, team2:{name:'Phoenix Squad',logo:'PS'}, score:null, status:'upcoming' },
          { id:'bm10', team1:{name:'Falcon Strike',logo:'FS'}, team2:{name:'Team Tempo',logo:'TT'}, score:null, status:'upcoming' },
          { id:'bm11', team1:{name:'Crimson Edge',logo:'CE'}, team2:{name:'Shadow Tigers',logo:'ST'}, score:null, status:'upcoming' },
          { id:'bm12', team1:{name:'Vortex Gaming',logo:'VG'}, team2:{name:'BlazeCore',logo:'BC'}, score:null, status:'upcoming' },
        ]},
        { name: 'Semifinals', matches: [
          { id:'bm13', team1:{name:'TBD',logo:'?'}, team2:{name:'TBD',logo:'?'}, score:null, status:'pending' },
          { id:'bm14', team1:{name:'TBD',logo:'?'}, team2:{name:'TBD',logo:'?'}, score:null, status:'pending' },
        ]},
        { name: 'Grand Final', matches: [
          { id:'bm15', team1:{name:'TBD',logo:'?'}, team2:{name:'TBD',logo:'?'}, score:null, status:'pending' },
        ]},
      ]
    }
  },
}
