#!/bin/bash

# RDCM Poker - One-command setup
# This script gets the app ready to run

echo "🎰 RDCM Poker Platform - Setup Started"
echo "========================================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org"
    exit 1
fi

echo "✓ Node.js found: $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo "✓ Dependencies installed"

# Check if .env.local exists
echo ""
if [ -f .env.local ]; then
    echo "✓ .env.local found"
else
    echo "⚠️  .env.local not found - creating from template"
    cp .env.local.example .env.local
    echo "⚠️  IMPORTANT: Edit .env.local with your Supabase credentials"
fi

echo ""
echo "========================================"
echo "✓ Setup Complete!"
echo ""
echo "NEXT STEPS:"
echo "1. Go to https://supabase.com and create FREE account"
echo "2. Create a new project"
echo "3. Copy your URL and anon key"
echo "4. Edit .env.local and paste them in"
echo "5. Open Supabase SQL Editor and paste contents of supabase/init.sql"
echo "6. Run: npm start"
echo ""
echo "Then visit: http://localhost:3000"
echo "Sign up and play poker! 🃏"
