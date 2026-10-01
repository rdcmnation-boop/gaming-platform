# RDCM Trading Bot - Heroku Deployment
# Copy these commands and run them in your terminal

# 1. Make sure you're in the gaming-platform directory
cd /home/claude/gaming-platform

# 2. Install Heroku CLI (if not already installed)
# Mac: brew install heroku
# Windows/Linux: Download from https://devcenter.heroku.com/articles/heroku-cli

# 3. Login to Heroku
heroku login

# 4. Create the app
heroku create rdcm-trading-bot-$(date +%s)

# 5. Add environment variables
heroku config:set TRADING_BROKER=coinbase
heroku config:set COINBASE_KEY_NAME="organizations/13829c85-5dbe-4db5-94dd-4c93510972b7/apiKeys/a35e5088-0a6a-41c0-a19e-e66f9f97ea81"
heroku config:set COINBASE_PRIVATE_KEY="B3SLR1xKSHvw9p4AW9RNJnb3CovhBtzt6flSa38rel9kozj6IET0B6tKVhD601qvkvYZmWoNb4aw41lSQWouIg=="
heroku config:set TRADING_AMOUNT=100

# 6. Deploy to Heroku
git push heroku main

# 7. View logs
heroku logs --tail

# Your bot is now trading 24/7!
