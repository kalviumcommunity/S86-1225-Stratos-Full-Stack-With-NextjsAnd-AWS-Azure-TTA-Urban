###############################################################################
# AWS ECS Rollback Script (PowerShell)
# Rolls back an ECS service to the previous task definition
# Usage: .\rollback-aws-ecs.ps1 [-Region <region>] [-Cluster <cluster>] [-Service <service>]
###############################################################################

param(
    [Parameter(Mandatory=$false)]
    [string]$Region = "ap-south-1",
    
    [Parameter(Mandatory=$false)]
    [string]$Cluster = "ttaurban-cluster",
    
    [Parameter(Mandatory=$false)]
    [string]$Service = "ttaurban-service"
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🔄 AWS ECS Rollback Script" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Region: $Region"
Write-Host "Cluster: $Cluster"
Write-Host "Service: $Service"
Write-Host ""

###############################################################################
# Function: Check AWS CLI
###############################################################################
function Test-AwsCli {
    if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
        Write-Host "❌ AWS CLI is not installed" -ForegroundColor Red
        Write-Host "Please install AWS CLI: https://aws.amazon.com/cli/"
        exit 1
    }
    
    # Check AWS credentials
    try {
        aws sts get-caller-identity | Out-Null
        Write-Host "✓ AWS CLI configured" -ForegroundColor Green
    } catch {
        Write-Host "❌ AWS credentials not configured" -ForegroundColor Red
        Write-Host "Please run: aws configure"
        exit 1
    }
}

###############################################################################
# Function: Get Current Task Definition
###############################################################################
function Get-CurrentTaskDefinition {
    Write-Host ""
    Write-Host "📋 Getting current service configuration..."
    
    $currentTaskDef = aws ecs describe-services `
        --cluster $Cluster `
        --services $Service `
        --region $Region `
        --query "services[0].taskDefinition" `
        --output text
    
    if ([string]::IsNullOrEmpty($currentTaskDef) -or $currentTaskDef -eq "None") {
        Write-Host "❌ Failed to get current task definition" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Current task definition: $currentTaskDef"
    
    # Extract task definition family and revision
    $taskFamily = $currentTaskDef -replace '.*/(.+):.+', '$1'
    $currentRevision = [int]($currentTaskDef -replace '.*:(\d+)$', '$1')
    
    Write-Host "Task family: $taskFamily"
    Write-Host "Current revision: $currentRevision"
    
    return @{
        TaskDef = $currentTaskDef
        Family = $taskFamily
        Revision = $currentRevision
    }
}

###############################################################################
# Function: Get Previous Task Definition
###############################################################################
function Get-PreviousTaskDefinition {
    param($Current)
    
    Write-Host ""
    Write-Host "🔍 Finding previous task definition..."
    
    if ($Current.Revision -le 1) {
        Write-Host "⚠️  No previous revision available (current is revision 1)" -ForegroundColor Yellow
        Write-Host "Cannot rollback. Consider deploying a known good version instead."
        exit 1
    }
    
    $previousRevision = $Current.Revision - 1
    $previousTaskDef = "$($Current.Family):$previousRevision"
    
    # Verify previous task definition exists
    try {
        aws ecs describe-task-definition `
            --task-definition $previousTaskDef `
            --region $Region | Out-Null
        Write-Host "✓ Previous task definition found: $previousTaskDef" -ForegroundColor Green
    } catch {
        Write-Host "❌ Previous task definition not found: $previousTaskDef" -ForegroundColor Red
        exit 1
    }
    
    return @{
        TaskDef = $previousTaskDef
        Revision = $previousRevision
    }
}

###############################################################################
# Function: Confirm Rollback
###############################################################################
function Confirm-Rollback {
    param($Current, $Previous)
    
    Write-Host ""
    Write-Host "⚠️  WARNING: About to rollback deployment" -ForegroundColor Yellow
    Write-Host "  From: $($Current.TaskDef) (revision $($Current.Revision))"
    Write-Host "  To:   $($Previous.TaskDef) (revision $($Previous.Revision))"
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
function Invoke-Rollback {
    param($PreviousTaskDef)
    
    Write-Host ""
    Write-Host "🔄 Performing rollback..."
    
    aws ecs update-service `
        --cluster $Cluster `
        --service $Service `
        --task-definition $PreviousTaskDef `
        --region $Region `
        --force-new-deployment | Out-Null
    
    Write-Host "✓ Rollback initiated" -ForegroundColor Green
}

###############################################################################
# Function: Wait for Service Stability
###############################################################################
function Wait-ServiceStability {
    Write-Host ""
    Write-Host "⏳ Waiting for service to stabilize (this may take several minutes)..."
    
    try {
        aws ecs wait services-stable `
            --cluster $Cluster `
            --services $Service `
            --region $Region
        Write-Host "✓ Service is stable" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Service stability check timed out" -ForegroundColor Yellow
        Write-Host "Please check the ECS console for service status."
        exit 1
    }
}

###############################################################################
# Function: Verify Rollback
###############################################################################
function Test-Rollback {
    param($ExpectedRevision)
    
    Write-Host ""
    Write-Host "🔍 Verifying rollback..."
    
    $newTaskDef = aws ecs describe-services `
        --cluster $Cluster `
        --services $Service `
        --region $Region `
        --query "services[0].taskDefinition" `
        --output text
    
    if ($newTaskDef -match ":$ExpectedRevision`$") {
        Write-Host "✅ Rollback successful!" -ForegroundColor Green
        Write-Host "Service is now running: $newTaskDef"
    } else {
        Write-Host "❌ Rollback verification failed" -ForegroundColor Red
        Write-Host "Expected revision: $ExpectedRevision"
        Write-Host "Current: $newTaskDef"
        exit 1
    }
}

###############################################################################
# Main Execution
###############################################################################
Test-AwsCli
$current = Get-CurrentTaskDefinition
$previous = Get-PreviousTaskDefinition -Current $current
Confirm-Rollback -Current $current -Previous $previous
Invoke-Rollback -PreviousTaskDef $previous.TaskDef
Wait-ServiceStability
Test-Rollback -ExpectedRevision $previous.Revision

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✅ ROLLBACK COMPLETE" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Rolled back from revision $($current.Revision) to $($previous.Revision)"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Run health checks: .\scripts\verify-deployment.ps1 -AppUrl <APP_URL>"
Write-Host "2. Monitor CloudWatch logs for errors"
Write-Host "3. Check application metrics in CloudWatch dashboard"
Write-Host "==================================================" -ForegroundColor Cyan
