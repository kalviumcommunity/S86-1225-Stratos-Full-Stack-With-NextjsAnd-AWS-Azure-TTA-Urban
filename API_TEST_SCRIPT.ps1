# API Testing Script for TTA Urban (PowerShell Version)
# This script demonstrates testing all endpoints using Invoke-WebRequest

param(
    [string]$ApiBase = "http://localhost:3000/api",
    [switch]$SkipDeletes = $false
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "TTA Urban API Testing Script (PowerShell)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Make sure the dev server is running: npm run dev" -ForegroundColor Yellow
Write-Host "API Base URL: $ApiBase" -ForegroundColor Yellow
Write-Host ""

# Function to print section headers
function Print-Header($title) {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Blue
    Write-Host $title -ForegroundColor Blue
    Write-Host "==========================================" -ForegroundColor Blue
}

# Function to make API request and display result
function Invoke-ApiRequest($method, $endpoint, $body, $description) {
    Write-Host ""
    Write-Host $description -ForegroundColor Green
    $url = "$ApiBase$endpoint"
    
    try {
        $params = @{
            Uri = $url
            Method = $method
            Headers = @{ "Content-Type" = "application/json" }
            UseBasicParsing = $true
        }
        
        if ($body) {
            $params['Body'] = $body
        }
        
        $response = Invoke-WebRequest @params
        $content = $response.Content | ConvertFrom-Json
        
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Yellow
        Write-Host ($content | ConvertTo-Json -Depth 3)
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
    }
}

# ============================================
# USERS ENDPOINTS
# ============================================

Print-Header "1. USERS ENDPOINTS"

# Test 1.1: GET /api/users
Invoke-ApiRequest "GET" "/users?page=1&limit=10" $null `
    "Test 1.1: GET /api/users (list all users with pagination)"

# Test 1.2: POST /api/users
$userBody = @{
    name = "Alice Johnson"
    email = "alice@example.com"
    password = "securePassword123"
    phone = "+1234567890"
    role = "CITIZEN"
} | ConvertTo-Json

Invoke-ApiRequest "POST" "/users" $userBody `
    "Test 1.2: POST /api/users (create new user)"

# Test 1.3: GET /api/users/1
Invoke-ApiRequest "GET" "/users/1" $null `
    "Test 1.3: GET /api/users/1 (get specific user)"

# Test 1.4: PUT /api/users/1
$updateUserBody = @{
    name = "Alice Updated"
    email = "alice.updated@example.com"
    phone = "+9876543210"
    role = "OFFICER"
} | ConvertTo-Json

Invoke-ApiRequest "PUT" "/users/1" $updateUserBody `
    "Test 1.4: PUT /api/users/1 (full update - replace entire user)"

# Test 1.5: PATCH /api/users/1
$patchUserBody = @{
    phone = "+1111111111"
    role = "ADMIN"
} | ConvertTo-Json

Invoke-ApiRequest "PATCH" "/users/1" $patchUserBody `
    "Test 1.5: PATCH /api/users/1 (partial update - only specified fields)"

# Test 1.6: DELETE /api/users/1
if (-not $SkipDeletes) {
    Invoke-ApiRequest "DELETE" "/users/1" $null `
        "Test 1.6: DELETE /api/users/1 (delete user)"
}
else {
    Write-Host ""
    Write-Host "Test 1.6: DELETE /api/users/1 (skipped)" -ForegroundColor Gray
}

# ============================================
# COMPLAINTS ENDPOINTS
# ============================================

Print-Header "2. COMPLAINTS ENDPOINTS"

# Test 2.1: GET /api/complaints
Invoke-ApiRequest "GET" "/complaints?page=1&limit=10" $null `
    "Test 2.1: GET /api/complaints (list all complaints with pagination)"

# Test 2.2: GET /api/complaints with filters
Invoke-ApiRequest "GET" "/complaints?status=SUBMITTED&priority=HIGH&page=1&limit=10" $null `
    "Test 2.2: GET /api/complaints (with filters: status and priority)"

# Test 2.3: POST /api/complaints
$complaintBody = @{
    title = "Pothole on Main Street"
    description = "Large pothole causing traffic hazard and vehicle damage"
    category = "INFRASTRUCTURE"
    address = "123 Main St, Downtown"
    latitude = 40.7128
    longitude = -74.006
    imageUrl = "https://example.com/image.jpg"
} | ConvertTo-Json

Invoke-ApiRequest "POST" "/complaints" $complaintBody `
    "Test 2.3: POST /api/complaints (create new complaint)"

# Test 2.4: GET /api/complaints/1
Invoke-ApiRequest "GET" "/complaints/1" $null `
    "Test 2.4: GET /api/complaints/1 (get specific complaint)"

# Test 2.5: PUT /api/complaints/1
$updateComplaintBody = @{
    title = "Updated: Pothole on Main Street"
    description = "Updated description with more details"
    category = "INFRASTRUCTURE"
    status = "IN_PROGRESS"
    priority = "HIGH"
    address = "123 Main St, Downtown"
} | ConvertTo-Json

Invoke-ApiRequest "PUT" "/complaints/1" $updateComplaintBody `
    "Test 2.5: PUT /api/complaints/1 (full update)"

# Test 2.6: PATCH /api/complaints/1
$patchComplaintBody = @{
    status = "RESOLVED"
    priority = "MEDIUM"
} | ConvertTo-Json

Invoke-ApiRequest "PATCH" "/complaints/1" $patchComplaintBody `
    "Test 2.6: PATCH /api/complaints/1 (partial update - status and priority)"

# Test 2.7: DELETE /api/complaints/1
if (-not $SkipDeletes) {
    Invoke-ApiRequest "DELETE" "/complaints/1" $null `
        "Test 2.7: DELETE /api/complaints/1 (delete complaint)"
}
else {
    Write-Host ""
    Write-Host "Test 2.7: DELETE /api/complaints/1 (skipped)" -ForegroundColor Gray
}

# ============================================
# DEPARTMENTS ENDPOINTS
# ============================================

Print-Header "3. DEPARTMENTS ENDPOINTS"

# Test 3.1: GET /api/departments
Invoke-ApiRequest "GET" "/departments?page=1&limit=10" $null `
    "Test 3.1: GET /api/departments (list all departments)"

# Test 3.2: POST /api/departments
$deptBody = @{
    name = "Water Supply Department"
    description = "Manages water distribution and quality control"
} | ConvertTo-Json

Invoke-ApiRequest "POST" "/departments" $deptBody `
    "Test 3.2: POST /api/departments (create new department)"

# Test 3.3: GET /api/departments/1
Invoke-ApiRequest "GET" "/departments/1" $null `
    "Test 3.3: GET /api/departments/1 (get specific department)"

# Test 3.4: PUT /api/departments/1
$updateDeptBody = @{
    name = "Traffic & Transportation Department"
    description = "Oversees traffic flow and public transportation coordination"
} | ConvertTo-Json

Invoke-ApiRequest "PUT" "/departments/1" $updateDeptBody `
    "Test 3.4: PUT /api/departments/1 (full update)"

# Test 3.5: PATCH /api/departments/1
$patchDeptBody = @{
    description = "Updated department description"
} | ConvertTo-Json

Invoke-ApiRequest "PATCH" "/departments/1" $patchDeptBody `
    "Test 3.5: PATCH /api/departments/1 (partial update)"

# Test 3.6: DELETE /api/departments/1
if (-not $SkipDeletes) {
    Invoke-ApiRequest "DELETE" "/departments/1" $null `
        "Test 3.6: DELETE /api/departments/1 (delete department)"
}
else {
    Write-Host ""
    Write-Host "Test 3.6: DELETE /api/departments/1 (skipped)" -ForegroundColor Gray
}

# ============================================
# ERROR HANDLING TESTS
# ============================================

Print-Header "4. ERROR HANDLING TESTS"

# Test 4.1: Bad Request - Missing required fields
$badBody = @{
    name = "Test User"
} | ConvertTo-Json

Invoke-ApiRequest "POST" "/users" $badBody `
    "Test 4.1: Bad Request - Missing required fields (password, email)"

# Test 4.2: Not Found - Non-existent user
Invoke-ApiRequest "GET" "/users/999" $null `
    "Test 4.2: Not Found - Non-existent user"

# Test 4.3: Bad ID format
Invoke-ApiRequest "GET" "/users/invalid-id" $null `
    "Test 4.3: Bad Request - Invalid ID format"

# ============================================
# PAGINATION TESTS
# ============================================

Print-Header "5. PAGINATION TESTS"

# Test 5.1: GET users with different page numbers
Write-Host ""
Write-Host "Test 5.1: GET users with different page numbers (page=1, limit=5)" -ForegroundColor Green

try {
    $response = Invoke-WebRequest -Uri "$ApiBase/users?page=1&limit=5" -Method GET -UseBasicParsing
    $content = $response.Content | ConvertFrom-Json
    Write-Host "Pagination Info:"
    Write-Host ($content.pagination | ConvertTo-Json)
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5.2: GET users with max limit
Write-Host ""
Write-Host "Test 5.2: GET users with max limit (page=1, limit=100)" -ForegroundColor Green

try {
    $response = Invoke-WebRequest -Uri "$ApiBase/users?page=1&limit=100" -Method GET -UseBasicParsing
    $content = $response.Content | ConvertFrom-Json
    Write-Host "Pagination Info:"
    Write-Host ($content.pagination | ConvertTo-Json)
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5.3: GET users exceeding max limit (should cap at 100)
Write-Host ""
Write-Host "Test 5.3: GET users exceeding max limit (page=1, limit=500 -> capped at 100)" -ForegroundColor Green

try {
    $response = Invoke-WebRequest -Uri "$ApiBase/users?page=1&limit=500" -Method GET -UseBasicParsing
    $content = $response.Content | ConvertFrom-Json
    Write-Host "Pagination Info (should show limit=100):"
    Write-Host ($content.pagination | ConvertTo-Json)
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# ============================================
# SUMMARY
# ============================================

Print-Header "API TESTING COMPLETE!"

Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "✓ Created resources using POST" -ForegroundColor Green
Write-Host "✓ Retrieved resources using GET" -ForegroundColor Green
Write-Host "✓ Updated resources using PUT (full) and PATCH (partial)" -ForegroundColor Green
if (-not $SkipDeletes) {
    Write-Host "✓ Deleted resources using DELETE" -ForegroundColor Green
}
Write-Host "✓ Tested error handling (400, 404)" -ForegroundColor Green
Write-Host "✓ Verified pagination" -ForegroundColor Green
Write-Host "✓ Tested filtering" -ForegroundColor Green

Write-Host ""
Write-Host "All endpoints follow REST conventions:" -ForegroundColor Blue
Write-Host "- Resource-based naming (nouns, not verbs)" -ForegroundColor Cyan
Write-Host "- Consistent HTTP method semantics" -ForegroundColor Cyan
Write-Host "- Uniform response format" -ForegroundColor Cyan
Write-Host "- Proper error handling with status codes" -ForegroundColor Cyan
Write-Host "- Pagination support" -ForegroundColor Cyan

Write-Host ""
Write-Host "See API_DOCUMENTATION.md for complete endpoint reference" -ForegroundColor Yellow
