-- Additional Betting Bot Tables for API Integration

-- Betting strategies (user's bot configuration)
CREATE TABLE IF NOT EXISTS betting_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy VARCHAR(50) NOT NULL DEFAULT 'value', -- kelly, value, aggressive, conservative
  bankroll DECIMAL(12, 2) NOT NULL DEFAULT 10000,
  max_risk_per_bet DECIMAL(5, 2) NOT NULL DEFAULT 0.05,
  profit_target DECIMAL(5, 2) NOT NULL DEFAULT 0.10,
  loss_limit DECIMAL(5, 2) NOT NULL DEFAULT 0.20,
  min_odds DECIMAL(5, 2) NOT NULL DEFAULT 1.5,
  min_value_edge DECIMAL(5, 4) NOT NULL DEFAULT 1.1,
  auto_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX(user_id)
);

-- Betting analysis log
CREATE TABLE IF NOT EXISTS betting_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy VARCHAR(50),
  bankroll DECIMAL(12, 2),
  opportunities_analyzed INT DEFAULT 0,
  recommendations_count INT DEFAULT 0,
  top_ev DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX(user_id, created_at)
);

-- Enhanced bets table with user_id for easier queries
ALTER TABLE bets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE bets ADD COLUMN IF NOT EXISTS game_id VARCHAR(255);
ALTER TABLE bets ADD COLUMN IF NOT EXISTS home_team VARCHAR(255);
ALTER TABLE bets ADD COLUMN IF NOT EXISTS away_team VARCHAR(255);
ALTER TABLE bets ADD COLUMN IF NOT EXISTS match_time TIMESTAMP;
ALTER TABLE bets ADD COLUMN IF NOT EXISTS team VARCHAR(255);
ALTER TABLE bets ADD COLUMN IF NOT EXISTS profit DECIMAL(12, 2);
ALTER TABLE bets ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
ALTER TABLE bets ADD COLUMN IF NOT EXISTS result VARCHAR(255);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bets_user_status ON bets(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bets_user_created ON bets(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bets_user_result ON bets(user_id, result);

-- Enable RLS on new tables
ALTER TABLE betting_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE betting_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for betting_strategies
CREATE POLICY "Users can view own strategy"
  ON betting_strategies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create strategy"
  ON betting_strategies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strategy"
  ON betting_strategies FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for betting_analysis
CREATE POLICY "Users can view own analysis"
  ON betting_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert analysis"
  ON betting_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update bets RLS to include user_id checks
DROP POLICY IF EXISTS "Users can view own bets" ON bets;
DROP POLICY IF EXISTS "Users can place bets for own sessions" ON bets;
DROP POLICY IF EXISTS "Users can update own bets" ON bets;

CREATE POLICY "Users can view own bets"
  ON bets FOR SELECT
  USING (
    auth.uid() = user_id OR
    session_id IN (
      SELECT id FROM betting_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can place bets"
  ON bets FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    session_id IN (
      SELECT id FROM betting_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own bets"
  ON bets FOR UPDATE
  USING (
    auth.uid() = user_id OR
    session_id IN (
      SELECT id FROM betting_sessions WHERE user_id = auth.uid()
    )
  );
