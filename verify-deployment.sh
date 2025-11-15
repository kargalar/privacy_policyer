#!/bin/bash

# Production Deployment Verification Script
# Bu script, production ortamının doğru kurulduğunu kontrol eder

echo "=================================="
echo "🔍 DEPLOYMENT VERIFICATION"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    
    echo -n "Testing $name... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ $response -eq 200 ] || [ $response -eq 404 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response)"
        ((FAILED++))
    fi
}

# Check environment files
echo -e "${BLUE}1. Environment Files Check${NC}"
echo "=================================="
if [ -f backend/.env ]; then
    echo -e "${GREEN}✓${NC} backend/.env exists"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} backend/.env NOT FOUND"
    ((FAILED++))
fi

if [ -f frontend/.env.local ]; then
    echo -e "${GREEN}✓${NC} frontend/.env.local exists"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} frontend/.env.local NOT FOUND (using defaults)"
    ((WARNINGS++))
fi
echo ""

# Check configuration files
echo -e "${BLUE}2. Configuration Files Check${NC}"
echo "=================================="
if [ -f backend/render.yaml ]; then
    echo -e "${GREEN}✓${NC} backend/render.yaml exists"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} backend/render.yaml NOT FOUND"
    ((FAILED++))
fi

if [ -f frontend/vercel.json ]; then
    echo -e "${GREEN}✓${NC} frontend/vercel.json exists"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} frontend/vercel.json NOT FOUND"
    ((FAILED++))
fi
echo ""

# Check package.json scripts
echo -e "${BLUE}3. Package.json Scripts Check${NC}"
echo "=================================="
if grep -q '"build"' backend/package.json; then
    echo -e "${GREEN}✓${NC} backend build script exists"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} backend build script missing"
    ((FAILED++))
fi

if grep -q '"build"' frontend/package.json; then
    echo -e "${GREEN}✓${NC} frontend build script exists"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} frontend build script missing"
    ((FAILED++))
fi
echo ""

# Check database configuration
echo -e "${BLUE}4. Database Configuration Check${NC}"
echo "=================================="
if grep -q "DATABASE_URL" backend/.env; then
    echo -e "${GREEN}✓${NC} DATABASE_URL configured"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} DATABASE_URL NOT configured"
    ((FAILED++))
fi

if grep -q "postgresql://" backend/.env; then
    echo -e "${GREEN}✓${NC} PostgreSQL format detected"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} PostgreSQL format not found"
    ((WARNINGS++))
fi
echo ""

# Check API key configuration
echo -e "${BLUE}5. API Keys Check${NC}"
echo "=================================="
if grep -q "GOOGLE_API_KEY" backend/.env; then
    echo -e "${GREEN}✓${NC} GOOGLE_API_KEY configured"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} GOOGLE_API_KEY not configured"
    ((WARNINGS++))
fi

if grep -q "JWT_SECRET" backend/.env; then
    echo -e "${GREEN}✓${NC} JWT_SECRET configured"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} JWT_SECRET NOT configured"
    ((FAILED++))
fi
echo ""

# Check Frontend endpoint configuration
echo -e "${BLUE}6. Frontend Configuration Check${NC}"
echo "=================================="
if grep -q "REACT_APP_GRAPHQL_ENDPOINT" frontend/.env.local 2>/dev/null; then
    echo -e "${GREEN}✓${NC} REACT_APP_GRAPHQL_ENDPOINT configured"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} REACT_APP_GRAPHQL_ENDPOINT using defaults"
    ((WARNINGS++))
fi
echo ""

# Check Prisma configuration
echo -e "${BLUE}7. Prisma Configuration Check${NC}"
echo "=================================="
if [ -f backend/prisma/schema.prisma ]; then
    echo -e "${GREEN}✓${NC} schema.prisma exists"
    ((PASSED++))
    
    if grep -q "datasource db" backend/prisma/schema.prisma; then
        echo -e "${GREEN}✓${NC} datasource configured"
        ((PASSED++))
    fi
    
    if grep -q "generator client" backend/prisma/schema.prisma; then
        echo -e "${GREEN}✓${NC} prisma client generator configured"
        ((PASSED++))
    fi
else
    echo -e "${RED}✗${NC} schema.prisma NOT FOUND"
    ((FAILED++))
fi
echo ""

# Check Git configuration
echo -e "${BLUE}8. Git Configuration Check${NC}"
echo "=================================="
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Git repository initialized"
    ((PASSED++))
    
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    echo -e "   Current branch: $current_branch"
    
    if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
        echo -e "${GREEN}✓${NC} On correct branch"
        ((PASSED++))
    fi
else
    echo -e "${RED}✗${NC} Not a git repository"
    ((FAILED++))
fi
echo ""

# Check dependencies
echo -e "${BLUE}9. Dependencies Check${NC}"
echo "=================================="
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} backend node_modules exists"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} backend node_modules not installed"
    echo "    Run: cd backend && npm install"
    ((WARNINGS++))
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} frontend node_modules exists"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} frontend node_modules not installed"
    echo "    Run: cd frontend && npm install"
    ((WARNINGS++))
fi
echo ""

# Summary
echo "=================================="
echo "📊 SUMMARY"
echo "=================================="
echo -e "${GREEN}✓ Passed:${NC}  $PASSED"
echo -e "${RED}✗ Failed:${NC}  $FAILED"
echo -e "${YELLOW}⚠ Warnings:${NC} $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ DEPLOYMENT READY!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push to GitHub (main branch)"
    echo "2. Check Render build: https://dashboard.render.com"
    echo "3. Check Vercel build: https://vercel.com/dashboard"
    echo "4. Test endpoints after deployment"
else
    echo -e "${RED}❌ DEPLOYMENT NOT READY!${NC}"
    echo ""
    echo "Fix the errors above and try again."
fi
echo ""
