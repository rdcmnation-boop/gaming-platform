# ⚡ Quick Deploy - Betting Bot Activation

**Time needed: 2 minutes**

## Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Click your project: `nfmkeqjfhiqhppmjxwmv`
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**

## Step 2: Copy & Paste SQL

Copy EVERYTHING below (all SQL statements):

```sql
-- Additional Betting Bot Tables for API Integration

-- Betting strategies (user's bot configuration)
CREATE TABLE IF NOT EXISTS betting_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy VARCHAR(50) NOT NULL DEFAULT 'value',
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
```

## Step 3: Run SQL

1. Paste SQL into Supabase SQL editor
2. Click **RUN** button (top right)
3. Wait for ✅ Success message

## Step 4: Deploy Frontend

```bash
cd /home/claude/gaming-platform
npm run build
# Deploy to Vercel (auto from GitHub)
```

## Step 5: Test It Works

1. Open your app: `https://gaming-platform-ashen.vercel.app`
2. Click "🤖 Betting Bot" tab
3. Go to Settings tab
4. Configure strategy
5. Click "Analyze Games"

---

## ✅ What You Have Now

**Backend**
- 5 API endpoints (analyze, execute, active, history, strategy)
- Complete database schema with RLS
- Autonomous betting bot with 4 strategies

**Frontend**
- Full dashboard with 4 tabs
- Real-time opportunities display
- Active bet tracking
- Performance analytics
- Strategy configuration

**Ready for**
- Sports API integration (ESPN, Sleeper, TheOddsAPI)
- Live game data
- Autonomous betting mode
- Multi-sport support

---

## 🎯 Next Steps

1. ✅ Run SQL migration above
2. ✅ Deploy to Vercel (auto-deploys on git push)
3. 📊 Connect sports API for real game data
4. 🚀 Users can start analyzing and placing bets

**Your betting bot is live!**
