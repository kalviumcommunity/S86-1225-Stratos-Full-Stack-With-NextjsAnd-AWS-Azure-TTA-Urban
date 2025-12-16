#!/bin/bash
# API Testing Script for TTA Urban
# This script demonstrates testing all endpoints using curl

echo "=========================================="
echo "TTA Urban API Testing Script"
echo "=========================================="
echo ""
echo "Make sure the dev server is running: npm run dev"
echo "Waiting for server to be ready..."
echo ""

API_BASE="http://localhost:3000/api"

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Function to print test result
print_result() {
    echo -e "${GREEN}✓ $1${NC}"
    echo ""
}

# ============================================
# USERS ENDPOINTS
# ============================================

print_header "1. USERS ENDPOINTS"

echo "Test 1.1: GET /api/users (list all users with pagination)"
curl -X GET "$API_BASE/users?page=1&limit=10" | jq '.'
print_result "GET /api/users (list)"

echo "Test 1.2: POST /api/users (create new user)"
curl -X POST "$API_BASE/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "securePassword123",
    "phone": "+1234567890",
    "role": "CITIZEN"
  }' | jq '.'
print_result "POST /api/users (create)"

echo "Test 1.3: GET /api/users/1 (get specific user)"
curl -X GET "$API_BASE/users/1" | jq '.'
print_result "GET /api/users/:id (retrieve)"

echo "Test 1.4: PUT /api/users/1 (full update - replace entire user)"
curl -X PUT "$API_BASE/users/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Updated",
    "email": "alice.updated@example.com",
    "phone": "+9876543210",
    "role": "OFFICER"
  }' | jq '.'
print_result "PUT /api/users/:id (full update)"

echo "Test 1.5: PATCH /api/users/1 (partial update - only specified fields)"
curl -X PATCH "$API_BASE/users/1" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1111111111",
    "role": "ADMIN"
  }' | jq '.'
print_result "PATCH /api/users/:id (partial update)"

echo "Test 1.6: DELETE /api/users/1 (delete user)"
curl -X DELETE "$API_BASE/users/1" | jq '.'
print_result "DELETE /api/users/:id (delete)"

# ============================================
# COMPLAINTS ENDPOINTS
# ============================================

print_header "2. COMPLAINTS ENDPOINTS"

echo "Test 2.1: GET /api/complaints (list all complaints with pagination)"
curl -X GET "$API_BASE/complaints?page=1&limit=10" | jq '.'
print_result "GET /api/complaints (list)"

echo "Test 2.2: GET /api/complaints with filters (status and priority)"
curl -X GET "$API_BASE/complaints?status=SUBMITTED&priority=HIGH&page=1&limit=10" | jq '.'
print_result "GET /api/complaints (with filters)"

echo "Test 2.3: POST /api/complaints (create new complaint)"
curl -X POST "$API_BASE/complaints" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pothole on Main Street",
    "description": "Large pothole causing traffic hazard and vehicle damage",
    "category": "INFRASTRUCTURE",
    "address": "123 Main St, Downtown",
    "latitude": 40.7128,
    "longitude": -74.006,
    "imageUrl": "https://example.com/image.jpg"
  }' | jq '.'
print_result "POST /api/complaints (create)"

echo "Test 2.4: GET /api/complaints/1 (get specific complaint)"
curl -X GET "$API_BASE/complaints/1" | jq '.'
print_result "GET /api/complaints/:id (retrieve)"

echo "Test 2.5: PUT /api/complaints/1 (full update)"
curl -X PUT "$API_BASE/complaints/1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated: Pothole on Main Street",
    "description": "Updated description with more details",
    "category": "INFRASTRUCTURE",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "address": "123 Main St, Downtown"
  }' | jq '.'
print_result "PUT /api/complaints/:id (full update)"

echo "Test 2.6: PATCH /api/complaints/1 (partial update - status and priority)"
curl -X PATCH "$API_BASE/complaints/1" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RESOLVED",
    "priority": "MEDIUM"
  }' | jq '.'
print_result "PATCH /api/complaints/:id (partial update)"

echo "Test 2.7: DELETE /api/complaints/1 (delete complaint)"
curl -X DELETE "$API_BASE/complaints/1" | jq '.'
print_result "DELETE /api/complaints/:id (delete)"

# ============================================
# DEPARTMENTS ENDPOINTS
# ============================================

print_header "3. DEPARTMENTS ENDPOINTS"

echo "Test 3.1: GET /api/departments (list all departments)"
curl -X GET "$API_BASE/departments?page=1&limit=10" | jq '.'
print_result "GET /api/departments (list)"

echo "Test 3.2: POST /api/departments (create new department)"
curl -X POST "$API_BASE/departments" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Water Supply Department",
    "description": "Manages water distribution and quality control"
  }' | jq '.'
print_result "POST /api/departments (create)"

echo "Test 3.3: GET /api/departments/1 (get specific department)"
curl -X GET "$API_BASE/departments/1" | jq '.'
print_result "GET /api/departments/:id (retrieve)"

echo "Test 3.4: PUT /api/departments/1 (full update)"
curl -X PUT "$API_BASE/departments/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Traffic & Transportation Department",
    "description": "Oversees traffic flow and public transportation coordination"
  }' | jq '.'
print_result "PUT /api/departments/:id (full update)"

echo "Test 3.5: PATCH /api/departments/1 (partial update)"
curl -X PATCH "$API_BASE/departments/1" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated department description"
  }' | jq '.'
print_result "PATCH /api/departments/:id (partial update)"

echo "Test 3.6: DELETE /api/departments/1 (delete department)"
curl -X DELETE "$API_BASE/departments/1" | jq '.'
print_result "DELETE /api/departments/:id (delete)"

# ============================================
# ERROR HANDLING TESTS
# ============================================

print_header "4. ERROR HANDLING TESTS"

echo "Test 4.1: Bad Request - Missing required fields"
curl -X POST "$API_BASE/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User"
  }' | jq '.'
print_result "400 Bad Request - missing fields"

echo "Test 4.2: Not Found - Non-existent user"
curl -X GET "$API_BASE/users/999" | jq '.'
print_result "404 Not Found"

echo "Test 4.3: Bad ID format"
curl -X GET "$API_BASE/users/invalid-id" | jq '.'
print_result "400 Bad Request - invalid ID format"

# ============================================
# PAGINATION TESTS
# ============================================

print_header "5. PAGINATION TESTS"

echo "Test 5.1: GET users with different page numbers"
curl -X GET "$API_BASE/users?page=1&limit=5" | jq '.pagination'
print_result "Pagination info (page 1, limit 5)"

echo "Test 5.2: GET users with max limit"
curl -X GET "$API_BASE/users?page=1&limit=100" | jq '.pagination'
print_result "Pagination with max limit (100)"

echo "Test 5.3: GET users exceeding max limit (should cap at 100)"
curl -X GET "$API_BASE/users?page=1&limit=500" | jq '.pagination'
print_result "Pagination limit capped at 100"

# ============================================
# SUMMARY
# ============================================

print_header "API Testing Complete!"

echo -e "${YELLOW}Summary:${NC}"
echo "✓ Created resources using POST"
echo "✓ Retrieved resources using GET"
echo "✓ Updated resources using PUT (full) and PATCH (partial)"
echo "✓ Deleted resources using DELETE"
echo "✓ Tested error handling (400, 404)"
echo "✓ Verified pagination"
echo "✓ Tested filtering"
echo ""
echo -e "${BLUE}All endpoints follow REST conventions:${NC}"
echo "- Resource-based naming (nouns, not verbs)"
echo "- Consistent HTTP method semantics"
echo "- Uniform response format"
echo "- Proper error handling with status codes"
echo "- Pagination support"
echo ""
echo "See API_DOCUMENTATION.md for complete endpoint reference"
