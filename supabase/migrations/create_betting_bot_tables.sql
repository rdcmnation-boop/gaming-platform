-- Betting Bot Tables

-- Betting sessions (user's bot configuration and session tracking)
CREATE TABLE betting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_name VARCHAR(255) NOT NULL,
  strategy VARCHAR(50) NOT NULL DEFAULT 'value', -- kelly, value, aggressive, conservative
  initial_bankroll DECIMAL(12, 2) NOT NULL,
  current_bankroll DECIMAL(12, 2) NOT NULL,
  profit_target DECIMAL(5, 2) NOT NULL DEFAULT 0.10, -- 10% profit goal
  loss_limit DECIMAL(5, 2) NOT NULL DEFAULT 0.20, -- Stop if down 20%
  max_risk_per_bet DECIMAL(5, 2) NOT NULL DEFAULT 0.05, -- 5% per bet
  total_bets INT DEFAULT 0,
  win_bets INT DEFAULT 0,
  lose_bets INT DEFAULT 0,
  total_profit DECIMAL(12, 2) DEFAULT 0,
  win_rate DECIMAL(5, 4) DEFAULT 0,
  roi DECIMAL(5, 4) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- active, paused, completed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX(user_id, status),
  INDEX(created_at)
);

-- Betting opportunities (analyzed games/events)
CREATE TABLE betting_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES betting_sessions(id) ON DELETE CASCADE,
  event_id VARCHAR(255) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  event_date TIMESTAMP NOT NULL,
  sport VARCHAR(50) NOT NULL, -- nfl, nba, nhl, mlb, soccer, tennis, etc
  bet_type VARCHAR(50) NOT NULL, -- moneyline, spread, total, parlay
  team_or_player VARCHAR(255),
  odds DECIMAL(6, 2) NOT NULL,
  probability DECIMAL(5, 4) NOT NULL,
  expected_value DECIMAL(5, 4) NOT NULL,
  confidence INT DEFAULT 0, -- 0-100
  value_edge DECIMAL(5, 4) NOT NULL, -- odds * probability - 1
  bot_recommendation VARCHAR(50), -- BET, SKIP, WAIT
  analyzed_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  INDEX(session_id, analyzed_at),
  INDEX(event_date),
  INDEX(bot_recommendation)
);

-- Placed bets
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES betting_sessions(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES betting_opportunities(id),
  event_id VARCHAR(255) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  sport VARCHAR(50) NOT NULL,
  bet_type VARCHAR(50) NOT NULL,
  team_or_player VARCHAR(255),
  odds DECIMAL(6, 2) NOT NULL,
  probability DECIMAL(5, 4) NOT NULL,
  bet_amount DECIMAL(12, 2) NOT NULL,
  potential_win DECIMAL(12, 2) NOT NULL, -- odds * bet_amount
  expected_value DECIMAL(5, 4),
  confidence INT,
  strategy_used VARCHAR(50), -- kelly, value, aggressive, conservative
  bankroll_before DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, won, lost, push, cancelled
  result_amount DECIMAL(12, 2), -- actual win/loss amount
  event_result VARCHAR(255), -- description of how it resolved
  placed_at TIMESTAMP DEFAULT NOW(),
  settled_at TIMESTAMP,
  INDEX(session_id, status),
  INDEX(placed_at),
  INDEX(settled_at)
);

-- Parlay bets (multi-leg bets)
CREATE TABLE parlay_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES betting_sessions(id) ON DELETE CASCADE,
  parlay_name VARCHAR(255),
  combined_odds DECIMAL(8, 3) NOT NULL,
  combined_probability DECIMAL(5, 4) NOT NULL,
  bet_amount DECIMAL(12, 2) NOT NULL,
  potential_win DECIMAL(12, 2) NOT NULL,
  expected_value DECIMAL(5, 4),
  leg_count INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, won, lost, partial
  placed_at TIMESTAMP DEFAULT NOW(),
  settled_at TIMESTAMP,
  INDEX(session_id, status)
);

-- Parlay legs (individual bets in a parlay)
CREATE TABLE parlay_legs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parlay_id UUID NOT NULL REFERENCES parlay_bets(id) ON DELETE CASCADE,
  bet_id UUID REFERENCES bets(id),
  event_id VARCHAR(255) NOT NULL,
  event_name VARCHAR(255),
  odds DECIMAL(6, 2) NOT NULL,
  leg_number INT NOT NULL,
  status VARCHAR(50), -- won, lost, pending
  INDEX(parlay_id)
);

-- Performance metrics (summary stats per day/week)
CREATE TABLE bot_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES betting_sessions(id) ON DELETE CASCADE,
  period_date DATE NOT NULL,
  period_type VARCHAR(20), -- daily, weekly, monthly
  bets_placed INT DEFAULT 0,
  bets_won INT DEFAULT 0,
  bets_lost INT DEFAULT 0,
  win_rate DECIMAL(5, 4),
  total_staked DECIMAL(12, 2),
  total_returned DECIMAL(12, 2),
  daily_profit DECIMAL(12, 2),
  roi DECIMAL(5, 4),
  avg_confidence INT,
  INDEX(session_id, period_date),
  UNIQUE(session_id, period_date, period_type)
);

-- Row Level Security Policies
ALTER TABLE betting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE betting_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE parlay_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE parlay_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_performance ENABLE ROW LEVEL SECURITY;

-- Users can only see their own betting sessions
CREATE POLICY "Users can view own betting sessions"
  ON betting_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create betting sessions"
  ON betting_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own betting sessions"
  ON betting_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can view opportunities for their sessions
CREATE POLICY "Users can view own opportunities"
  ON betting_opportunities FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM betting_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert opportunities for own sessions"
  ON betting_opportunities FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM betting_sessions WHERE user_id = auth.uid()
    )
  );

-- Users can view bets for their sessions
CREATE POLICY "Users can view own bets"
  ON bets FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM betting_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can place bets for own sessions"
  ON bets FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM betting_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own bets"
  ON bets FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM betting_sessions WHERE user_id = auth.uid()
    )
  );

-- Similar policies for parlay bets and performance
CREATE POLICY "Users can view own parlay bets"
  ON parlay_bets FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM betting_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can place parlay bets for own sessions"
  ON parlay_bets FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM betting_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own performance"
  ON bot_performance FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM betting_sessions WHERE user_id = auth.uid()
    )
  );
