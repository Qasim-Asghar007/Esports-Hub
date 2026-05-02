require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') })

const db = require('./db')
const prisma = require('./prisma')

async function migrate() {
  console.log('Starting migration to Neon Serverless Postgres...')

  // 1. Users
  const users = db.findAll('users')
  for (const user of users) {
    const existing = await prisma.user.findUnique({ where: { id: user.id } })
    if (!existing) {
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          username: user.username || user.email.split('@')[0],
          email: user.email,
          password: user.password,
          role: user.role,
          avatar: user.avatar,
          game: user.game,
          ign: user.ign,
          bio: user.bio,
          isDemo: user.isDemo || false,
          stats: user.stats || {},
          createdAt: new Date(user.createdAt || Date.now())
        }
      })
    }
  }
  console.log(`Migrated ${users.length} users.`)

  // 2. Tournaments
  const tournaments = db.findAll('tournaments')
  for (const t of tournaments) {
    const existing = await prisma.tournament.findUnique({ where: { id: t.id } })
    if (!existing) {
      await prisma.tournament.create({
        data: {
          id: t.id,
          title: t.title,
          game: t.game,
          status: t.status,
          stage: t.stage || 'Registration',
          format: t.format || 'Single Elimination',
          maxTeams: t.maxTeams,
          registered: t.registered || 0,
          prize: t.prize,
          date: t.date,
          deadline: t.deadline,
          platform: t.platform || 'PC',
          description: t.description,
          organizer: t.organizer,
          createdAt: new Date(t.createdAt || Date.now())
        }
      })
    }
  }
  console.log(`Migrated ${tournaments.length} tournaments.`)

  // 3. Teams
  const teams = db.findAll('teams')
  for (const team of teams) {
    const existing = await prisma.team.findUnique({ where: { id: team.id } })
    if (!existing) {
      await prisma.team.create({
        data: {
          id: team.id,
          name: team.name,
          tag: team.tag || team.name.slice(0, 2).toUpperCase(),
          game: team.game,
          status: team.status || 'pending',
          seed: team.seed,
          wins: team.wins || 0,
          losses: team.losses || 0,
          winRate: team.winRate || 0,
          createdAt: new Date(team.createdAt || Date.now()),
          managerId: team.manager,
          tournamentId: team.tournament
        }
      })
    }
    
    // Process team players
    if (team.players && Array.isArray(team.players)) {
      for (const player of team.players) {
        const pExisting = await prisma.teamPlayer.findFirst({ where: { teamId: team.id, name: player.name } })
        if (!pExisting) {
          await prisma.teamPlayer.create({
            data: {
              name: player.name,
              ign: player.ign || player.name,
              role: player.role || 'Player',
              confirmed: player.confirmed || false,
              teamId: team.id,
              userId: player.userId || null
            }
          })
        }
      }
    }
    // Process sub
    if (team.sub && team.sub.name) {
       const subExisting = await prisma.teamPlayer.findFirst({ where: { teamId: team.id, name: team.sub.name } })
       if (!subExisting) {
         await prisma.teamPlayer.create({
            data: {
              name: team.sub.name,
              ign: team.sub.ign || team.sub.name,
              role: 'Substitute',
              confirmed: team.sub.confirmed || false,
              teamId: team.id,
              userId: team.sub.userId || null
            }
         })
       }
    }
  }
  console.log(`Migrated ${teams.length} teams and their rosters.`)

  // 4. Matches
  const matches = db.findAll('matches')
  for (const m of matches) {
    const existing = await prisma.match.findUnique({ where: { id: m.id } })
    if (!existing) {
      await prisma.match.create({
        data: {
          id: m.id,
          tournamentId: m.tournament,
          stage: m.stage || 'Group Stage',
          teamAId: m.teamAId || null,
          teamBId: m.teamBId || null,
          scheduledAt: m.scheduledAt ? new Date(m.scheduledAt) : null,
          status: m.status || 'upcoming',
          score: m.score || null,
          winner: m.winner === m.teamA ? m.teamAId : (m.winner === m.teamB ? m.teamBId : null),
          game: m.game || 'Valorant',
          format: m.format || 'Best of 3',
          lobbyCode: m.lobbyCode,
          server: m.server || 'Middle East',
          attendanceA: m.attendanceA || false,
          attendanceB: m.attendanceB || false,
          resultSubmitted: m.resultSubmitted || null,
          resultVerified: m.resultVerified || false,
          verifiedBy: m.verifiedBy || null,
          verifiedAt: m.verifiedAt ? new Date(m.verifiedAt) : null,
          dispute: m.dispute || null,
          createdAt: new Date(m.createdAt || Date.now())
        }
      })
    }
  }
  console.log(`Migrated ${matches.length} matches.`)

  // 5. Notifications
  const notifications = db.findAll('notifications')
  for (const n of notifications) {
    const existing = await prisma.notification.findUnique({ where: { id: n.id } })
    if (!existing) {
      await prisma.notification.create({
        data: {
          id: n.id,
          userId: n.userId,
          message: n.message,
          time: n.time || 'just now',
          read: n.read || false,
          type: n.type,
          teamId: n.teamId,
          createdAt: new Date(n.createdAt || Date.now())
        }
      })
    }
  }
  console.log(`Migrated ${notifications.length} notifications.`)

  // Leaderboard is derived, so no need to migrate.
  console.log('✅ Migration complete!')
}

migrate()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
