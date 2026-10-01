# 🤖 RDCM Multi-Broker Trading Bot Setup Guide

## Quick Start - Choose Your Broker

The bot now supports **Coinbase** and **Robinhood** with improved AI training and decision making.

---

## OPTION 1: Deploy with Coinbase (Recommended)

### Step 1: Get Coinbase API Keys (5 minutes)

1. **Login to Coinbase Pro** at https://pro.coinbase.com (or use regular Coinbase and enable Advanced Trading)
2. Click **Settings** → **API**
3. Click **Create New Key**
4. **Select Permissions:**
   - ✅ View
   - ✅ Trade
   - ❌ Transfer (for security)
5. **Restrict to IP address:**
   - Option: Add your Railway server IP when deployed
   - Or: Leave unrestricted for testing
6. **Create and Save:**
   - Copy **API Key**
   - Copy **API Secret**
   - Copy **Passphrase**

### Step 2: Deploy to Railway

1. Go to https://railway.app
2. Sign up free with GitHub
3. Click **New Project** → **Deploy from GitHub**
4. Select the `gaming-platform` repo
5. **Add Environment Variables:**
   ```
   TRADING_BROKER=coinbase
   COINBASE_API_KEY=your_key_here
   COINBASE_API_SECRET=your_secret_here
   COINBASE_PASSPHRASE=your_passphrase_here
   TRADING_AMOUNT=100
   ```
6. Click **Deploy**
7. ✅ Bot runs 24/7!

**Cost:** Free tier includes 500 hours/month (plenty for 24/7 bot)

---

## OPTION 2: Deploy with Robinhood

### Step 1: Get Robinhood API Access

1. **Create Robinhood Account** at https://robinhood.com
2. Go to **Account Settings** → **API**
3. Request API access (may require approval)
4. Once approved, generate **Access Token**
5. Save the token securely

### Step 2: Deploy to Railway

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select `gaming-platform` repo
4. **Add Environment Variables:**
   ```
   TRADING_BROKER=robinhood
   ROBINHOOD_TOKEN=your_token_here
   TRADING_AMOUNT=100
   ```
5. Click **Deploy**
6. ✅ Bot trades on Robinhood 24/7!

---

## Running Locally for Testing

### Test with Coinbase (Demo Mode)
```bash
pip install -r requirements.txt

# Run demo (no real trading)
python rdcm_bot_multibroker.py
```

### Test with Real Credentials
```bash
# Coinbase
export TRADING_BROKER=coinbase
export COINBASE_API_KEY=your_key
export COINBASE_API_SECRET=your_secret
export COINBASE_PASSPHRASE=your_passphrase
export TRADING_AMOUNT=100

python rdcm_bot_multibroker.py
```

---

## Bot Features & AI Training

### What the Bot Does:
1. **Fetches Market Data** - Real-time price, 24h stats, balance
2. **Analyzes Trends** - Watches price history, detects uptrends/downtrends
3. **Makes Smart Decisions** - AI decides BUY, SELL, or HOLD based on:
   - Current price vs 24h high/low
   - Price movement vs opening price
   - 5-period moving average
   - Confidence scoring (50-95%)
4. **Executes Trades** - Places real orders via broker API
5. **Tracks Profits** - Logs all trades and ROI

### AI Decision Making:
```
Sentiment Analysis:
├─ BULLISH (price up 2%+) → BUY signal
├─ BEARISH (price down 2%+) → SELL signal
└─ NEUTRAL (sideways) → HOLD

Confidence Scoring:
├─ 50-70% = Low confidence (hold position)
├─ 70-85% = Good confidence (execute trade)
└─ 85%+ = High confidence (execute trade)
```

### Training Data:
- Bot stores last 100 price points for trend analysis
- Learns from decision history
- Adapts confidence based on market volatility
- Continuously improves decision accuracy

---

## Monitor Bot Performance

### Via Railway Dashboard:
1. Go to https://railway.app
2. Select your project
3. Click **Deployments**
4. View real-time logs
5. See trading activity

### Logs Show:
```
📊 Market Data:
   Price: $42,567.89
   Balance: $5,000.00 USD | 0.05 BTC

🧠 Market Analysis:
   Sentiment: BULLISH
   Confidence: 78%
   Reason: Price up 2.5% - uptrend

💡 AI Decision:
   Action: BUY
   Confidence: 78%

⚡ Execution:
   ✅ EXECUTED
   Bought 0.00117 BTC @ $42,567.89
```

---

## Understanding the Bot's Stats

### What Each Stat Means:

**Price:** Current market price (fetched real-time)

**Sentiment:** 
- BULLISH = Uptrend detected, bot looks to BUY
- BEARISH = Downtrend detected, bot looks to SELL
- NEUTRAL = Sideways, bot HOLDS

**Confidence:**
- 50% = No clear trend
- 70%+ = Execute trade
- 85%+ = Strong signal

**Action:**
- BUY = Buys $100 worth of BTC (or configured amount)
- SELL = Sells 50% of BTC holdings
- HOLD = No action taken

**Profit:** Calculated as (sell_price - avg_buy_cost) * amount

---

## Security Best Practices

✅ **DO:**
- Use READ + TRADE permissions only
- Restrict API keys to specific IPs when possible
- Store keys in environment variables (never in code)
- Use small trading amounts for testing ($10-50)
- Monitor bot logs regularly

❌ **DON'T:**
- Share API keys or tokens
- Commit credentials to GitHub
- Use same credentials in multiple places
- Grant TRANSFER permission to trading bot
- Leave demo bot running with real credentials

---

## Troubleshooting

### Bot Not Trading?
1. Check API key is valid
2. Verify account has sufficient balance
3. Check permissions (READ + TRADE enabled)
4. Verify IP restriction on API key
5. Look at logs in Railway dashboard

### Connection Errors?
1. Check internet connection
2. Verify API endpoint is accessible
3. Wait 5 minutes (rate limiting)
4. Try different API key

### Wrong Broker Trading?
1. Check TRADING_BROKER env variable
2. Verify correct credentials for selected broker
3. Restart bot (redeploy in Railway)

---

## Switching Brokers

To switch from Coinbase to Robinhood (or vice versa):

1. Go to Railway dashboard
2. Click project → **Variables**
3. Change:
   ```
   TRADING_BROKER=robinhood  # (was: coinbase)
   ```
4. Remove old broker credentials
5. Add new broker credentials
6. Redeploy (automatic)

---

## Running Multiple Bots

You can run separate bots for each broker:

### Setup 2 Railway Projects:

**Project 1 - Coinbase Bot:**
- TRADING_BROKER=coinbase
- COINBASE_API_KEY=...
- (etc)

**Project 2 - Robinhood Bot:**
- TRADING_BROKER=robinhood
- ROBINHOOD_TOKEN=...

Both run independently and can trade simultaneously!

---

## Advanced: Custom Trading Amounts

Change trading amount per cycle:

**Environment Variable:**
```
TRADING_AMOUNT=250  # Trade $250 per cycle instead of $100
```

**Recommendation:**
- Start small: $50-100
- Test for 24 hours
- Increase if confident: $250-500
- Max: Whatever your risk tolerance allows

---

## Next Steps

1. ✅ Choose broker (Coinbase recommended for easier setup)
2. ✅ Get API credentials (5 minutes)
3. ✅ Deploy to Railway (2 minutes)
4. ✅ Monitor dashboard (watch first 24 hours)
5. ✅ Adjust trading amount if needed
6. ✅ Collect profits 💰

---

## Revenue Model

Once bot is profitable:

1. **Live Dashboard** → Deploy to Netlify/Vercel
2. **Gumroad Store** → Sell bot for $19.99
3. **Customer Setup** → They add their own API keys
4. **Passive Income** → Users pay, you get ~$18 per sale

---

## Questions?

- **API Issues:** Check broker's API documentation
- **Deployment:** See DEPLOYMENT_GUIDE.md
- **Monetization:** See QUICK_LAUNCH.md
- **Trading Strategy:** Examine AI logic in `rdcm_bot_multibroker.py`

Good luck! 🚀
