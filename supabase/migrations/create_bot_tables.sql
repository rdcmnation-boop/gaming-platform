-- Supabase Migration: Create Bot System Tables
-- Run this in Supabase SQL Editor to set up all tables

-- Games table - stores all game records
CREATE TABLE IF NOT EXISTS games (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL,
  player_name TEXT NOT NULL,
  buy_in BIGINT DEFAULT 100,
  final_stack BIGINT DEFAULT 0,
  profit BIGINT DEFAULT 0,
  duration BIGINT DEFAULT 0, -- in seconds
  hands_played BIGINT DEFAULT 1,
  bots_played TEXT[] DEFAULT ARRAY[]::TEXT[],
  winner TEXT,
  coaching_enabled BOOLEAN DEFAULT FALSE,
  difficulty TEXT DEFAULT 'casual', -- fish, casual, sharp, pro
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Player stats table - aggregate statistics
CREATE TABLE IF NOT EXISTS player_stats (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL UNIQUE,
  total_games BIGINT DEFAULT 0,
  total_hands BIGINT DEFAULT 0,
  total_profit BIGINT DEFAULT 0,
  wins BIGINT DEFAULT 0,
  losses BIGINT DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  best_profit BIGINT DEFAULT 0,
  worst_loss BIGINT DEFAULT 0,
  avg_stack_size DECIMAL(10,2) DEFAULT 0,
  highest_stakes BIGINT DEFAULT 0,
  last_played TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bot decisions table - for tracking and learning
CREATE TABLE IF NOT EXISTS bot_decisions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  bot_name TEXT NOT NULL,
  bot_level BIGINT DEFAULT 2, -- 1=Fish, 2=Casual, 3=Sharp, 4=Pro
  hand_rank BIGINT DEFAULT 5, -- 1-10
  position TEXT, -- early, middle, late, button
  pot_size BIGINT DEFAULT 0,
  opponent_count BIGINT DEFAULT 3,
  decision TEXT, -- RAISE, CALL, FOLD, CHECK, BLUFF
  confidence DECIMAL(5,2) DEFAULT 0,
  result TEXT, -- win, loss, fold
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hand history - detailed hand records
CREATE TABLE IF NOT EXISTS hand_history (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  game_id BIGINT REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  hand_number BIGINT DEFAULT 1,
  player_hand TEXT, -- e.g., "Pair of Kings"
  player_action TEXT, -- RAISE, CALL, FOLD, etc.
  bot_actions TEXT[], -- array of bot decisions
  winner TEXT,
  pot_size BIGINT DEFAULT 0,
  coaching_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bot profiles - bot configurations and personalities
CREATE TABLE IF NOT EXISTS bot_profiles (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  level BIGINT DEFAULT 1,
  aggression DECIMAL(3,2) DEFAULT 0.5,
  win_rate DECIMAL(5,2) DEFAULT 50,
  personality TEXT, -- mentor, sharp, friendly, analytical
  style TEXT, -- tight, loose, balanced
  bluff_frequency DECIMAL(3,2) DEFAULT 0.1,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teaching content - academy materials
CREATE TABLE IF NOT EXISTS teaching_content (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  category TEXT NOT NULL, -- hand_rankings, concepts, strategies
  title TEXT NOT NULL,
  content TEXT,
  emoji TEXT,
  difficulty_level TEXT, -- beginner, intermediate, advanced
  examples TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Coaching sessions - track coaching interactions
CREATE TABLE IF NOT EXISTS coaching_sessions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL,
  game_id BIGINT REFERENCES games(id),
  hand_number BIGINT,
  advice_given TEXT,
  accuracy DECIMAL(5,2), -- how accurate the advice was
  user_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at);
CREATE INDEX IF NOT EXISTS idx_player_stats_user_id ON player_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_decisions_created_at ON bot_decisions(created_at);
CREATE INDEX IF NOT EXISTS idx_hand_history_game_id ON hand_history(game_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_user_id ON coaching_sessions(user_id);

-- Insert default bots
INSERT INTO bot_profiles (name, level, aggression, win_rate, personality, style, bluff_frequency, description) VALUES
  ('FishBot', 1, 0.30, 30, 'friendly', 'loose', 0.05, 'Weak player - good for beginners'),
  ('BalancedAI', 2, 0.60, 60, 'analytical', 'balanced', 0.10, 'Strategic player - intermediate'),
  ('SharpBot', 3, 0.75, 75, 'sharp', 'tight', 0.15, 'Aggressive player - advanced'),
  ('ProBot', 3, 0.90, 80, 'mentor', 'tight', 0.25, 'Professional player - expert level');

-- Insert teaching content
INSERT INTO teaching_content (category, title, content, emoji, difficulty_level, examples) VALUES
  ('hand_rankings', 'Royal Flush', 'A-K-Q-J-10, all the same suit. The best possible hand in poker.', '👑', 'beginner', ARRAY['A♠ K♠ Q♠ J♠ 10♠']),
  ('hand_rankings', 'Straight Flush', 'Five cards in sequence, all the same suit.', '🔥', 'beginner', ARRAY['9♥ 8♥ 7♥ 6♥ 5♥']),
  ('concepts', 'Position Strategy', 'Your position at the table determines what hands to play. Late position is stronger.', '📍', 'beginner', ARRAY['Early: AA, KK, QQ, AK only', 'Late: Play wider range']),
  ('concepts', 'Pot Odds', 'Calculate if you have odds to call. Pot odds = Amount to call / Total pot size.', '🎲', 'intermediate', ARRAY['Pot $100, Call $20: 5:1 odds']),
  ('strategies', 'Position Play', 'Play tighter in early position, wider in late position. Use button advantage.', '📊', 'intermediate', ARRAY['Early: Premium hands only', 'Button: Steal blinds often']),
  ('strategies', 'Bankroll Management', 'Never risk more than 5% per game. Maintain 20+ buy-in cushion for safety.', '💰', 'beginner', ARRAY['Stack: $1000, Max risk: $50 per hand']);

-- Enable RLS (Row Level Security) for security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own games"
  ON games FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own games"
  ON games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own stats"
  ON player_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own coaching sessions"
  ON coaching_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Done
SELECT 'Bot system tables created successfully!' as status;
