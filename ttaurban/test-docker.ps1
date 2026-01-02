# Docker Build and Test Script for Windows PowerShell

Write-Host "🐳 TTA Urban - Docker Build and Test Script" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Configuration
$IMAGE_NAME = "ttaurban"
$IMAGE_TAG = "test"
$CONTAINER_NAME = "ttaurban-test"
$PORT = 3000

# Function to print colored output
function Write-Step {
    param($Message)
    Write-Host "`n✓ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param($Message)
    Write-Host "`n✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param($Message)
    Write-Host "  $Message" -ForegroundColor Yellow
}

# Step 1: Check Docker installation
Write-Step "Checking Docker installation..."
try {
    $dockerVersion = docker --version
    Write-Info $dockerVersion
} catch {
    Write-Error-Custom "Docker is not installed or not in PATH"
    exit 1
}

# Step 2: Clean up existing containers and images
Write-Step "Cleaning up existing test containers..."
docker stop $CONTAINER_NAME 2>$null
docker rm $CONTAINER_NAME 2>$null
docker rmi ${IMAGE_NAME}:${IMAGE_TAG} 2>$null

# Step 3: Build Docker image
Write-Step "Building Docker image..."
Write-Info "This may take a few minutes..."

$buildStart = Get-Date
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} . 2>&1 | Tee-Object -Variable buildOutput

if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Docker build failed!"
    Write-Host $buildOutput
    exit 1
}

$buildDuration = (Get-Date) - $buildStart
Write-Info "Build completed in $([math]::Round($buildDuration.TotalSeconds, 2)) seconds"

# Step 4: Check image size
Write-Step "Checking image size..."
$imageSize = docker images ${IMAGE_NAME}:${IMAGE_TAG} --format "{{.Size}}"
Write-Info "Image size: $imageSize"

# Step 5: Run container
Write-Step "Starting container..."
docker run -d `
    --name $CONTAINER_NAME `
    -p ${PORT}:${PORT} `
    -e NODE_ENV=production `
    -e NEXTAUTH_SECRET=test-secret-key `
    -e JWT_SECRET=test-jwt-secret `
    ${IMAGE_NAME}:${IMAGE_TAG}

if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Failed to start container!"
    exit 1
}

Write-Info "Container started successfully"

# Step 6: Wait for container to be ready
Write-Step "Waiting for application to start..."
Write-Info "This may take 10-15 seconds..."

$maxRetries = 30
$retryCount = 0
$ready = $false

while ($retryCount -lt $maxRetries -and -not $ready) {
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:${PORT}/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $ready = $true
        }
    } catch {
        $retryCount++
        Write-Host "." -NoNewline
    }
}

Write-Host ""

if ($ready) {
    Write-Step "Health check passed!"
    Write-Info "Application is responding on http://localhost:${PORT}"
} else {
    Write-Error-Custom "Health check failed after $maxRetries seconds"
    Write-Host "`nContainer logs:" -ForegroundColor Yellow
    docker logs $CONTAINER_NAME
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
    exit 1
}

# Step 7: Show container information
Write-Step "Container Information:"
docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Step 8: Show container logs
Write-Step "Container Logs (last 20 lines):"
docker logs --tail 20 $CONTAINER_NAME

# Step 9: Test health endpoint
Write-Step "Testing health endpoint..."
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:${PORT}/api/health" -Method Get
    Write-Info "Health endpoint response:"
    Write-Host ($healthResponse | ConvertTo-Json) -ForegroundColor Cyan
} catch {
    Write-Error-Custom "Failed to test health endpoint"
}

# Summary
Write-Host "`n=========================================`n" -ForegroundColor Cyan
Write-Host "✅ Docker build and test completed successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Visit http://localhost:${PORT} to view your app" -ForegroundColor White
Write-Host "  2. View logs: docker logs -f $CONTAINER_NAME" -ForegroundColor White
Write-Host "  3. Stop container: docker stop $CONTAINER_NAME" -ForegroundColor White
Write-Host "  4. Remove container: docker rm $CONTAINER_NAME" -ForegroundColor White
Write-Host "`nTo clean up:" -ForegroundColor Yellow
Write-Host "  docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME && docker rmi ${IMAGE_NAME}:${IMAGE_TAG}" -ForegroundColor White
Write-Host ""
