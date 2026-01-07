###############################################################################
# Azure App Service Rollback Script (PowerShell)
# Rolls back an Azure App Service to the previous container image
# Usage: .\rollback-azure.ps1 [-ResourceGroup <rg>] [-AppName <name>] [-AcrName <name>]
###############################################################################

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "ttaurban-rg",
    
    [Parameter(Mandatory=$false)]
    [string]$AppName = "ttaurban-app",
    
    [Parameter(Mandatory=$false)]
    [string]$AcrName = "ttaurbanregistry"
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🔄 Azure App Service Rollback Script" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Resource Group: $ResourceGroup"
Write-Host "App Name: $AppName"
Write-Host "ACR Name: $AcrName"
Write-Host ""

###############################################################################
# Function: Check Azure CLI
###############################################################################
function Test-AzureCli {
    if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Azure CLI is not installed" -ForegroundColor Red
        Write-Host "Please install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    }
    
    # Check if logged in
    try {
        az account show | Out-Null
        Write-Host "✓ Azure CLI configured" -ForegroundColor Green
    } catch {
        Write-Host "❌ Not logged in to Azure" -ForegroundColor Red
        Write-Host "Please run: az login"
        exit 1
    }
}

###############################################################################
# Function: Get Current Container Image
###############################################################################
function Get-CurrentImage {
    Write-Host ""
    Write-Host "📋 Getting current container configuration..."
    
    $currentImage = az webapp config container show `
        --name $AppName `
        --resource-group $ResourceGroup `
        --query "image" `
        --output tsv
    
    if ([string]::IsNullOrEmpty($currentImage) -or $currentImage -eq "None") {
        Write-Host "❌ Failed to get current container image" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Current image: $currentImage"
    return $currentImage
}

###############################################################################
# Function: Get Deployment History
###############################################################################
function Get-DeploymentHistory {
    Write-Host ""
    Write-Host "🔍 Retrieving deployment history..."
    
    try {
        $deployments = az webapp deployment list `
            --name $AppName `
            --resource-group $ResourceGroup `
            --query "[].{id:id, status:status, author:author, timestamp:end_time}" `
            --output table
        
        if ($deployments) {
            Write-Host $deployments
        }
    } catch {
        Write-Host "⚠️  Unable to retrieve deployment history" -ForegroundColor Yellow
    }
}

###############################################################################
# Function: Confirm Rollback
###############################################################################
function Confirm-RollbackAction {
    param($CurrentImage)
    
    Write-Host ""
    Write-Host "⚠️  WARNING: About to rollback deployment" -ForegroundColor Yellow
    Write-Host "  Current: $CurrentImage"
    Write-Host "  Rolling back to: $AcrName.azurecr.io/ttaurban:latest"
    Write-Host ""
    Write-Host "Note: This will redeploy the 'latest' tag from ACR."
    Write-Host "In production, you should use specific version tags."
    Write-Host ""
    
    $confirmation = Read-Host "Are you sure you want to proceed? (yes/no)"
    
    if ($confirmation -ne "yes") {
        Write-Host "Rollback cancelled."
        exit 0
    }
}

###############################################################################
# Function: Perform Rollback
###############################################################################
function Invoke-RollbackAction {
    Write-Host ""
    Write-Host "🔄 Performing rollback..."
    
    az webapp config container set `
        --name $AppName `
        --resource-group $ResourceGroup `
        --docker-custom-image-name "$AcrName.azurecr.io/ttaurban:latest" | Out-Null
    
    Write-Host "✓ Container image updated" -ForegroundColor Green
}

###############################################################################
# Function: Restart App Service
###############################################################################
function Restart-AppService {
    Write-Host ""
    Write-Host "🔄 Restarting App Service..."
    
    az webapp restart `
        --name $AppName `
        --resource-group $ResourceGroup | Out-Null
    
    Write-Host "✓ App Service restarted" -ForegroundColor Green
}

###############################################################################
# Function: Wait for Restart
###############################################################################
function Wait-AppServiceRestart {
    Write-Host ""
    Write-Host "⏳ Waiting for App Service to restart (60 seconds)..."
    Start-Sleep -Seconds 60
    Write-Host "✓ Wait complete" -ForegroundColor Green
}

###############################################################################
# Function: Verify Rollback
###############################################################################
function Test-RollbackSuccess {
    Write-Host ""
    Write-Host "🔍 Verifying rollback..."
    
    $newImage = az webapp config container show `
        --name $AppName `
        --resource-group $ResourceGroup `
        --query "image" `
        --output tsv
    
    Write-Host "New image: $newImage"
    
    # Get app URL
    $appUrl = az webapp show `
        --name $AppName `
        --resource-group $ResourceGroup `
        --query "defaultHostName" `
        --output tsv
    
    Write-Host "App URL: https://$appUrl"
    
    # Try to hit health endpoint
    Write-Host ""
    Write-Host "Testing health endpoint..."
    Start-Sleep -Seconds 10
    
    try {
        $response = Invoke-WebRequest -Uri "https://$appUrl/api/health" -UseBasicParsing -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Rollback successful! Health check passed." -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  Rollback completed but health check failed" -ForegroundColor Yellow
        Write-Host "Please manually verify the application at: https://$appUrl"
    }
    
    return $appUrl
}

###############################################################################
# Main Execution
###############################################################################
Test-AzureCli
$currentImage = Get-CurrentImage
Get-DeploymentHistory
Confirm-RollbackAction -CurrentImage $currentImage
Invoke-RollbackAction
Restart-AppService
Wait-AppServiceRestart
$appUrl = Test-RollbackSuccess

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✅ ROLLBACK COMPLETE" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Previous image: $currentImage"
Write-Host "Current image: $AcrName.azurecr.io/ttaurban:latest"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Run health checks: .\scripts\verify-deployment.ps1 -AppUrl https://$appUrl"
Write-Host "2. Monitor Azure Application Insights for errors"
Write-Host "3. Check App Service logs in Azure Portal"
Write-Host "==================================================" -ForegroundColor Cyan
