-- RDCM Poker Database Schema
-- Copy and paste this entire file into Supabase SQL Editor

-- Table 1: Players (user profiles)
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  balance INTEGER DEFAULT 10000,
  total_wins INTEGER DEFAULT 0,
  total_hands INTEGER DEFAULT 0,
  total_profit INTEGER DEFAULT 0,
  avatar_url TEXT,
  last_played_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table 2: Game Sessions (poker tables/rooms)
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'waiting',
  buy_in INTEGER NOT NULL,
  max_players INTEGER DEFAULT 6,
  current_players INTEGER DEFAULT 1,
  pot INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table 3: Game Players (individual players in a session)
CREATE TABLE IF NOT EXISTS game_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  is_ai BOOLEAN DEFAULT FALSE,
  balance INTEGER NOT NULL,
  current_bet INTEGER DEFAULT 0,
  hand_rank TEXT,
  position INTEGER,
  profit INTEGER DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Table 4: Game History (hand records for leaderboards)
CREATE TABLE IF NOT EXISTS game_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hand_rank TEXT,
  result TEXT,
  amount_won INTEGER DEFAULT 0,
  amount_lost INTEGER DEFAULT 0,
  played_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_game_sessions_host_id ON game_sessions(host_id);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_game_players_session_id ON game_players(session_id);
CREATE INDEX idx_game_players_user_id ON game_players(user_id);
CREATE INDEX idx_game_history_user_id ON game_history(user_id);
CREATE INDEX idx_game_history_session_id ON game_history(session_id);

-- Enable RLS (Row Level Security)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for players table
CREATE POLICY "Players can read own profile"
  ON players FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

CREATE POLICY "Players can update own profile"
  ON players FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Players can insert own profile"
  ON players FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for game_sessions (anyone authenticated can see)
CREATE POLICY "Authenticated users can read game sessions"
  ON game_sessions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Host can update own session"
  ON game_sessions FOR UPDATE
  USING (auth.uid() = host_id);

-- RLS Policies for game_players
CREATE POLICY "Players can read game players in their sessions"
  ON game_players FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM game_sessions WHERE host_id = auth.uid()
    ) OR user_id = auth.uid()
  );

-- RLS Policies for game_history
CREATE POLICY "Players can read own game history"
  ON game_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Players can insert own game history"
  ON game_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Initialization: Insert default AI players (optional)
-- These are placeholder records for AI bots if needed
INSERT INTO players (user_id, username, balance, is_ai)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'ProBot', 5000),
  ('22222222-2222-2222-2222-222222222222', 'BalancedAI', 5000),
  ('33333333-3333-3333-3333-333333333333', 'FishBot', 5000),
  ('44444444-4444-4444-4444-444444444444', 'SharpBot', 5000),
  ('55555555-5555-5555-5555-555555555555', 'CasualBot', 5000)
ON CONFLICT DO NOTHING;

-- Done! Your database is ready.
-- Next: Copy .env.local template and fill in your Supabase URL & key
-- Then run: npm install && npm start
