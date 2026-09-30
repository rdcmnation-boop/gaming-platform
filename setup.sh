#!/bin/bash

# RDCM Nation Poker Platform - Complete Setup Script
# This script automates the entire setup process with minimal user input

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ASCII Header
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   RDCM Nation Poker Platform - Complete Setup              ║"
echo "║   Professional Multiplayer Poker with AI Opponents         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to print sections
print_section() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Step 1: Check Node.js
print_section "Checking Node.js Installation"
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js v16 or higher"
    echo "Download from: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js $NODE_VERSION detected"

# Step 2: Check npm
print_section "Checking npm Installation"
if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install npm"
    exit 1
fi
NPM_VERSION=$(npm -v)
print_success "npm $NPM_VERSION detected"

# Step 3: Install dependencies
print_section "Installing Project Dependencies"
echo "Running: npm install"
if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 4: Create .env.local if it doesn't exist
print_section "Configuring Environment Variables"
if [ -f .env.local ]; then
    print_warning ".env.local already exists. Skipping creation."
    echo "To reconfigure, delete .env.local and run this script again."
else
    cp .env.local.example .env.local
    print_success "Created .env.local from template"
fi

# Step 5: Provide Supabase setup instructions
print_section "Supabase Database Setup Required"
echo "Your poker platform needs a Supabase account (free tier available)."
echo ""
echo "Steps to configure:"
echo "  1. Go to: https://supabase.com"
echo "  2. Click 'Sign Up' and create a free account"
echo "  3. Create a new project (region: US East recommended)"
echo "  4. Wait for project to initialize (~2 minutes)"
echo "  5. Go to Settings → API"
echo "  6. Copy your Project URL"
echo "  7. Copy your Anon Key (public key)"
echo "  8. Open .env.local in this directory"
echo "  9. Replace REACT_APP_SUPABASE_URL with your Project URL"
echo "  10. Replace REACT_APP_SUPABASE_ANON_KEY with your Anon Key"
echo ""
echo "After adding credentials:"
echo "  11. Open Supabase SQL Editor"
echo "  12. Copy entire contents of supabase/init.sql"
echo "  13. Paste into SQL Editor and execute"
echo ""
print_warning "Press ENTER once you've completed the above steps and saved .env.local..."
read

# Step 6: Verify .env.local has values
print_section "Verifying Environment Configuration"
if grep -q "your-project.supabase.co" .env.local; then
    print_error "Environment variables not configured. Please follow the Supabase setup steps above."
    exit 1
fi
if grep -q "your-anon-key-here" .env.local; then
    print_error "Environment variables not configured. Please follow the Supabase setup steps above."
    exit 1
fi
print_success "Environment variables configured"

# Step 7: Check database connection (optional)
print_section "Testing Supabase Connection"
echo "Attempting to connect to Supabase..."
if npm run test:db 2>/dev/null; then
    print_success "Supabase connection successful"
else
    print_warning "Could not verify Supabase connection immediately. This is normal - you may need to wait a moment for your database to initialize."
fi

# Step 8: Final confirmation
print_section "Setup Complete!"
echo ""
echo -e "${GREEN}Your poker platform is ready to run!${NC}"
echo ""
echo "To start the development server:"
echo -e "  ${BLUE}npm start${NC}"
echo ""
echo "The app will open in your browser at http://localhost:3000"
echo ""
echo "To create an account:"
echo "  1. Click 'Sign In' in the top right"
echo "  2. Create a new account with email/password"
echo "  3. Start playing! You get 10,000 chips to start"
echo ""
echo "Features:"
echo "  • Play against 5 AI opponents with different personalities"
echo "  • Real-time chip tracking"
echo "  • Hand history and statistics"
echo "  • Professional poker table interface"
echo ""
echo "Next steps:"
echo "  • Read README_POKER.md for feature overview"
echo "  • Check VERIFICATION_CHECKLIST.md to test all features"
echo "  • Deploy to Vercel when ready: deploy.sh"
echo ""
print_success "Happy playing! 🎰"
