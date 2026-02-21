#!/bin/bash

# Quick Deployment Script for Todo Full-Stack Application
# This script helps you deploy both frontend and backend

set -e  # Exit on error

echo "=========================================="
echo "Todo App - Quick Deployment Helper"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo "ℹ $1"
}

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Error: Must run this script from the Phase-II directory"
    exit 1
fi

print_success "Found frontend and backend directories"
echo ""

# Step 1: Test Backend Locally
echo "Step 1: Testing Backend Setup"
echo "------------------------------"

if [ ! -f "backend/.env" ]; then
    print_warning "Backend .env file not found"
    print_info "Create backend/.env with your DATABASE_URL and secrets"
else
    print_success "Backend .env file exists"
fi

# Test database connection
print_info "Testing database connection..."
cd backend
if python test_db.py; then
    print_success "Database connection and initialization successful"
else
    print_error "Database test failed - check your DATABASE_URL"
    print_info "Fix the database connection before deploying"
    exit 1
fi
cd ..

echo ""

# Step 2: Check Frontend Configuration
echo "Step 2: Checking Frontend Configuration"
echo "----------------------------------------"

if [ ! -f "frontend/.env.local" ]; then
    print_warning "Frontend .env.local not found"
    print_info "Creating from .env.example..."
    cp frontend/.env.example frontend/.env.local
    print_success "Created frontend/.env.local"
else
    print_success "Frontend .env.local exists"
fi

# Check if API URL is set correctly
if grep -q "NEXT_PUBLIC_API_URL.*localhost:8000/api" frontend/.env.local; then
    print_success "Local API URL configured correctly"
else
    print_warning "Check NEXT_PUBLIC_API_URL in frontend/.env.local"
fi

echo ""

# Step 3: Git Status
echo "Step 3: Git Status"
echo "------------------"

if git diff --quiet && git diff --cached --quiet; then
    print_info "No uncommitted changes"
else
    print_warning "You have uncommitted changes"
    print_info "Commit your changes before deploying:"
    echo ""
    git status --short
    echo ""
fi

echo ""

# Step 4: Deployment Checklist
echo "Step 4: Deployment Checklist"
echo "----------------------------"

echo ""
echo "Backend (Hugging Face Spaces):"
echo "  1. Push code to GitHub"
echo "  2. Set environment variables in HF Space settings:"
echo "     - DATABASE_URL (with ?sslmode=require)"
echo "     - BETTER_AUTH_SECRET"
echo "     - JWT_SECRET"
echo "     - BACKEND_CORS_ORIGINS (include Vercel URL)"
echo "  3. Deploy/rebuild the Space"
echo "  4. Test: https://abdul-saboor-todo-web-application.hf.space/"
echo ""

echo "Frontend (Vercel):"
echo "  1. Push code to GitHub"
echo "  2. Set environment variables in Vercel project:"
echo "     - NEXT_PUBLIC_API_URL=https://abdul-saboor-todo-web-application.hf.space/api"
echo "     - NEXT_PUBLIC_ENVIRONMENT=production"
echo "  3. Deploy (automatic on push)"
echo "  4. Test: https://hackathon-phase-ii-alpha.vercel.app"
echo ""

# Step 5: Quick Test Commands
echo "Step 5: Quick Test Commands"
echo "---------------------------"
echo ""
echo "Test backend locally:"
echo "  cd backend && python -m uvicorn src.main:app --reload --port 8000"
echo ""
echo "Test frontend locally:"
echo "  cd frontend && npm run dev"
echo ""
echo "Test backend API:"
echo "  curl https://abdul-saboor-todo-web-application.hf.space/"
echo "  curl https://abdul-saboor-todo-web-application.hf.space/api/docs"
echo ""
echo "Test registration:"
echo "  curl -X POST https://abdul-saboor-todo-web-application.hf.space/api/auth/register \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"test@example.com\",\"password\":\"testpass123\"}'"
echo ""

print_success "Deployment helper completed!"
print_info "See DEPLOYMENT_GUIDE.md for detailed instructions"
print_info "See FIXES_SUMMARY.md for list of all fixes applied"
