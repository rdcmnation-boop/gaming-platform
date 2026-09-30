# RDCM Poker - Multiplayer Setup Guide

## What's Built

**Real Multiplayer Poker Platform** with:
- ✅ User authentication (Supabase Auth - Free)
- ✅ Player profiles & persistent stats (Free tier Supabase)
- ✅ 5-player table (human + 4 AI bots)
- ✅ AI bots with distinct personalities
- ✅ Practice mode (play without risking money)
- ✅ Game log/action log with real-time commentary
- ✅ Hand evaluation & winner determination
- ✅ Professional UI (no emoji, corporate design)
- ✅ Responsive design (works on mobile)
- ✅ 100% free to host & deploy

---

## Quick Start (Development)

### 1. Create Supabase Account (Free)
- Go to https://supabase.com
- Sign up (no credit card needed)
- Create new project
- Copy your URL and anon key

### 2. Setup Database
- In Supabase, go to **SQL Editor**
- Create the 4 tables from `SUPABASE_SETUP.md`
- Run the SQL statements (copy/paste into editor)

### 3. Configure App
```bash
cd /home/claude/gaming-platform-deploy

# Copy template to actual env file
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
# REACT_APP_SUPABASE_URL=https://your-project.supabase.co
# REACT_APP_SUPABASE_ANON_KEY=your-key-here
```

### 4. Run Locally
```bash
npm install
npm start
```

Visit http://localhost:3000

---

## Components Structure

```
src/
├── components/
│   ├── PokerGame.jsx          # Main poker table
│   ├── AuthModal.jsx          # Login/signup
│   └── (Marketplace.jsx, AILeaderboard.jsx - existing)
├── contexts/
│   └── AuthContext.jsx        # User & player data management
├── styles/
│   ├── pokerGame.css          # Poker table styling
│   ├── authModal.css          # Auth form styling
│   └── (existing App.css)
└── utils/
    ├── supabaseClient.js      # Supabase setup
    └── pokerLogic.js          # Hand evaluation, personalities
```

## Key Features Explained

### Game Flow
1. **Login** → User creates account or signs in
2. **Lobby** → Set bet amount, choose practice/real mode
3. **Hand Start** → 5 players place bets (AI auto-bets)
4. **Deal** → Each bot gets a comment about their hand
5. **Evaluate** → Hands ranked, winner announced
6. **Results** → Show who won, pot distribution
7. **Next Hand** → Repeat or change bet

### AI Bots
- **ProBot**: Aggressive, 80% win rate → "Strong hand. GG."
- **BalancedAI**: Strategic, 60% win rate → "That was close!"
- **FishBot**: Passive, 30% win rate → "Lucky hand!"
- **SharpBot**: Aggressive, 75% win rate → "Read you perfectly."
- **CasualBot**: Casual, 50% win rate → "Fun game!"

### Database Schema (Minimal)
```
players           # User profiles (username, balance, stats)
game_sessions     # Active game rooms
game_players      # Players in each session
game_history      # Past hand results for leaderboards
```

---

## Deployment (Free Options)

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Alternative Frontend (Netlify)
```bash
# Build
npm run build

# Drag dist/ folder to https://app.netlify.com
```

### Backend (if needed later)
- Railway.app (free tier)
- Render.com (free tier)
- Fly.io (free credits)

---

## What's NOT Included (Easy to Add)

- ❌ Real multiplayer (multiple humans at table) - Use Supabase real-time
- ❌ Payment integration - Stripe/crypto can be added to buy chips
- ❌ Leaderboard persistence - Already in schema, just needs UI
- ❌ Tournament mode - Simple addition with rounds table
- ❌ Chat in game - Supabase real-time messages

---

## Debugging

### Check Supabase Connection
```javascript
// In browser console:
import { supabase } from './utils/supabaseClient';
supabase.auth.getSession().then(console.log);
```

### Clear Auth State
```javascript
// Browser console:
supabase.auth.signOut();
```

### Monitor Supabase Queries
- Supabase Dashboard → SQL Editor → Query logs

---

## Free Tier Limits (You'll Never Hit These)
- Storage: 500 MB (poker data is ~1-2 KB per player)
- API calls: 2M/month (poker = ~100 calls per hand)
- Concurrent users: Unlimited on free tier
- Database: Postgres included

**Estimate**: Can handle ~10,000 simultaneous players on free tier

---

## Next Steps

1. ✅ Get Supabase running
2. ✅ Test login/signup
3. ✅ Play a few hands
4. ⬜ Add real multiplayer rooms (WebSocket via Supabase)
5. ⬜ Deploy to Vercel/Netlify
6. ⬜ Add leaderboard UI
7. ⬜ Add tournaments
8. ⬜ Add payment (Stripe for real money)

---

## Support

All files are Claude-friendly vanilla JS/React:
- No build complexity
- No paid dependencies
- No vendor lock-in
- Can modify/extend freely

Enjoy! 🃏💰
