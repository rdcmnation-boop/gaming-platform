#!/bin/bash

# 🤖 RDCM Poker Backend - Automated Setup Script
# This script sets up Supabase and deploys to Vercel

set -e

echo "🎮 RDCM Poker Platform - Backend Setup"
echo "========================================"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found"
    echo "Please create .env.local with your Supabase credentials:"
    echo ""
    echo "  NEXT_PUBLIC_SUPABASE_URL=your_url"
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key"
    echo "  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    exit 1
fi

echo "✅ .env.local found"
echo ""

# Load environment variables
export $(cat .env.local | grep -v '#' | xargs)

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL not set in .env.local"
    exit 1
fi

echo "🔗 Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

# Read SQL migration file
echo "📊 Reading database migration..."
SQL_FILE="supabase/migrations/create_bot_tables.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: $SQL_FILE not found"
    exit 1
fi

echo "✅ Migration file found ($(wc -l < $SQL_FILE) lines)"
echo ""

echo "📝 To complete setup:"
echo "1. Go to: https://app.supabase.com"
echo "2. Select your project"
echo "3. Open SQL Editor"
echo "4. Paste the contents of: $SQL_FILE"
echo "5. Click 'RUN'"
echo ""

echo "🚀 To deploy to Vercel:"
echo "1. Install Vercel CLI: npm i -g vercel"
echo "2. Run: vercel env pull"
echo "3. Add environment variables from .env.local"
echo "4. Run: vercel --prod"
echo ""

echo "✅ Setup instructions printed"
echo ""

# Verify dependencies
echo "📦 Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    exit 1
fi
echo "✅ Node.js $(node -v)"

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi
echo "✅ npm $(npm -v)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📥 Installing dependencies..."
    npm install
fi

echo ""
echo "🎉 Backend setup ready!"
echo ""
echo "Next steps:"
echo "1. Run the SQL migration in Supabase"
echo "2. Deploy to Vercel: vercel --prod"
echo "3. Test API endpoints"
echo ""
echo "For detailed instructions, see BACKEND_SETUP.md"
