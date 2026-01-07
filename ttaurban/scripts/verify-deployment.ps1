###############################################################################
# Deployment Verification Script (PowerShell)
# Runs health checks and smoke tests against a deployed application
# Usage: .\verify-deployment.ps1 -AppUrl "https://your-app.com"
###############################################################################

param(
    [Parameter(Mandatory=$false)]
    [string]$AppUrl = "http://localhost:3000",
    
    [Parameter(Mandatory=$false)]
    [int]$MaxRetries = 10,
    
    [Parameter(Mandatory=$false)]
    [int]$RetryDelay = 10
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🔍 Deployment Verification Script" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Target URL: $AppUrl"
Write-Host "Max Retries: $MaxRetries"
Write-Host ""

###############################################################################
# Function: Health Check
###############################################################################
function Test-HealthCheck {
    Write-Host "📊 Running Health Check..." -ForegroundColor Yellow
    $healthUrl = "$AppUrl/api/health"
    $retryCount = 0
    
    while ($retryCount -lt $MaxRetries) {
        Write-Host "  Attempt $($retryCount + 1)/$MaxRetries - Checking $healthUrl... " -NoNewline
        
        try {
            $response = Invoke-WebRequest -Uri $healthUrl -Method Get -UseBasicParsing -TimeoutSec 30
            
            if ($response.StatusCode -eq 200) {
                Write-Host "✓ OK" -ForegroundColor Green
                
                $content = $response.Content | ConvertFrom-Json
                Write-Host "  Response: $($response.Content)"
                
                if ($content.status -eq "healthy" -or $content.status -eq "ok") {
                    Write-Host "✅ Health check PASSED" -ForegroundColor Green
                    return $true
                } else {
                    Write-Host "⚠️  Service responded but status is not healthy" -ForegroundColor Yellow
                }
            }
        } catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "✗ Failed (HTTP $statusCode)" -ForegroundColor Red
        }
        
        $retryCount++
        if ($retryCount -lt $MaxRetries) {
            Write-Host "  Retrying in $RetryDelay seconds..."
            Start-Sleep -Seconds $RetryDelay
        }
    }
    
    Write-Host "❌ Health check FAILED after $MaxRetries attempts" -ForegroundColor Red
    return $false
}

###############################################################################
# Function: Smoke Tests
###############################################################################
function Invoke-SmokeTests {
    Write-Host ""
    Write-Host "🧪 Running Smoke Tests..." -ForegroundColor Yellow
    
    if (-not (Test-Path "package.json")) {
        Write-Host "⚠️  package.json not found. Skipping smoke tests." -ForegroundColor Yellow
        Write-Host "   Run this script from the project root directory to execute smoke tests."
        return $true
    }
    
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if (-not $packageJson.scripts."test:smoke") {
        Write-Host "⚠️  Smoke test script not found in package.json. Skipping." -ForegroundColor Yellow
        return $true
    }
    
    # Set environment variable for tests
    $env:APP_URL = $AppUrl
    
    try {
        npm run test:smoke
        Write-Host "✅ Smoke tests PASSED" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Smoke tests FAILED" -ForegroundColor Red
        return $false
    }
}

###############################################################################
# Function: Basic Endpoint Check
###############################################################################
function Test-Endpoints {
    Write-Host ""
    Write-Host "🌐 Checking Critical Endpoints..." -ForegroundColor Yellow
    
    $endpoints = @(
        "/",
        "/api/health",
        "/api/auth/login"
    )
    
    $failed = 0
    
    foreach ($endpoint in $endpoints) {
        $url = "$AppUrl$endpoint"
        Write-Host "  Checking $endpoint... " -NoNewline
        
        try {
            $response = Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing -TimeoutSec 10
            $statusCode = $response.StatusCode
            
            # 200-299 are success, 401/403 mean endpoint exists (auth required)
            if ($statusCode -ge 200 -and $statusCode -lt 300 -or $statusCode -eq 401 -or $statusCode -eq 403) {
                Write-Host "✓ OK (HTTP $statusCode)" -ForegroundColor Green
            } else {
                Write-Host "✗ Failed (HTTP $statusCode)" -ForegroundColor Red
                $failed++
            }
        } catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -eq 401 -or $statusCode -eq 403) {
                Write-Host "✓ OK (HTTP $statusCode - Auth required)" -ForegroundColor Green
            } else {
                Write-Host "✗ Failed (HTTP $statusCode)" -ForegroundColor Red
                $failed++
            }
        }
    }
    
    if ($failed -eq 0) {
        Write-Host "✅ All endpoints accessible" -ForegroundColor Green
        return $true
    } else {
        Write-Host "⚠️  $failed endpoint(s) failed" -ForegroundColor Yellow
        return $false
    }
}

###############################################################################
# Function: Response Time Check
###############################################################################
function Test-ResponseTime {
    Write-Host ""
    Write-Host "⏱️  Checking Response Time..." -ForegroundColor Yellow
    
    $healthUrl = "$AppUrl/api/health"
    $startTime = Get-Date
    
    try {
        Invoke-WebRequest -Uri $healthUrl -Method Get -UseBasicParsing -TimeoutSec 30 | Out-Null
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds
        
        Write-Host "  Response time: $([math]::Round($duration, 0))ms"
        
        if ($duration -lt 2000) {
            Write-Host "✅ Response time acceptable (<2s)" -ForegroundColor Green
            return $true
        } elseif ($duration -lt 5000) {
            Write-Host "⚠️  Response time slow (2-5s)" -ForegroundColor Yellow
            return $true
        } else {
            Write-Host "❌ Response time too slow (>5s)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Failed to measure response time" -ForegroundColor Red
        return $false
    }
}

###############################################################################
# Main Execution
###############################################################################
$allPassed = $true

# Run all checks
if (-not (Test-HealthCheck)) { $allPassed = $false }
if (-not (Test-Endpoints)) { $allPassed = $false }
if (-not (Test-ResponseTime)) { $allPassed = $false }
if (-not (Invoke-SmokeTests)) { $allPassed = $false }

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "✅ VERIFICATION SUCCESSFUL" -ForegroundColor Green
    Write-Host "All checks passed. Deployment is healthy."
    exit 0
} else {
    Write-Host "❌ VERIFICATION FAILED" -ForegroundColor Red
    Write-Host "One or more checks failed. Consider rolling back."
    exit 1
}
Write-Host "==================================================" -ForegroundColor Cyan
