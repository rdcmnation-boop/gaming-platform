# Supabase Setup for RDCM Poker

## Free Tier
- 500 MB storage (plenty for player data)
- 2M monthly API calls
- Real-time subscriptions included
- No credit card required

## Required Tables

### 1. users (Auto-created by Supabase Auth)
```sql
-- Already managed by Supabase Auth
-- id, email, created_at, etc.
```

### 2. players
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  balance INTEGER DEFAULT 10000,
  total_wins INTEGER DEFAULT 0,
  total_hands INTEGER DEFAULT 0,
  total_profit INTEGER DEFAULT 0,
  last_played_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. game_sessions
```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'waiting', -- waiting, playing, finished
  buy_in INTEGER NOT NULL,
  max_players INTEGER DEFAULT 6,
  current_players INTEGER DEFAULT 1,
  pot INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. game_players
```sql
CREATE TABLE game_players (
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
```

### 5. game_history
```sql
CREATE TABLE game_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hand_rank TEXT,
  result TEXT, -- 'win', 'loss', 'fold'
  amount_won INTEGER DEFAULT 0,
  amount_lost INTEGER DEFAULT 0,
  played_at TIMESTAMP DEFAULT NOW()
);
```

## Setup Steps

1. Create Supabase project (free tier)
2. Go to SQL Editor in Supabase dashboard
3. Run the above CREATE TABLE statements
4. Enable Row Level Security (RLS) for security
5. Copy your project URL and anon key
6. Add to `.env.local`:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## RLS Policies (Simple Version)
- Allow users to read/update only their own player data
- Allow all authenticated users to read game sessions
- Game state updates only from game host
