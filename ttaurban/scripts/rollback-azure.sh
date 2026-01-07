#!/bin/bash

###############################################################################
# Azure App Service Rollback Script
# Rolls back an Azure App Service to the previous container image
# Usage: ./rollback-azure.sh [OPTIONS]
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
RESOURCE_GROUP="${RESOURCE_GROUP:-ttaurban-rg}"
APP_NAME="${APP_NAME:-ttaurban-app}"
ACR_NAME="${ACR_NAME:-ttaurbanregistry}"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --resource-group)
            RESOURCE_GROUP="$2"
            shift 2
            ;;
        --app-name)
            APP_NAME="$2"
            shift 2
            ;;
        --acr-name)
            ACR_NAME="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --resource-group RG  Resource group name (default: ttaurban-rg)"
            echo "  --app-name NAME      App service name (default: ttaurban-app)"
            echo "  --acr-name NAME      ACR name (default: ttaurbanregistry)"
            echo "  --help              Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "=================================================="
echo -e "${YELLOW}🔄 Azure App Service Rollback Script${NC}"
echo "=================================================="
echo "Resource Group: $RESOURCE_GROUP"
echo "App Name: $APP_NAME"
echo "ACR Name: $ACR_NAME"
echo ""

###############################################################################
# Function: Check Azure CLI
###############################################################################
check_azure_cli() {
    if ! command -v az &> /dev/null; then
        echo -e "${RED}❌ Azure CLI is not installed${NC}"
        echo "Please install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    fi
    
    # Check if logged in
    if ! az account show &> /dev/null; then
        echo -e "${RED}❌ Not logged in to Azure${NC}"
        echo "Please run: az login"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Azure CLI configured${NC}"
}

###############################################################################
# Function: Get Current Container Image
###############################################################################
get_current_image() {
    echo ""
    echo "📋 Getting current container configuration..."
    
    CURRENT_IMAGE=$(az webapp config container show \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "image" \
        --output tsv)
    
    if [ -z "$CURRENT_IMAGE" ] || [ "$CURRENT_IMAGE" == "None" ]; then
        echo -e "${RED}❌ Failed to get current container image${NC}"
        exit 1
    fi
    
    echo "Current image: $CURRENT_IMAGE"
}

###############################################################################
# Function: Get Deployment History
###############################################################################
get_deployment_history() {
    echo ""
    echo "🔍 Retrieving deployment history..."
    
    # Get deployment logs
    DEPLOYMENTS=$(az webapp deployment list \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "[].{id:id, status:status, author:author, timestamp:end_time}" \
        --output table 2>/dev/null || echo "")
    
    if [ -n "$DEPLOYMENTS" ]; then
        echo "$DEPLOYMENTS"
    else
        echo -e "${YELLOW}⚠️  Unable to retrieve deployment history${NC}"
    fi
}

###############################################################################
# Function: Confirm Rollback
###############################################################################
confirm_rollback() {
    echo ""
    echo -e "${YELLOW}⚠️  WARNING: About to rollback deployment${NC}"
    echo "  Current: $CURRENT_IMAGE"
    echo "  Rolling back to: ${ACR_NAME}.azurecr.io/ttaurban:latest"
    echo ""
    echo "Note: This will redeploy the 'latest' tag from ACR."
    echo "In production, you should use specific version tags."
    echo ""
    read -p "Are you sure you want to proceed? (yes/no): " -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "Rollback cancelled."
        exit 0
    fi
}

###############################################################################
# Function: Perform Rollback
###############################################################################
perform_rollback() {
    echo ""
    echo "🔄 Performing rollback..."
    
    # Set container to use 'latest' tag (previous stable version)
    az webapp config container set \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --docker-custom-image-name "${ACR_NAME}.azurecr.io/ttaurban:latest" \
        > /dev/null
    
    echo -e "${GREEN}✓ Container image updated${NC}"
}

###############################################################################
# Function: Restart App Service
###############################################################################
restart_app_service() {
    echo ""
    echo "🔄 Restarting App Service..."
    
    az webapp restart \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        > /dev/null
    
    echo -e "${GREEN}✓ App Service restarted${NC}"
}

###############################################################################
# Function: Wait for Restart
###############################################################################
wait_for_restart() {
    echo ""
    echo "⏳ Waiting for App Service to restart (60 seconds)..."
    sleep 60
    echo -e "${GREEN}✓ Wait complete${NC}"
}

###############################################################################
# Function: Verify Rollback
###############################################################################
verify_rollback() {
    echo ""
    echo "🔍 Verifying rollback..."
    
    NEW_IMAGE=$(az webapp config container show \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "image" \
        --output tsv)
    
    echo "New image: $NEW_IMAGE"
    
    # Get app URL
    APP_URL=$(az webapp show \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "defaultHostName" \
        --output tsv)
    
    echo "App URL: https://$APP_URL"
    
    # Try to hit health endpoint
    echo ""
    echo "Testing health endpoint..."
    sleep 10
    
    if curl -f "https://$APP_URL/api/health" &> /dev/null; then
        echo -e "${GREEN}✅ Rollback successful! Health check passed.${NC}"
    else
        echo -e "${YELLOW}⚠️  Rollback completed but health check failed${NC}"
        echo "Please manually verify the application at: https://$APP_URL"
    fi
}

###############################################################################
# Main Execution
###############################################################################
main() {
    check_azure_cli
    get_current_image
    get_deployment_history
    confirm_rollback
    perform_rollback
    restart_app_service
    wait_for_restart
    verify_rollback
    
    echo ""
    echo "=================================================="
    echo -e "${GREEN}✅ ROLLBACK COMPLETE${NC}"
    echo "=================================================="
    echo "Previous image: $CURRENT_IMAGE"
    echo "Current image: ${ACR_NAME}.azurecr.io/ttaurban:latest"
    echo ""
    echo "Next steps:"
    echo "1. Run health checks: ./scripts/verify-deployment.sh https://$APP_URL"
    echo "2. Monitor Azure Application Insights for errors"
    echo "3. Check App Service logs in Azure Portal"
    echo "=================================================="
}

# Run main function
main
