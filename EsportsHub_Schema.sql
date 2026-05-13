-- ==============================================================================
-- EsportsHub Advanced Database Schema & Mock Data
-- Optimized for Neon Serverless Postgres
-- ==============================================================================

-- 1. CLEANUP (Drop existing objects if they exist to prevent errors on reload)
DROP VIEW IF EXISTS "vw_team_performance" CASCADE;
DROP VIEW IF EXISTS "vw_tournament_summary" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "Match" CASCADE;
DROP TABLE IF EXISTS "TeamPlayer" CASCADE;
DROP TABLE IF EXISTS "Team" CASCADE;
DROP TABLE IF EXISTS "Tournament" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- ==============================================================================
-- 2. TABLE DEFINITIONS (With Advanced Constraints)
-- ==============================================================================

-- Table: User
CREATE TABLE "User" (
  "id" VARCHAR(255) PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "username" VARCHAR(255) UNIQUE NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "role" VARCHAR(50) NOT NULL CHECK ("role" IN ('player', 'manager', 'organizer', 'admin')),
  "avatar" VARCHAR(255),
  "game" VARCHAR(100),
  "ign" VARCHAR(100),
  "bio" TEXT,
  "isDemo" BOOLEAN NOT NULL DEFAULT FALSE,
  "stats" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Tournament
CREATE TABLE "Tournament" (
  "id" VARCHAR(255) PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "game" VARCHAR(100) NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'upcoming' CHECK ("status" IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  "stage" VARCHAR(100) NOT NULL DEFAULT 'Registration',
  "format" VARCHAR(100) NOT NULL DEFAULT 'Single Elimination',
  "maxTeams" INTEGER NOT NULL DEFAULT 16 CHECK ("maxTeams" > 0),
  "registered" INTEGER NOT NULL DEFAULT 0,
  "prize" VARCHAR(100) NOT NULL DEFAULT 'TBA',
  "date" VARCHAR(100),
  "deadline" VARCHAR(100),
  "platform" VARCHAR(50) NOT NULL DEFAULT 'PC',
  "description" TEXT,
  "organizer" VARCHAR(255),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Team
CREATE TABLE "Team" (
  "id" VARCHAR(255) PRIMARY KEY,
  "name" VARCHAR(255) UNIQUE NOT NULL,
  "tag" VARCHAR(50) NOT NULL,
  "game" VARCHAR(100) NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'approved', 'disqualified')),
  "seed" INTEGER,
  "wins" INTEGER NOT NULL DEFAULT 0 CHECK ("wins" >= 0),
  "losses" INTEGER NOT NULL DEFAULT 0 CHECK ("losses" >= 0),
  "winRate" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  "managerId" VARCHAR(255),
  "tournamentId" VARCHAR(255),
  CONSTRAINT "Team_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table: TeamPlayer
CREATE TABLE "TeamPlayer" (
  "id" VARCHAR(255) PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "ign" VARCHAR(100) NOT NULL,
  "role" VARCHAR(50) NOT NULL,
  "confirmed" BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Foreign Keys
  "teamId" VARCHAR(255) NOT NULL,
  "userId" VARCHAR(255),
  CONSTRAINT "TeamPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TeamPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table: Match
CREATE TABLE "Match" (
  "id" VARCHAR(255) PRIMARY KEY,
  "stage" VARCHAR(100) NOT NULL,
  "scheduledAt" TIMESTAMP,
  "status" VARCHAR(50) NOT NULL DEFAULT 'upcoming' CHECK ("status" IN ('upcoming', 'live', 'completed', 'disputed')),
  "score" VARCHAR(50),
  "winner" VARCHAR(255),
  "game" VARCHAR(100) NOT NULL DEFAULT 'Valorant',
  "format" VARCHAR(100) NOT NULL DEFAULT 'Best of 3',
  "lobbyCode" VARCHAR(100),
  "server" VARCHAR(100) NOT NULL DEFAULT 'Middle East',
  "attendanceA" BOOLEAN NOT NULL DEFAULT FALSE,
  "attendanceB" BOOLEAN NOT NULL DEFAULT FALSE,
  "resultSubmitted" JSONB,
  "resultVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "verifiedBy" VARCHAR(255),
  "verifiedAt" TIMESTAMP,
  "dispute" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  "tournamentId" VARCHAR(255) NOT NULL,
  "teamAId" VARCHAR(255),
  "teamBId" VARCHAR(255),
  CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Match_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Match_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table: Notification
CREATE TABLE "Notification" (
  "id" VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "time" VARCHAR(50) NOT NULL DEFAULT 'just now',
  "read" BOOLEAN NOT NULL DEFAULT FALSE,
  "type" VARCHAR(50),
  "teamId" VARCHAR(255),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 3. INDEXES (For Performance Optimization)
-- ==============================================================================
-- B-Tree Indexes for fast lookups on foreign keys and commonly searched fields
CREATE INDEX "idx_user_email" ON "User"("email");
CREATE INDEX "idx_user_username" ON "User"("username");
CREATE INDEX "idx_team_manager" ON "Team"("managerId");
CREATE INDEX "idx_team_tournament" ON "Team"("tournamentId");
CREATE INDEX "idx_match_tournament" ON "Match"("tournamentId");
CREATE INDEX "idx_notification_user" ON "Notification"("userId");

-- ==============================================================================
-- 4. FUNCTIONS & TRIGGERS (Automated Database Logic)
-- ==============================================================================

-- Function to automatically update 'updatedAt' timestamp
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers to relevant tables
CREATE TRIGGER trg_user_updated
BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

CREATE TRIGGER trg_team_updated
BEFORE UPDATE ON "Team" FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

CREATE TRIGGER trg_match_updated
BEFORE UPDATE ON "Match" FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- Function to automatically calculate Team win rate
CREATE OR REPLACE FUNCTION calculate_team_winrate()
RETURNS TRIGGER AS $$
BEGIN
   IF (NEW.wins + NEW.losses) > 0 THEN
       NEW."winRate" = ROUND((NEW.wins::numeric / (NEW.wins + NEW.losses)::numeric) * 100);
   ELSE
       NEW."winRate" = 0;
   END IF;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate win rate whenever wins or losses change
CREATE TRIGGER trg_team_winrate
BEFORE INSERT OR UPDATE OF wins, losses ON "Team"
FOR EACH ROW EXECUTE PROCEDURE calculate_team_winrate();

-- ==============================================================================
-- 5. ANALYTICAL VIEWS
-- ==============================================================================

-- View: vw_team_performance
-- Description: Aggregates team data to show overall performance and manager info.
CREATE VIEW "vw_team_performance" AS
SELECT 
    t.id AS team_id,
    t.name AS team_name,
    t.tag AS team_tag,
    t.game,
    u.username AS manager_username,
    t.wins,
    t.losses,
    t."winRate" AS win_percentage,
    (SELECT COUNT(*) FROM "TeamPlayer" tp WHERE tp."teamId" = t.id) AS roster_size
FROM "Team" t
LEFT JOIN "User" u ON t."managerId" = u.id;

-- View: vw_tournament_summary
-- Description: Quick summary of tournaments and fill capacity.
CREATE VIEW "vw_tournament_summary" AS
SELECT 
    id,
    title,
    game,
    status,
    registered,
    "maxTeams",
    ROUND((registered::numeric / "maxTeams"::numeric) * 100, 1) AS fill_percentage,
    prize
FROM "Tournament";

-- ==============================================================================
-- 6. MOCK DATA INSERTION
-- ==============================================================================

-- Insert Mock Users
INSERT INTO "User" ("id", "name", "username", "email", "password", "role", "ign") VALUES
('u101', 'John Doe', 'johndoe', 'john@esportshub.com', '$2b$10$hashedpassword1', 'manager', 'JD_Crusher'),
('u102', 'Jane Smith', 'janesmith', 'jane@esportshub.com', '$2b$10$hashedpassword2', 'player', 'ViperQueen'),
('u103', 'Admin Ali', 'adminali', 'admin@esportshub.com', '$2b$10$hashedpassword3', 'organizer', 'SysAdmin');

-- Insert Mock Tournament
INSERT INTO "Tournament" ("id", "title", "game", "status", "maxTeams", "registered", "prize", "platform") VALUES
('t101', 'Neon Valorant Invitational', 'Valorant', 'ongoing', 16, 2, '$5,000 USD', 'PC');

-- Insert Mock Teams
INSERT INTO "Team" ("id", "name", "tag", "game", "status", "wins", "losses", "managerId", "tournamentId") VALUES
('team_001', 'Cloud9', 'C9', 'Valorant', 'approved', 15, 3, 'u101', 't101'),
('team_002', 'Sentinels', 'SEN', 'Valorant', 'approved', 12, 5, 'u101', 't101');

-- Insert Mock Team Players
INSERT INTO "TeamPlayer" ("id", "name", "ign", "role", "confirmed", "teamId", "userId") VALUES
('p_001', 'TenZ', 'TenZ', 'Duelist', TRUE, 'team_002', NULL),
('p_002', 'Jane Smith', 'ViperQueen', 'Controller', TRUE, 'team_001', 'u102');

-- Insert Mock Matches
INSERT INTO "Match" ("id", "stage", "status", "teamAId", "teamBId", "tournamentId", "score", "winner") VALUES
('m_001', 'Quarter-Finals', 'completed', 'team_001', 'team_002', 't101', '2-1', 'team_001'),
('m_002', 'Semi-Finals', 'upcoming', 'team_001', NULL, 't101', NULL, NULL);

-- Insert Mock Notifications
INSERT INTO "Notification" ("id", "userId", "message", "type") VALUES
('n_001', 'u101', 'Your team Sentinels has been approved for the tournament.', 'tournament_update'),
('n_002', 'u102', 'You have been added to the Cloud9 roster.', 'team_invite');

-- ==============================================================================
-- END OF SCRIPT
-- ==============================================================================
