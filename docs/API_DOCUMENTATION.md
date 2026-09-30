# RDCM Poker Platform - API Documentation

## Overview
Complete API reference for the RDCM Nation poker platform backend and frontend components.

## Table of Contents
1. [Authentication API](#authentication-api)
2. [Player API](#player-api)
3. [Game API](#game-api)
4. [Leaderboard API](#leaderboard-api)
5. [Tournament API](#tournament-api)
6. [Statistics API](#statistics-api)

---

## Authentication API

### Sign Up
Create a new user account.

**Endpoint:** `POST /auth/signup`

**Method:** Via Supabase Auth

**Request Body:**
```javascript
{
  email: "player@example.com",
  password: "secure_password",
  username: "PlayerName"
}
```

**Response:**
```javascript
{
  user: {
    id: "uuid",
    email: "player@example.com"
  },
  session: {
    access_token: "jwt_token"
  }
}
```

**Error Codes:**
- `400` - Invalid email format
- `400` - Password too weak
- `409` - Username already taken

---

### Sign In
Authenticate existing user.

**Endpoint:** `POST /auth/signin`

**Request Body:**
```javascript
{
  email: "player@example.com",
  password: "secure_password"
}
```

**Response:**
```javascript
{
  session: {
    access_token: "jwt_token",
    expires_in: 3600
  },
  user: {
    id: "uuid",
    email: "player@example.com"
  }
}
```

---

### Sign Out
End user session.

**Endpoint:** `POST /auth/signout`

**Response:**
```javascript
{
  success: true
}
```

---

## Player API

### Get Player Profile
Retrieve player information and statistics.

**Endpoint:** `GET /players/{user_id}`

**Response:**
```javascript
{
  id: "uuid",
  user_id: "uuid",
  username: "PlayerName",
  balance: 10000,
  total_wins: 5,
  total_hands: 20,
  total_profit: 2500,
  avatar_url: "https://...",
  last_played_at: "2026-09-29T00:00:00Z",
  created_at: "2026-09-20T00:00:00Z",
  updated_at: "2026-09-29T00:00:00Z"
}
```

---

### Update Player Profile
Update player information.

**Endpoint:** `PUT /players/{user_id}`

**Request Body:**
```javascript
{
  username: "NewName",
  avatar_url: "https://..."
}
```

**Response:**
```javascript
{
  id: "uuid",
  username: "NewName",
  avatar_url: "https://..."
}
```

---

### Get Player Balance
Get current chip balance.

**Endpoint:** `GET /players/{user_id}/balance`

**Response:**
```javascript
{
  balance: 10000,
  currency: "chips"
}
```

---

### Update Player Balance
Modify player balance (admin only).

**Endpoint:** `PUT /players/{user_id}/balance`

**Request Body:**
```javascript
{
  amount: 5000,
  operation: "add|subtract|set"
}
```

**Response:**
```javascript
{
  balance: 15000,
  previous_balance: 10000
}
```

---

## Game API

### Start Game Hand
Initiate a new poker hand.

**Endpoint:** `POST /games/hand/start`

**Request Body:**
```javascript
{
  session_id: "uuid",
  player_ids: ["uuid1", "uuid2", "uuid3"],
  buy_in: 100
}
```

**Response:**
```javascript
{
  hand_id: "uuid",
  session_id: "uuid",
  dealer: "uuid",
  small_blind: 50,
  big_blind: 100,
  status: "dealing",
  created_at: "2026-09-29T00:00:00Z"
}
```

---

### Place Bet
Record a player's bet.

**Endpoint:** `POST /games/hand/{hand_id}/bet`

**Request Body:**
```javascript
{
  player_id: "uuid",
  amount: 250,
  action: "call|raise|fold|check"
}
```

**Response:**
```javascript
{
  bet_id: "uuid",
  hand_id: "uuid",
  player_id: "uuid",
  amount: 250,
  action: "raise",
  pot: 500,
  created_at: "2026-09-29T00:00:00Z"
}
```

---

### Evaluate Hand
Determine winner of current hand.

**Endpoint:** `POST /games/hand/{hand_id}/evaluate`

**Request Body:**
```javascript
{
  players: [
    {
      id: "uuid",
      hand_rank: "ONE_PAIR",
      cards: ["AH", "AD"]
    }
  ]
}
```

**Response:**
```javascript
{
  winner_ids: ["uuid"],
  winning_hand: "ONE_PAIR",
  pot: 1000,
  payout_per_winner: 500,
  hand_history: [...]
}
```

---

## Leaderboard API

### Get Global Leaderboard
Retrieve top players ranked by metric.

**Endpoint:** `GET /leaderboard?sort_by=total_profit&limit=100`

**Query Parameters:**
- `sort_by` - `total_profit|balance|total_wins|win_rate`
- `limit` - Max 100, default 25
- `timeframe` - `all|week|month`

**Response:**
```javascript
[
  {
    rank: 1,
    user_id: "uuid",
    username: "TopPlayer",
    balance: 50000,
    total_profit: 25000,
    total_wins: 150,
    total_hands: 500,
    win_rate: 30.0,
    last_played_at: "2026-09-29T00:00:00Z"
  }
]
```

---

### Get Player Rank
Get specific player's leaderboard position.

**Endpoint:** `GET /leaderboard/player/{user_id}`

**Response:**
```javascript
{
  rank: 15,
  total_players: 1250,
  percentile: 98.8,
  stats: {
    balance: 5000,
    total_profit: 1000,
    total_wins: 25,
    total_hands: 100,
    win_rate: 25.0
  }
}
```

---

## Tournament API

### Create Tournament
Create a new tournament.

**Endpoint:** `POST /tournaments`

**Request Body:**
```javascript
{
  name: "Friday Night Poker",
  host_id: "uuid",
  buy_in: 100,
  max_players: 8,
  prize_structure: [50, 30, 20]
}
```

**Response:**
```javascript
{
  id: "uuid",
  name: "Friday Night Poker",
  host_id: "uuid",
  buy_in: 100,
  max_players: 8,
  current_players: 1,
  status: "pending",
  prize_structure: [50, 30, 20],
  created_at: "2026-09-29T00:00:00Z"
}
```

---

### Join Tournament
Add player to tournament.

**Endpoint:** `POST /tournaments/{tournament_id}/join`

**Request Body:**
```javascript
{
  user_id: "uuid",
  buy_in: 100
}
```

**Response:**
```javascript
{
  tournament_id: "uuid",
  user_id: "uuid",
  status: "active",
  buy_in: 100,
  joined_at: "2026-09-29T00:00:00Z"
}
```

---

### Get Tournament Details
Retrieve tournament information.

**Endpoint:** `GET /tournaments/{tournament_id}`

**Response:**
```javascript
{
  id: "uuid",
  name: "Friday Night Poker",
  host_id: "uuid",
  buy_in: 100,
  max_players: 8,
  current_players: 6,
  status: "active",
  prize_pool: 600,
  prize_structure: [50, 30, 20],
  players: [
    {
      user_id: "uuid",
      username: "Player1",
      status: "active",
      placement: null
    }
  ],
  created_at: "2026-09-29T00:00:00Z"
}
```

---

## Statistics API

### Get Player Stats
Retrieve detailed player statistics.

**Endpoint:** `GET /players/{user_id}/stats`

**Response:**
```javascript
{
  user_id: "uuid",
  username: "PlayerName",
  balance: 10000,
  total_profit: 2500,
  total_wins: 5,
  total_hands: 20,
  win_rate: 25.0,
  avg_profit_per_hand: 125.0,
  roi: 25.0,
  longest_win_streak: 3,
  biggest_win: 500,
  biggest_loss: 300,
  favorite_hand: "ONE_PAIR",
  games_played: 20,
  average_session_length: 45
}
```

---

### Get Game History
Retrieve player's recent games.

**Endpoint:** `GET /players/{user_id}/history?limit=50`

**Response:**
```javascript
[
  {
    id: "uuid",
    session_id: "uuid",
    user_id: "uuid",
    hand_rank: "ONE_PAIR",
    result: "win",
    amount_won: 250,
    amount_lost: 0,
    played_at: "2026-09-29T00:00:00Z"
  }
]
```

---

### Get Session Statistics
Retrieve session-level statistics.

**Endpoint:** `GET /sessions/{session_id}/stats`

**Response:**
```javascript
{
  session_id: "uuid",
  status: "completed",
  start_time: "2026-09-29T20:00:00Z",
  end_time: "2026-09-29T21:30:00Z",
  duration_minutes: 90,
  total_hands: 15,
  total_pot: 5000,
  players: [
    {
      user_id: "uuid",
      username: "Player1",
      buy_in: 1000,
      cash_out: 1250,
      profit: 250
    }
  ]
}
```

---

## Error Responses

All endpoints return error responses in the following format:

```javascript
{
  error: {
    code: "ERROR_CODE",
    message: "Human readable error message",
    details: {}
  }
}
```

### Common Error Codes
- `AUTH_REQUIRED` - User not authenticated
- `INVALID_PARAMS` - Invalid request parameters
- `INSUFFICIENT_BALANCE` - Not enough chips
- `GAME_IN_PROGRESS` - Cannot join, game already started
- `PLAYER_NOT_FOUND` - User does not exist
- `TOURNAMENT_FULL` - Tournament is at max capacity
- `DATABASE_ERROR` - Unexpected database error

---

## Rate Limiting

API requests are rate-limited:
- **Authenticated users:** 1000 requests/hour
- **Public endpoints:** 100 requests/hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1632892800
```

---

## Webhooks

Subscribe to real-time events:

**Available Events:**
- `game.started` - New hand begins
- `game.ended` - Hand concludes
- `player.joined` - Player enters session
- `player.left` - Player exits session
- `tournament.created` - New tournament
- `tournament.completed` - Tournament ends

**Webhook Payload:**
```javascript
{
  event: "game.ended",
  timestamp: "2026-09-29T00:00:00Z",
  data: {
    hand_id: "uuid",
    session_id: "uuid",
    winner_ids: ["uuid"],
    pot: 1000
  }
}
```

---

## SDK Usage

### JavaScript/React
```javascript
import { useAuth } from './contexts/AuthContext';
import { supabase } from './utils/supabaseClient';

function MyComponent() {
  const { user, playerData } = useAuth();
  
  // Get player stats
  const { data: stats } = await supabase
    .from('players')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  return <div>{stats.username}: ${stats.balance}</div>;
}
```

---

## Support

For API issues or questions:
- **Email:** support@rdcmpoker.com
- **Discord:** [Join our community](#)
- **GitHub Issues:** Report bugs at [github.com/rdcmnation-boop/gaming-platform](#)
