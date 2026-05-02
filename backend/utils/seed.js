/**
 * Seed script — populates data/ with demo data.
 * Run: node utils/seed.js
 * WARNING: Overwrites existing data files.
 */
const bcrypt = require('bcryptjs')
const { write } = require('./db')

const DEMO_PASSWORD_HASH = bcrypt.hashSync('demo123', 10)

// ── Users ──────────────────────────────────────────────────────────────
const users = [
  {
    id: 'u1', name: 'Ali Khan', username: 'AliKhan', email: 'ali@giki.edu.pk',
    password: DEMO_PASSWORD_HASH,
    role: 'manager', avatar: 'AK', game: 'Valorant', ign: null, team: 'Nova Esports',
    bio: 'Team Manager at Nova Esports',
    isDemo: true,
    stats: { matchesPlayed:0, wins:0, losses:0, winRate:0, kd:0, hsPercent:0, fbPercent:0, points:0, rank:null },
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'u2', name: 'Ahmed Raza', username: 'AhmedRaza', email: 'ahmed@giki.edu.pk',
    password: DEMO_PASSWORD_HASH,
    role: 'player', avatar: 'AR', game: 'Valorant', ign: 'PhoenixAR#001', team: 'Nova Esports',
    bio: 'Valorant Duelist main, Nova Esports',
    isDemo: true,
    stats: { matchesPlayed:22, wins:17, losses:5, winRate:77, kd:1.8, hsPercent:42, fbPercent:31, points:1150, rank:4 },
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'u3', name: 'Usman Javed', username: 'UsmanJaved', email: 'usman@giki.edu.pk',
    password: DEMO_PASSWORD_HASH,
    role: 'organizer', avatar: 'UJ', game: null, ign: null, team: null,
    bio: 'Tournament Organizer — Spring Cup 2025',
    isDemo: true,
    stats: { matchesPlayed:0, wins:0, losses:0, winRate:0, kd:0, hsPercent:0, fbPercent:0, points:0, rank:null },
    createdAt: '2025-01-01T00:00:00.000Z',
  },
]

// ── Tournaments ────────────────────────────────────────────────────────
const tournaments = [
  {
    id: 't1', title: 'Spring University Cup 2025', game: 'Valorant',
    status: 'live', stage: 'Quarterfinals', format: 'Single Elimination',
    maxTeams: 16, registered: 14, prize: 'PKR 15,000',
    date: 'Apr 15, 2025', deadline: 'May 8, 2025',
    platform: 'PC', description: 'The flagship GIKI esports event of the semester.',
    organizer: 'u3', createdAt: '2025-01-15T00:00:00.000Z',
  },
  {
    id: 't2', title: 'CS2 Open Championship', game: 'CS2',
    status: 'registration', stage: 'Registration', format: 'Double Elimination',
    maxTeams: 8, registered: 5, prize: 'PKR 8,000',
    date: 'May 20, 2025', deadline: 'May 15, 2025',
    platform: 'PC', description: 'Open CS2 tournament for all GIKI students.',
    organizer: 'u3', createdAt: '2025-02-01T00:00:00.000Z',
  },
  {
    id: 't3', title: 'LoL Clash Season 2', game: 'League of Legends',
    status: 'upcoming', stage: 'Upcoming', format: 'Single Elimination',
    maxTeams: 8, registered: 2, prize: 'PKR 5,000',
    date: 'Jun 1, 2025', deadline: 'May 25, 2025',
    platform: 'PC', description: 'Clash-format LoL tournament. Register early!',
    organizer: 'u3', createdAt: '2025-02-15T00:00:00.000Z',
  },
  {
    id: 't4', title: 'PUBG Mobile Winter Clash 2024', game: 'PUBG Mobile',
    status: 'completed', stage: 'Completed', format: 'Battle Royale',
    maxTeams: 12, registered: 12, prize: 'PKR 10,000',
    date: 'Dec 2024', deadline: 'Nov 30, 2024',
    platform: 'Mobile', description: 'Last semester\'s flagship mobile event.',
    organizer: 'u3', createdAt: '2024-11-01T00:00:00.000Z',
  },
]

// ── Teams ──────────────────────────────────────────────────────────────
const teams = [
  {
    id: 'tm1', name: 'Nova Esports', tag: 'NE', game: 'Valorant',
    tournament: 't1', manager: 'u1', status: 'approved', seed: 1,
    players: [
      { userId:'u2', name:'Ahmed Raza',  ign:'PhoenixAR#001', role:'Duelist',    confirmed:true  },
      { userId:null, name:'Sara Malik',  ign:'SaraM#999',     role:'Controller', confirmed:true  },
      { userId:null, name:'Hamza Ali',   ign:'HamzaGG#002',   role:'Initiator',  confirmed:true  },
      { userId:null, name:'Omar Baig',   ign:'OmarB#007',     role:'Sentinel',   confirmed:false },
      { userId:null, name:'Zain Khan',   ign:'ZainK99#003',   role:'Flex',       confirmed:true  },
    ],
    sub: null,
    wins:17, losses:5, winRate:77,
    createdAt: '2025-01-20T00:00:00.000Z',
  },
  {
    id: 'tm2', name: 'Phoenix Squad', tag: 'PS', game: 'Valorant',
    tournament: 't1', manager: null, status: 'approved', seed: 8,
    players: [
      { userId:null, name:'Bilal Ahmed', ign:'BilalFPS#001',  role:'Duelist',    confirmed:true },
      { userId:null, name:'Sana Mirza',  ign:'SanaMirza#010', role:'Controller', confirmed:true },
      { userId:null, name:'Ali Raza',    ign:'AliRaza01#002', role:'Initiator',  confirmed:true },
      { userId:null, name:'Fatima K',    ign:'FatimaK#003',   role:'Sentinel',   confirmed:true },
      { userId:null, name:'Umar Farooq', ign:'UmarFPS#004',   role:'Flex',       confirmed:false},
    ],
    sub: null,
    wins:9, losses:11, winRate:45,
    createdAt: '2025-01-22T00:00:00.000Z',
  },
  {
    id: 'tm3', name: 'Storm Riders', tag: 'SR', game: 'Valorant',
    tournament: 't1', manager: null, status: 'approved', seed: 3,
    players: [],
    sub: null, wins:14, losses:6, winRate:70,
    createdAt: '2025-01-18T00:00:00.000Z',
  },
  {
    id: 'tm4', name: 'BlazeCore', tag: 'BC', game: 'Valorant',
    tournament: 't1', manager: null, status: 'approved', seed: 5,
    players: [],
    sub: null, wins:12, losses:8, winRate:60,
    createdAt: '2025-01-19T00:00:00.000Z',
  },
  {
    id: 'tm5', name: 'Cyber Wolves', tag: 'CW', game: 'Valorant',
    tournament: 't1', manager: null, status: 'approved', seed: 6,
    players: [],
    sub: null, wins:10, losses:10, winRate:50,
    createdAt: '2025-01-21T00:00:00.000Z',
  },
]

// ── Matches ────────────────────────────────────────────────────────────
const now = Date.now()
const matches = [
  {
    id: 'm1', tournament: 't1', stage: 'Quarterfinal',
    teamA: 'Nova Esports', teamB: 'Phoenix Squad',
    teamAId: 'tm1', teamBId: 'tm2',
    scheduledAt: new Date(now + 1.75 * 3600000).toISOString(),
    status: 'upcoming', score: null, winner: null,
    game: 'Valorant', format: 'Best of 3',
    lobbyCode: null, server: 'Middle East',
    attendanceA: false, attendanceB: false,
    createdAt: new Date(now - 24 * 3600000).toISOString(),
  },
  {
    id: 'm2', tournament: 't1', stage: 'Quarterfinal',
    teamA: 'Storm Riders', teamB: 'Cyber Wolves',
    teamAId: 'tm3', teamBId: 'tm5',
    scheduledAt: new Date(now + 3 * 3600000).toISOString(),
    status: 'upcoming', score: null, winner: null,
    game: 'Valorant', format: 'Best of 3',
    lobbyCode: null, server: 'Middle East',
    attendanceA: false, attendanceB: false,
    createdAt: new Date(now - 24 * 3600000).toISOString(),
  },
  {
    id: 'm3', tournament: 't1', stage: 'Quarterfinal',
    teamA: 'Nova Esports', teamB: 'Storm Riders',
    teamAId: 'tm1', teamBId: 'tm3',
    scheduledAt: new Date(now - 48 * 3600000).toISOString(),
    status: 'completed', score: '2-0', winner: 'Nova Esports',
    game: 'Valorant', format: 'Best of 3',
    createdAt: new Date(now - 72 * 3600000).toISOString(),
  },
]

// ── Notifications ──────────────────────────────────────────────────────
const notifications = [
  { id:'n1', userId:'u2', message:'Your next match vs <strong>Phoenix Squad</strong> is in 2 hours.', time:'1h ago',  read:false },
  { id:'n2', userId:'u1', message:'Team <strong>Nexus Gaming</strong> has submitted for approval.', time:'3h ago',  read:false },
  { id:'n3', userId:'u2', message:'Match result verified — <strong>Nova Esports</strong> advances!', time:'1d ago',  read:true  },
  { id:'n4', userId:'u3', message:'New result submitted for verification: <strong>QF Match 1</strong>.', time:'2h ago', read:false },
  { id:'n5', userId:'u1', message:'Registration closes in <strong>3 days</strong> — confirm your roster.', time:'6h ago', read:true },
]

// ── Leaderboard ────────────────────────────────────────────────────────
const leaderboard = [
  { id:'lb1',  rank:1,  userId:'lb1',  name:'PhoenixAR',    ign:'PhoenixAR#001',  team:'Nova Esports',  game:'Valorant',          wins:24, losses:4,  winRate:85, kd:'2.1', points:1420, avatar:'PA' },
  { id:'lb2',  rank:2,  userId:'lb2',  name:'ShadowKnight', ign:'ShadowK#007',    team:'Storm Riders',  game:'CS2',               wins:21, losses:5,  winRate:80, kd:'1.9', points:1310, avatar:'SK' },
  { id:'lb3',  rank:3,  userId:'lb3',  name:'NightOwl',     ign:'NightOwl#999',   team:'Cyber Wolves',  game:'Valorant',          wins:19, losses:6,  winRate:76, kd:'1.7', points:1205, avatar:'NO' },
  { id:'lb4',  rank:4,  userId:'u2',   name:'AhmedRaza',    ign:'PhoenixAR#002',  team:'Nova Esports',  game:'Valorant',          wins:17, losses:5,  winRate:77, kd:'1.8', points:1150, avatar:'AR' },
  { id:'lb5',  rank:5,  userId:'lb5',  name:'StormBreaker', ign:'StormB#003',     team:'Lunar Force',   game:'League of Legends', wins:16, losses:5,  winRate:76, kd:'—',   points:1090, avatar:'SB' },
  { id:'lb6',  rank:6,  userId:'lb6',  name:'VoidWalker',   ign:'VoidW#420',      team:'BlazeCore',     game:'Valorant',          wins:15, losses:5,  winRate:75, kd:'1.6', points:1020, avatar:'VW' },
  { id:'lb7',  rank:7,  userId:'lb7',  name:'CrimsonAce',   ign:'CrimsonA#005',   team:'Iron Wolves',   game:'CS2',               wins:14, losses:6,  winRate:70, kd:'1.5', points: 960, avatar:'CA' },
  { id:'lb8',  rank:8,  userId:'lb8',  name:'EliteSniper',  ign:'EliteS#911',     team:'Nexus Gaming',  game:'PUBG Mobile',       wins:13, losses:5,  winRate:72, kd:'—',   points: 900, avatar:'ES' },
  { id:'lb9',  rank:9,  userId:'lb9',  name:'BlazeRunner',  ign:'BlazeR#101',     team:'Phoenix Squad', game:'Valorant',          wins:12, losses:6,  winRate:66, kd:'1.4', points: 840, avatar:'BR' },
  { id:'lb10', rank:10, userId:'lb10', name:'IceQueen',     ign:'IceQ#202',       team:'Alpha Squad',   game:'League of Legends', wins:11, losses:6,  winRate:64, kd:'—',   points: 790, avatar:'IQ' },
]

// ── Write all collections ──────────────────────────────────────────────
write('users',         users)
write('tournaments',   tournaments)
write('teams',         teams)
write('matches',       matches)
write('notifications', notifications)
write('leaderboard',   leaderboard)

console.log('✅ Database seeded successfully!')
console.log(`   Users:         ${users.length}`)
console.log(`   Tournaments:   ${tournaments.length}`)
console.log(`   Teams:         ${teams.length}`)
console.log(`   Matches:       ${matches.length}`)
console.log(`   Notifications: ${notifications.length}`)
console.log(`   Leaderboard:   ${leaderboard.length}`)
console.log('\nDemo accounts (password: demo123):')
console.log('  Player:    ahmed@giki.edu.pk')
console.log('  Manager:   ali@giki.edu.pk')
console.log('  Organizer: usman@giki.edu.pk')
