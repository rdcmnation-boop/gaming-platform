# 🤖 AI Betting Bot Setup Guide

## Overview
The AI Betting Bot is an autonomous system that analyzes sports opportunities and makes intelligent betting decisions based on expected value (EV), confidence scores, and bankroll management strategies.

## Features
- **Multiple Strategies**: Kelly Criterion, Value-Based, Aggressive, Conservative
- **Real-time Analysis**: Analyzes games and finds +EV opportunities
- **Smart Bet Sizing**: Calculates optimal bet sizes based on strategy
- **Performance Tracking**: Win rates, ROI, and detailed bet history
- **Risk Management**: Profit targets, loss limits, position sizing

---

## 1. Database Setup

### Run Migration
1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy contents from `supabase/migrations/add_betting_api_tables.sql`
4. Paste into Supabase SQL editor
5. Click **RUN**

Tables created:
- `betting_strategies` - User bot configuration
- `betting_analysis` - Analysis logs
- `bets` - Individual placed bets
- `parlay_bets` - Multi-leg bets
- `bot_performance` - Summary statistics

---

## 2. API Endpoints

### Analyze Opportunities
```bash
POST /api/bets/analyze
Content-Type: application/json

{
  "userId": "user-id",
  "games": [
    {
      "id": "game1",
      "homeTeam": { "name": "Team A", "winRate": 0.65, "ppg": 28 },
      "awayTeam": { "name": "Team B", "winRate": 0.60, "ppg": 27 },
      "homeOdds": 1.95,
      "awayOdds": 1.91,
      "matchTime": "2024-10-05T20:00:00Z"
    }
  ],
  "strategy": "value",
  "bankroll": 10000
}
```

Response:
```json
{
  "status": "success",
  "bankroll": 10000,
  "strategy": "value",
  "recommendations": [
    {
      "gameId": "game1",
      "team": "home",
      "odds": 1.95,
      "probability": 0.68,
      "confidence": 85,
      "recommendedBetSize": 250,
      "expectedValue": 0.156,
      "expectedProfit": 39.00,
      "reason": "High confidence play - Strong bet"
    }
  ],
  "summary": {
    "total_opportunities": 1,
    "high_confidence_plays": 1,
    "total_ev": 0.156,
    "recommended_total_bet": 250
  }
}
```

### Execute Bet
```bash
POST /api/bets/execute
Content-Type: application/json

{
  "userId": "user-id",
  "betAmount": 250,
  "odds": 1.95,
  "team": "home",
  "gameId": "game1",
  "homeTeam": "Team A",
  "awayTeam": "Team B",
  "matchTime": "2024-10-05T20:00:00Z",
  "confidence": 85,
  "expectedValue": 0.156
}
```

### Get Active Bets
```bash
GET /api/bets/active?userId=user-id
```

Response:
```json
{
  "status": "success",
  "activeBets": [
    {
      "id": "bet-id",
      "team": "home",
      "betAmount": 250,
      "odds": 1.95,
      "potentialWin": 237.50,
      "confidence": 85,
      "status": "active"
    }
  ],
  "summary": {
    "activeBetsCount": 1,
    "totalBetAmount": 250,
    "totalPotentialWin": 237.50,
    "averageConfidence": 85,
    "totalExpectedValue": 0.16
  }
}
```

### Get Bet History
```bash
GET /api/bets/history?userId=user-id&limit=50&offset=0
```

### Get/Update Strategy
```bash
GET /api/bets/strategy?userId=user-id

POST /api/bets/strategy
Content-Type: application/json

{
  "userId": "user-id",
  "strategy": "value",
  "bankroll": 10000,
  "max_risk_per_bet": 0.05,
  "profit_target": 0.10,
  "loss_limit": 0.20,
  "auto_mode": false
}
```

---

## 3. Frontend Integration

### Import Dashboard
```javascript
import BettingBotDashboard from '@/components/BettingBotDashboard';

export default function Page() {
  return <BettingBotDashboard />;
}
```

### Dashboard Features
- **Opportunities Tab**: View AI recommendations with EV analysis
- **Active Bets Tab**: Track live bets and potential payouts
- **History Tab**: Review past bets and performance metrics
- **Settings Tab**: Configure strategy, bankroll, risk parameters

---

## 4. Betting Strategies

### Kelly Criterion
Formula: `f = (bp - q) / b`
- **Best for**: Mathematically optimal sizing
- **Risk**: Can be aggressive on losing streaks
- **Implementation**: Uses 25% fractional Kelly for stability

### Value-Based
- **Logic**: Bet more on high-probability, low-risk bets
- **Formula**: `betSize = maxBet * (valueEdge / 0.5)`
- **Best for**: Conservative players who want consistent returns

### Aggressive
- **Risk**: 5% of bankroll per bet (maximum)
- **Best for**: Experienced players with high confidence
- **Downside**: Can deplete bankroll quickly on losing streaks

### Conservative
- **Risk**: 2% of bankroll per bet
- **Best for**: Risk-averse players
- **Advantage**: Slow, steady bankroll growth

---

## 5. Performance Metrics

### Key Statistics
- **Win Rate**: Percentage of winning bets
- **ROI**: Return on Investment (profit / total wagered)
- **High Confidence Win Rate**: Win rate on bets with 75%+ confidence
- **Expected Value**: Sum of all EV calculations
- **Net Profit**: Total winnings - total losses

### Confidence Score (0-100)
Calculated from:
- Probability deviation from 50% (±0-50 points)
- Value edge vs market odds (0-25 points)
- Consensus confidence if available (0-25 points)

---

## 6. Using the Betting Bot

### Step 1: Configure Strategy
1. Open Settings tab
2. Select strategy (Kelly, Value, Aggressive, Conservative)
3. Set bankroll amount
4. Adjust risk limits
5. Click "Save Settings"

### Step 2: Analyze Opportunities
1. Go to Opportunities tab
2. Click "Analyze Games"
3. Bot analyzes sports data and ranks by EV
4. Review recommendations with confidence scores

### Step 3: Place Bets
1. Review opportunity details (odds, probability, EV)
2. Check recommended bet size
3. Click "Place Bet"
4. Bet appears in Active Bets tab

### Step 4: Track Performance
1. Monitor active bets in real-time
2. View settled bets in History tab
3. Review statistics in header
4. Analyze trends by strategy

---

## 7. Integration with Sports APIs

### Supported Data Sources (plug in your API key)
- ESPN API - NFL, NBA, MLB, NHL
- Sleeper API - Fantasy Football
- TheOddsAPI - Multi-sport odds
- SofaScore API - Soccer and Tennis

### Example Integration
```javascript
// In BettingBotDashboard.jsx - loadMockGames function
const response = await fetch(`https://api.example.com/games?date=${date}`);
const games = await response.json();
setGames(games);
```

---

## 8. Deployment Checklist

- [ ] Create Supabase tables (run migration SQL)
- [ ] Set environment variables in Vercel
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Deploy API routes to Vercel (`/api/bets/*`)
- [ ] Deploy frontend component
- [ ] Test analyze endpoint
- [ ] Test execute endpoint
- [ ] Connect to real sports API

---

## 9. Troubleshooting

### "Missing userId"
- Ensure user is authenticated
- Check auth context is working
- Verify user.id exists

### "Strategy not found"
- User hasn't saved settings yet
- Call POST /api/bets/strategy first
- Endpoint creates default strategy if missing

### API 405 errors
- Check HTTP method matches endpoint (GET vs POST)
- Verify request Content-Type: application/json

### Bets not saving
- Check Supabase RLS policies
- Verify user_id in auth.users table
- Ensure bets table has user_id column

---

## Cost

**Free tier**: 
- Vercel: Generous free tier for serverless functions
- Supabase: 500MB storage, 2GB bandwidth/month
- Total: **$0/month** for reasonable usage

---

## Next Steps

1. Set up real sports data source
2. Implement live score updates
3. Add parlay construction
4. Build advanced analytics dashboard
5. Integrate with actual sportsbooks (Hard Rock Bet, DraftKings, etc.)
