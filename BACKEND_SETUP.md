# 🤖 RDCM Poker Backend Setup - Free & Easy

Complete guide to setting up the bot backend for free using Vercel + Supabase.

---

## ⚡ Quick Start (5 minutes)

### 1. Create Environment File
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Set Up Supabase Database
Go to your [Supabase Dashboard](https://app.supabase.com):
- New Project (free tier)
- Copy the URL and keys above

### 3. Run Database Migration
- Open Supabase SQL Editor
- Paste entire contents of `supabase/migrations/create_bot_tables.sql`
- Click "RUN"
- ✅ All tables created!

### 4. Deploy to Vercel
```bash
git add .
git commit -m "Add free bot backend"
git push
```

Vercel auto-deploys. Your API endpoints are now live:
```
https://your-vercel-domain.vercel.app/api/bots/decision
https://your-vercel-domain.vercel.app/api/coaching/advice
https://your-vercel-domain.vercel.app/api/games/save
```

---

## 📊 What You Get (Free)

| Feature | Free Tier Limit | Status |
|---------|-----------------|--------|
| **Vercel API Routes** | 10GB/month | ✅ Included |
| **Supabase Database** | 500MB | ✅ Included |
| **Realtime Updates** | 2 Channels | ✅ Included |
| **Auth** | 50,000 users | ✅ Included |
| **Monthly Requests** | Unlimited | ✅ Included |

---

## 🔌 API Endpoints

### Get Bot Decision
```
GET /api/bots/decision?handRank=8&position=late&potSize=500&opponents=3&botLevel=2&botName=ProBot

Response:
{
  "action": "RAISE",
  "confidence": 92,
  "reason": "Strong hand (8/10) with late position advantage",
  "suggestion": "🎯 PUSH with this hand. Build the pot aggressively."
}
```

### Get Coaching Advice
```
GET /api/coaching/advice?handRank=7&position=late&potSize=500&opponents=2&phase=playing

Response:
{
  "strength": 70,
  "tips": [
    "💪 Strong hand detected. Consider raising to build the pot.",
    "🎯 You have position advantage! Use it to control the pot."
  ],
  "recommendedAction": "🎯 PUSH with your strong hand. Build the pot aggressively.",
  "feedback": null,
  "stats": { "pot": 500, "opponents": 2, "position": "late", "phase": "playing" }
}
```

### Save Game Results
```
POST /api/games/save

Body:
{
  "userId": "user-uuid",
  "playerName": "RDCM",
  "buyIn": 100,
  "finalStack": 500,
  "profit": 400,
  "duration": 1800,
  "handsPlayed": 12,
  "bots": ["ProBot", "SharpBot"],
  "winner": "RDCM",
  "coachingEnabled": true,
  "difficulty": "sharp"
}

Response:
{
  "success": true,
  "gameId": 123,
  "message": "Game saved successfully"
}
```

---

## 📱 Frontend Integration

### Call Bot Decision
```javascript
// src/components/PokerGame.jsx

async function getBotDecision(botName, botLevel, handRank, position, pot, opponents) {
  const response = await fetch(
    `/api/bots/decision?handRank=${handRank}&position=${position}&potSize=${pot}&opponents=${opponents}&botLevel=${botLevel}&botName=${botName}`
  );
  const data = await response.json();
  return data;
}
```

### Call Coaching
```javascript
// src/components/CoachingPanel.jsx

async function getCoachingAdvice(handRank, position, pot, opponents, phase) {
  const response = await fetch(
    `/api/coaching/advice?handRank=${handRank}&position=${position}&potSize=${pot}&opponents=${opponents}&phase=${phase}`
  );
  const data = await response.json();
  return data;
}
```

### Save Game
```javascript
// src/components/PokerGame.jsx

async function saveGameResults(gameData) {
  const response = await fetch('/api/games/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameData)
  });
  return response.json();
}
```

---

## 🗄️ Database Schema

### games
Stores every game played
- `user_id` - Player identifier
- `buy_in` - Starting chips
- `profit` - Chips won/lost
- `bots_played` - Array of bot names
- `difficulty` - Level (fish/casual/sharp/pro)

### player_stats
Aggregate player statistics
- `total_games` - Games played
- `win_rate` - Percentage of wins
- `total_profit` - Total chips won
- `last_played` - Last game timestamp

### bot_decisions
Analytics on bot decisions
- `bot_name` - Which bot
- `hand_rank` - Hand strength 1-10
- `decision` - Action taken (RAISE/CALL/FOLD)
- `confidence` - Confidence 0-100%

### hand_history
Detailed hand records
- `game_id` - Reference to game
- `player_hand` - What player had
- `player_action` - What player did
- `bot_actions` - What bots did
- `winner` - Who won hand

### bot_profiles
Pre-configured bot personalities
- FishBot (Level 1, 30% win rate)
- BalancedAI (Level 2, 60% win rate)
- SharpBot (Level 3, 75% win rate)
- ProBot (Level 3, 80% win rate)

### coaching_sessions
Track coaching interactions
- `advice_given` - What advice was given
- `accuracy` - How accurate (optional)
- `user_feedback` - Player feedback

### teaching_content
Academy materials
- Hand rankings with examples
- Poker concepts with explanations
- Strategy guides

---

## 🚀 Local Development

### Start Local Server
```bash
npm run dev
```

Test endpoints locally:
```
http://localhost:3000/api/bots/decision?handRank=8&position=late&potSize=500&opponents=3&botLevel=2
```

---

## 🔐 Security

✅ **Row Level Security (RLS)** enabled
- Players only see their own games
- Authentication required for writes
- Service role key only for backend

✅ **Environment variables** protected
- `SUPABASE_SERVICE_ROLE_KEY` never sent to frontend
- Only ANON_KEY exposed in frontend
- Vercel secrets protected

---

## 💾 Data Privacy

All data stored in your Supabase project:
- Game history private to player
- Stats calculated server-side
- No third-party data sharing

---

## 📈 Monitoring

Check your bot performance:

### See All Games
```sql
SELECT * FROM games ORDER BY created_at DESC LIMIT 10;
```

### See Win Rates
```sql
SELECT player_name, total_games, wins, win_rate 
FROM player_stats 
ORDER BY win_rate DESC;
```

### See Bot Stats
```sql
SELECT bot_name, COUNT(*) as decisions, AVG(confidence) as avg_confidence
FROM bot_decisions
GROUP BY bot_name;
```

---

## ❓ Troubleshooting

### "API endpoint not found"
- Check `.env.local` is in root directory
- Restart dev server: `npm run dev`
- Verify Vercel deployment succeeded

### "Supabase connection error"
- Check SUPABASE_URL is correct (include https://)
- Verify service role key is valid
- Check database migration ran successfully

### "CORS error"
- Vercel handles CORS automatically
- No additional config needed
- Works on production deployment

---

## 🎯 What's Next

1. ✅ Backend API running
2. ✅ Database configured
3. ✅ Bots making decisions
4. 📱 **Next: Update frontend to use API**
5. 🎮 **Then: Test full game flow**
6. 🚀 **Finally: Deploy to production**

---

## 📚 Files Created

```
backend/
├── api/
│   ├── bots/
│   │   └── decision.js          ← Bot decision logic
│   ├── coaching/
│   │   └── advice.js            ← Coaching advice
│   └── games/
│       └── save.js              ← Save game results
│
supabase/
└── migrations/
    └── create_bot_tables.sql    ← Database schema

.env.example                      ← Environment template
BACKEND_SETUP.md                  ← This file
```

---

## 🎉 Success!

Your bot backend is now:
- ✅ Deployed (Vercel free tier)
- ✅ Scalable (serverless functions)
- ✅ Secure (Supabase RLS)
- ✅ Fast (API routes)
- ✅ Free (no costs)

Start using the API endpoints in your frontend!

---

**RDCM Nation Bot Backend**  
*Free • Fast • Scalable*
