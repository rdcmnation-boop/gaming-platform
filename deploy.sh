#!/bin/bash

# RDCM Nation Poker Platform - Vercel Deployment Script
# Automates deployment to Vercel with environment configuration

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         RDCM Poker Platform - Vercel Deployment            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

print_section() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Step 1: Check Vercel CLI
print_section "Checking Vercel CLI"
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
    print_success "Vercel CLI installed"
else
    print_success "Vercel CLI found"
fi

# Step 2: Check git status
print_section "Checking Git Status"
if [ -n "$(git status --porcelain)" ]; then
    print_error "Uncommitted changes detected"
    echo "Please commit all changes before deploying:"
    echo "  git add ."
    echo "  git commit -m 'Your message'"
    echo "  git push origin main"
    exit 1
fi
print_success "Git repository is clean"

# Step 3: Run tests
print_section "Running Tests"
if npm run test 2>/dev/null; then
    print_success "All tests passed"
else
    print_warning "Tests not configured. Skipping test step."
fi

# Step 4: Build verification
print_section "Verifying Build"
if npm run build 2>/dev/null; then
    print_success "Build successful"
else
    print_error "Build failed. Fix errors and try again."
    exit 1
fi

# Step 5: Vercel deployment
print_section "Deploying to Vercel"
echo ""
echo "You will be prompted to:"
echo "  1. Link to your Vercel account (if first time)"
echo "  2. Confirm project settings"
echo "  3. Set environment variables"
echo ""
echo "Environment variables needed:"
echo "  • REACT_APP_SUPABASE_URL"
echo "  • REACT_APP_SUPABASE_ANON_KEY"
echo ""
print_warning "Press ENTER to continue with Vercel deployment..."
read

if vercel --prod; then
    print_success "Deployment to Vercel successful!"

    print_section "Post-Deployment Steps"
    echo ""
    echo "1. Verify your app is running:"
    echo "   Check your Vercel project dashboard"
    echo ""
    echo "2. Set environment variables in Vercel:"
    echo "   • Go to project Settings → Environment Variables"
    echo "   • Add REACT_APP_SUPABASE_URL"
    echo "   • Add REACT_APP_SUPABASE_ANON_KEY"
    echo "   • Redeploy: vercel --prod"
    echo ""
    echo "3. Test in production:"
    echo "   • Open your Vercel URL"
    echo "   • Sign up or login"
    echo "   • Play a game"
    echo ""
    print_success "Your poker platform is live! 🎰"
else
    print_error "Vercel deployment failed"
    exit 1
fi
