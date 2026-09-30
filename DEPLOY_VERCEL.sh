#!/bin/bash

# RDCM Nation Poker Platform - One-Command Vercel Deployment
# Run this from your local machine to deploy to production

set -e

echo "🚀 RDCM Nation Poker Platform - Vercel Deployment"
echo "=================================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if git is clean
echo "✓ Checking git status..."
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "   Commit them first: git add . && git commit -m 'message'"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Login to Vercel if needed
echo "✓ Checking Vercel authentication..."
vercel login --confirm || echo "Using existing Vercel credentials"

# Deploy to production
echo ""
echo "🚀 Deploying to Vercel production..."
vercel --prod \
  --env REACT_APP_SUPABASE_URL=https://nfmkeqjfhiqhppmjxwmv.supabase.co \
  --env REACT_APP_SUPABASE_ANON_KEY=sb_publishable_4IC72UgWUlCpWMt5IzobEg_YL_lCbz-

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Your poker platform is now LIVE!"
echo "🎰 Test it out and share the URL!"
