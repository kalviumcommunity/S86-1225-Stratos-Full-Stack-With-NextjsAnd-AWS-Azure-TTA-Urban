#!/bin/bash

###############################################################################
# Deployment Verification Script
# Runs health checks and smoke tests against a deployed application
# Usage: ./verify-deployment.sh <APP_URL>
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_URL="${1:-http://localhost:3000}"
MAX_RETRIES=10
RETRY_DELAY=10

echo "=================================================="
echo "🔍 Deployment Verification Script"
echo "=================================================="
echo "Target URL: $APP_URL"
echo "Max Retries: $MAX_RETRIES"
echo ""

###############################################################################
# Function: Health Check
###############################################################################
health_check() {
    echo "📊 Running Health Check..."
    local retry_count=0
    local health_url="$APP_URL/api/health"
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        echo -n "  Attempt $((retry_count + 1))/$MAX_RETRIES - Checking $health_url... "
        
        # Get HTTP status code
        http_code=$(curl -s -o /dev/null -w "%{http_code}" "$health_url" 2>/dev/null || echo "000")
        
        if [ "$http_code" = "200" ]; then
            echo -e "${GREEN}✓ OK${NC}"
            
            # Get and parse response
            response=$(curl -s "$health_url" 2>/dev/null)
            echo "  Response: $response"
            
            # Check if status is healthy
            if echo "$response" | grep -q '"status":"healthy"' || echo "$response" | grep -q '"status":"ok"'; then
                echo -e "${GREEN}✅ Health check PASSED${NC}"
                return 0
            else
                echo -e "${YELLOW}⚠️  Service responded but status is not healthy${NC}"
            fi
        else
            echo -e "${RED}✗ Failed (HTTP $http_code)${NC}"
        fi
        
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $MAX_RETRIES ]; then
            echo "  Retrying in $RETRY_DELAY seconds..."
            sleep $RETRY_DELAY
        fi
    done
    
    echo -e "${RED}❌ Health check FAILED after $MAX_RETRIES attempts${NC}"
    return 1
}

###############################################################################
# Function: Smoke Tests
###############################################################################
run_smoke_tests() {
    echo ""
    echo "🧪 Running Smoke Tests..."
    
    if [ ! -f "package.json" ]; then
        echo -e "${YELLOW}⚠️  package.json not found. Skipping smoke tests.${NC}"
        echo "   Run this script from the project root directory to execute smoke tests."
        return 0
    fi
    
    # Check if smoke test script exists
    if ! grep -q '"test:smoke"' package.json; then
        echo -e "${YELLOW}⚠️  Smoke test script not found in package.json. Skipping.${NC}"
        return 0
    fi
    
    # Export APP_URL for tests
    export APP_URL="$APP_URL"
    
    # Run smoke tests
    if npm run test:smoke 2>&1; then
        echo -e "${GREEN}✅ Smoke tests PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ Smoke tests FAILED${NC}"
        return 1
    fi
}

###############################################################################
# Function: Basic Endpoint Check
###############################################################################
check_endpoints() {
    echo ""
    echo "🌐 Checking Critical Endpoints..."
    
    local endpoints=(
        "/"
        "/api/health"
        "/api/auth/login"
    )
    
    local failed=0
    
    for endpoint in "${endpoints[@]}"; do
        local url="$APP_URL$endpoint"
        echo -n "  Checking $endpoint... "
        
        http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
        
        # 200-299 are success, 401/403 mean endpoint exists (auth required)
        if [[ "$http_code" =~ ^(2[0-9]{2}|401|403)$ ]]; then
            echo -e "${GREEN}✓ OK (HTTP $http_code)${NC}"
        else
            echo -e "${RED}✗ Failed (HTTP $http_code)${NC}"
            failed=$((failed + 1))
        fi
    done
    
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}✅ All endpoints accessible${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  $failed endpoint(s) failed${NC}"
        return 1
    fi
}

###############################################################################
# Function: Response Time Check
###############################################################################
check_response_time() {
    echo ""
    echo "⏱️  Checking Response Time..."
    
    local health_url="$APP_URL/api/health"
    local start_time=$(date +%s%3N)
    
    curl -s "$health_url" > /dev/null 2>&1
    
    local end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))
    
    echo "  Response time: ${duration}ms"
    
    if [ $duration -lt 2000 ]; then
        echo -e "${GREEN}✅ Response time acceptable (<2s)${NC}"
        return 0
    elif [ $duration -lt 5000 ]; then
        echo -e "${YELLOW}⚠️  Response time slow (2-5s)${NC}"
        return 0
    else
        echo -e "${RED}❌ Response time too slow (>5s)${NC}"
        return 1
    fi
}

###############################################################################
# Main Execution
###############################################################################
main() {
    local exit_code=0
    
    # Run all checks
    health_check || exit_code=$?
    check_endpoints || exit_code=$?
    check_response_time || exit_code=$?
    run_smoke_tests || exit_code=$?
    
    echo ""
    echo "=================================================="
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ VERIFICATION SUCCESSFUL${NC}"
        echo "All checks passed. Deployment is healthy."
    else
        echo -e "${RED}❌ VERIFICATION FAILED${NC}"
        echo "One or more checks failed. Consider rolling back."
    fi
    echo "=================================================="
    
    exit $exit_code
}

# Run main function
main
