# RDCM Poker Platform - Architecture Documentation

Complete technical architecture of the poker platform.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser (Client)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               React Application                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │   │
│  │  │PokerGame│ │Leaderboard│ │Tournament│            │   │
│  │  └──────────┘ └──────────┘ └──────────┘            │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │ HTTPS / REST / Realtime          │
└─────────────────────────┼──────────────────────────────────┘
                          │
                    ┌─────▼─────┐
                    │  Vercel   │
                    │(CDN + Edge)│
                    └─────┬─────┘
                          │
                    ┌─────▼──────────┐
                    │  Supabase API  │
                    │ (PostgreSQL +  │
                    │  Auth)         │
                    └─────┬──────────┘
                          │
┌─────────────────────────▼──────────────────────────────────┐
│              Supabase Infrastructure                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ ┌──────────┐   │
│  │PostgreSQL│  │Auth      │  │Realtime  │ │Storage   │   │
│  │Database  │  │Service   │  │Engine    │ │Service   │   │
│  └──────────┘  └──────────┘  └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework:** React 18.x
- **State Management:** React Context API
- **Styling:** CSS3 with responsive design
- **HTTP Client:** Supabase JS Client
- **Build Tool:** Create React App

### Backend
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth (JWT-based)
- **API Layer:** Supabase REST API
- **Realtime:** Supabase Realtime subscriptions
- **Hosting:** Vercel (Serverless)

### Infrastructure
- **Frontend Hosting:** Vercel (CDN + Edge Functions)
- **Backend Hosting:** Supabase (Managed PostgreSQL)
- **Version Control:** GitHub
- **CI/CD:** GitHub Actions + Vercel

---

## Component Architecture

### Core Components

```
App
├── AuthModal
│   ├── SignUpForm
│   └── SignInForm
├── PokerGame
│   ├── PokerTable
│   │   ├── PlayerSeats
│   │   ├── GameLog
│   │   └── Controls
│   └── GameState
├── Leaderboard
│   ├── SortControls
│   └── PlayerTable
├── TournamentMode
│   ├── CreateForm
│   └── TournamentCards
└── PlayerStats
    ├── StatCards
    ├── DetailedStats
    └── GameHistory
```

### Context Providers

**AuthContext**
```javascript
{
  user,           // Current authenticated user
  playerData,     // Player stats from database
  loading,        // Auth loading state
  signUp(),       // Create new account
  signIn(),       // Authenticate user
  signOut()       // End session
}
```

**GameContext** (planned)
```javascript
{
  gameState,      // Current hand state
  players,        // Players in game
  pot,            // Current pot
  actions,        // Game actions
  startGame(),    // Begin hand
  placeBet(),     // Place bet
  evaluateWinner() // Determine winner
}
```

---

## Data Flow

### Authentication Flow

```
User Input
    ↓
[AuthModal] → signUp/signIn()
    ↓
[Supabase Auth] → JWT Token
    ↓
[AuthContext] → Store session
    ↓
[Protected Routes] → Access granted
```

### Game Flow

```
[PokerGame Component]
    ↓
startHand()
    ↓
generateRandomHand() → Deal cards
    ↓
[Display Cards & Controls]
    ↓
User places bet
    ↓
placeBet() → Update pot
    ↓
evaluateWinner() → Calculate results
    ↓
updateDatabase() → Save to game_history
    ↓
updateBalance() → Update player balance
    ↓
[Display Results & Continue]
```

### Leaderboard Update Flow

```
[Component mounts]
    ↓
fetchLeaderboard()
    ↓
[Supabase] SELECT players ORDER BY total_profit
    ↓
[Calculate] win_rate, rank
    ↓
setPlayers(rankedPlayers)
    ↓
[Render] Leaderboard table
    ↓
[Subscribe] to real-time updates
    ↓
[Auto-refresh] when data changes
```

---

## Database Schema

### Players Table
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE (references auth.users),
  username TEXT UNIQUE,
  balance INTEGER,
  total_wins INTEGER,
  total_hands INTEGER,
  total_profit INTEGER,
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Indexes:**
- `user_id` - Fast profile lookups
- `total_profit` - Fast leaderboard sorting
- `created_at` - Time-based queries

### Game Sessions Table
```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE,
  host_id UUID (references auth.users),
  status TEXT,
  buy_in INTEGER,
  max_players INTEGER,
  current_players INTEGER,
  pot INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Game Players Table
```sql
CREATE TABLE game_players (
  id UUID PRIMARY KEY,
  session_id UUID (references game_sessions),
  user_id UUID (references auth.users),
  player_name TEXT,
  is_ai BOOLEAN,
  balance INTEGER,
  current_bet INTEGER,
  hand_rank TEXT,
  position INTEGER,
  profit INTEGER,
  joined_at TIMESTAMP
);
```

### Game History Table
```sql
CREATE TABLE game_history (
  id UUID PRIMARY KEY,
  session_id UUID (references game_sessions),
  user_id UUID (references auth.users),
  hand_rank TEXT,
  result TEXT,
  amount_won INTEGER,
  amount_lost INTEGER,
  played_at TIMESTAMP
);
```

### Tournaments Table
```sql
CREATE TABLE tournaments (
  id UUID PRIMARY KEY,
  name TEXT,
  host_id UUID (references auth.users),
  buy_in INTEGER,
  max_players INTEGER,
  current_players INTEGER,
  status TEXT,
  prize_structure JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## API Endpoints

### Authentication
```
POST   /auth/signup
POST   /auth/signin
POST   /auth/signout
```

### Players
```
GET    /rest/v1/players/{id}
PUT    /rest/v1/players/{id}
```

### Game Sessions
```
POST   /rest/v1/game_sessions
GET    /rest/v1/game_sessions
GET    /rest/v1/game_sessions/{id}
```

### Game Players
```
POST   /rest/v1/game_players
GET    /rest/v1/game_players
```

### Game History
```
POST   /rest/v1/game_history
GET    /rest/v1/game_history?user_id=...
```

---

## State Management Strategy

### Client-Side State

```
React Component Level
├── useState() for local UI state
│   ├── formInput
│   ├── isLoading
│   └── selectedTab
│
├── useContext() for global state
│   ├── AuthContext (user, session)
│   └── GameContext (current game)
│
└── useEffect() for side effects
    ├── Fetch data from Supabase
    ├── Subscribe to real-time updates
    └── Clean up subscriptions
```

### Database State

```
Players Table (source of truth)
├── balance (current chips)
├── total_profit (lifetime profit)
└── statistics (wins, hands, etc.)

Game History Table (audit log)
├── Every hand played
├── Result (win/loss)
└── Amount change
```

---

## Authentication & Security

### JWT Token Flow

```
User Login
    ↓
[Supabase Auth] → Issue JWT
    ↓
[LocalStorage] → Store token
    ↓
[API Requests] → Include JWT header
    ↓
[Supabase] → Verify token
    ↓
[RLS Policies] → Enforce row access
    ↓
[Return Data] → Only accessible rows
```

### Row Level Security (RLS)

```sql
-- Players can only see their own profile
CREATE POLICY "user_own_profile"
ON players FOR SELECT
USING (auth.uid() = user_id);

-- Players can only update their own balance
CREATE POLICY "user_own_balance"
ON players FOR UPDATE
USING (auth.uid() = user_id);

-- Players can only read their game history
CREATE POLICY "user_own_history"
ON game_history FOR SELECT
USING (auth.uid() = user_id);
```

---

## Performance Optimization

### Database Optimization

1. **Indexing Strategy**
   ```sql
   -- Fast lookups
   CREATE INDEX idx_players_user_id ON players(user_id);
   
   -- Fast sorting (for leaderboard)
   CREATE INDEX idx_players_profit ON players(total_profit DESC);
   
   -- Fast filtering
   CREATE INDEX idx_game_history_user ON game_history(user_id, played_at DESC);
   ```

2. **Query Optimization**
   - Select only needed columns
   - Use LIMIT for pagination
   - Use covering indexes

3. **Caching Strategy**
   - Cache leaderboard in browser (refresh every 30s)
   - Cache player stats (refresh on update)
   - Use localStorage for non-sensitive data

### Frontend Optimization

1. **Code Splitting**
   ```javascript
   const Leaderboard = React.lazy(() => import('./Leaderboard'));
   ```

2. **Memoization**
   ```javascript
   const PlayerCard = React.memo(function PlayerCard({ player }) {
     return <div>{player.name}</div>;
   });
   ```

3. **Debouncing**
   ```javascript
   const debouncedSearch = debounce(searchPlayers, 300);
   ```

---

## Scaling Considerations

### Current Capacity

**Supabase Free Tier:**
- 500 MB storage
- 2M API calls/month (~65K/day)
- Supports 10,000+ concurrent users

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited deployments
- 100 serverless function hours/month

### Growth Path

```
Development → Staging → Production
  (Free)       (Free)      (Free Tier)
                             ↓
                        +1000 users
                             ↓
                        Upgrade Supabase Pro
                             ↓
                        +10,000 users
                             ↓
                        Upgrade Vercel Pro
                             ↓
                        +100,000 users
                             ↓
                        Consider custom infra
                        (Docker, Kubernetes, etc.)
```

### Scalability Improvements

1. **Database**
   - Add read replicas for scale
   - Implement connection pooling
   - Add caching layer (Redis)

2. **API**
   - Use GraphQL for efficient queries
   - Add API rate limiting
   - Implement webhook queue

3. **Frontend**
   - Implement Service Worker for offline
   - Use WebSocket for real-time (vs polling)
   - Add analytics and monitoring

---

## Development Workflow

### Local Development

```bash
# Setup
git clone repo
npm install
cp .env.local.example .env.local
# Add Supabase credentials

# Run
npm start

# Test
npm run test

# Build
npm run build
```

### Branching Strategy

```
main (production)
├── develop (staging)
├── feature/leaderboard
├── feature/tournaments
└── bugfix/fix-betting

# Merge flow:
feature → develop → main → Vercel deploys
```

### Deployment Pipeline

```
1. Push to main
        ↓
2. GitHub Actions runs tests
        ↓
3. Tests pass
        ↓
4. Vercel builds project
        ↓
5. Vercel deploys to production
        ↓
6. Analytics & monitoring active
```

---

## Monitoring & Observability

### Key Metrics

1. **User Metrics**
   - Active users (daily/monthly)
   - New sign-ups
   - User retention
   - Session duration

2. **Performance Metrics**
   - Page load time
   - API response time
   - Error rate
   - Database query time

3. **Business Metrics**
   - Total hands played
   - Total profit/loss
   - Average session length
   - Most played hours

### Monitoring Tools

- **Vercel Analytics** - Page performance
- **Supabase Logs** - Database activity
- **Browser Console** - Runtime errors
- **GitHub Actions** - CI/CD status

---

## Roadmap

### Phase 1 (Current)
- [x] Single-table poker game
- [x] 5 AI opponents
- [x] Player authentication
- [x] Balance tracking
- [x] Leaderboard
- [ ] Tournament system

### Phase 2 (Next)
- [ ] Multi-table support
- [ ] Real multiplayer (WebSocket)
- [ ] Better hand evaluation
- [ ] Player profiles
- [ ] Chat/messaging
- [ ] Achievements system

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] Live streaming integration
- [ ] Spectator mode
- [ ] Advanced analytics
- [ ] AI improvements
- [ ] Replay system

---

## Appendix: Code Examples

### Making an Authenticated Request

```javascript
// In a React component
import { supabase } from '../utils/supabaseClient';

async function getPlayerData() {
  const { data: { session } } = await supabase.auth.getSession();
  
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('user_id', session.user.id)
    .single();
  
  if (error) console.error('Error:', error);
  return data;
}
```

### Real-time Subscription

```javascript
useEffect(() => {
  // Subscribe to changes
  const subscription = supabase
    .from('players')
    .on('UPDATE', payload => {
      console.log('Player updated:', payload);
      // Update state
    })
    .subscribe();
  
  // Cleanup
  return () => subscription.unsubscribe();
}, []);
```

### Complex Query with Joins

```sql
-- Get player's game history with hand rankings
SELECT 
  gh.id,
  gh.hand_rank,
  gh.result,
  gh.amount_won,
  gh.amount_lost,
  gs.buy_in,
  gs.created_at
FROM game_history gh
JOIN game_sessions gs ON gh.session_id = gs.id
WHERE gh.user_id = auth.uid()
ORDER BY gh.played_at DESC
LIMIT 50;
```

---

For questions about architecture, see:
- DEPLOYMENT_GUIDE.md - How to deploy
- API_DOCUMENTATION.md - API reference
- TROUBLESHOOTING.md - Common issues
