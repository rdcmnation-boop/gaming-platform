# 🚀 RDCM AI Trading Bot - Deployment Guide

## Quick Deploy to Railway (Recommended - 5 minutes)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up (free)
3. Click "New Project"

### Step 2: Connect GitHub
1. Select "Deploy from GitHub"
2. Connect your GitHub account
3. Select this `gaming-platform` repository

### Step 3: Add Environment Variables
In Railway dashboard, go to **Variables** and add:

```
COINBASE_API_KEY=your_api_key_here
COINBASE_API_SECRET=your_api_secret_here
COINBASE_PASSPHRASE=your_passphrase_here
TRADING_AMOUNT=100
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. ✅ Bot is now running 24/7!

---

## Get Coinbase API Keys

1. **Login to Coinbase** at coinbase.com
2. Go to **Settings** → **API**
3. Click **Create New Key**
4. Select permissions:
   - ✅ View
   - ✅ Trade
5. **Restrict to IP address** (your server's IP or anywhere)
6. Create key and save:
   - API Key
   - API Secret
   - Passphrase

**⚠️ IMPORTANT:** Never share these keys. Keep them secret!

---

## Alternative Deployments

### Heroku (Free tier deprecated, but still available)
```bash
git push heroku main
heroku config:set COINBASE_API_KEY=xxx
heroku config:set COINBASE_API_SECRET=xxx
heroku config:set COINBASE_PASSPHRASE=xxx
```

### Run Locally
```bash
pip install -r requirements.txt
COINBASE_API_KEY=xxx python rdcm_bot_production.py
```

### Docker (Advanced)
```bash
docker build -t rdcm-bot .
docker run -e COINBASE_API_KEY=xxx -e COINBASE_API_SECRET=xxx rdcm-bot
```

---

## Monitor Bot Performance

### In Railway Dashboard:
- View logs in real-time
- Check trade history
- Monitor profits
- Adjust trading amount anytime

### Bot Metrics:
- Total trades executed
- Total profit/loss
- Win rate
- Average trade size

---

## Monetization - Sell Your Bot

Once bot is running and profitable:

### Gumroad Listing ($19.99)
```
Title: RDCM AI Trading Bot - Earn 24/7
Description: 
- AI-powered crypto trading bot
- Runs on Coinbase (your API)
- Automated trading decisions
- Real profit tracking
- Deploy in 5 minutes

Price: $19.99 one-time
```

### Recurring Subscription ($9.99/month)
- Provide bot updates
- Add new strategies
- Customer support
- Dashboard monitoring

### Performance Fee (15% of profits)
- Users keep 85%, you take 15%
- Align incentives
- Passive revenue

---

## Troubleshooting

**Bot not trading?**
- Check API credentials in Railway variables
- Verify Coinbase API key has "Trade" permission
- Check account has sufficient balance

**Getting API errors?**
- Wait 5 minutes (rate limiting)
- Verify IP restriction on Coinbase
- Check internet connection

**Need to stop bot?**
- Go to Railway → Deployment → Remove

---

## Next Steps

1. ✅ Get Coinbase API keys
2. ✅ Deploy to Railway
3. ✅ Monitor for 24 hours
4. ✅ Post Gumroad listing
5. ✅ Collect revenue

**Your bot is now running and making money! 🤖💰**
