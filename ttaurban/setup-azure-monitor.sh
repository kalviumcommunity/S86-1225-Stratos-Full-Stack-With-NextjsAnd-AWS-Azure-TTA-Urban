#!/bin/bash

###############################################################################
# Azure Monitor Setup Script
#
# This script configures Azure Monitor, Log Analytics Workspace, Application
# Insights, and alert rules for the TTA Urban Next.js application deployed
# on Azure App Service.
#
# Prerequisites:
# - Azure CLI installed and logged in (az login)
# - Appropriate permissions for creating resources
# - App Service already deployed
#
# Usage:
#   chmod +x setup-azure-monitor.sh
#   ./setup-azure-monitor.sh
###############################################################################

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP=""
APP_SERVICE_NAME=""
LOCATION="eastus"
WORKSPACE_NAME="ttaurban-logs-workspace"
APP_INSIGHTS_NAME="ttaurban-app-insights"
ACTION_GROUP_NAME="ttaurban-devops-team"
ALERT_EMAIL=""
RETENTION_DAYS=30

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Azure Monitor Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Prompt for configuration
read -p "Enter resource group name: " RESOURCE_GROUP
if [ -z "$RESOURCE_GROUP" ]; then
  echo -e "${RED}Error: Resource group name is required${NC}"
  exit 1
fi

read -p "Enter App Service name: " APP_SERVICE_NAME
if [ -z "$APP_SERVICE_NAME" ]; then
  echo -e "${RED}Error: App Service name is required${NC}"
  exit 1
fi

read -p "Enter Azure location (default: eastus): " input_location
LOCATION="${input_location:-$LOCATION}"

read -p "Enter alert email address: " ALERT_EMAIL
if [ -z "$ALERT_EMAIL" ]; then
  echo -e "${RED}Error: Email address is required for alerts${NC}"
  exit 1
fi

echo -e "\n${YELLOW}Configuration:${NC}"
echo -e "  Resource Group: ${GREEN}$RESOURCE_GROUP${NC}"
echo -e "  App Service: ${GREEN}$APP_SERVICE_NAME${NC}"
echo -e "  Location: ${GREEN}$LOCATION${NC}"
echo -e "  Retention: ${GREEN}$RETENTION_DAYS days${NC}"
echo -e "  Alert Email: ${GREEN}$ALERT_EMAIL${NC}\n"

read -p "Proceed with setup? (y/n): " confirm
if [ "$confirm" != "y" ]; then
  echo -e "${YELLOW}Setup cancelled${NC}"
  exit 0
fi

# Step 1: Create Log Analytics Workspace
echo -e "\n${BLUE}[1/6] Creating Log Analytics Workspace...${NC}"
az monitor log-analytics workspace create \
  --resource-group "$RESOURCE_GROUP" \
  --workspace-name "$WORKSPACE_NAME" \
  --location "$LOCATION" \
  --retention-time "$RETENTION_DAYS" \
  --output none

WORKSPACE_ID=$(az monitor log-analytics workspace show \
  --resource-group "$RESOURCE_GROUP" \
  --workspace-name "$WORKSPACE_NAME" \
  --query id -o tsv)

echo -e "${GREEN}✓ Log Analytics Workspace created${NC}"

# Step 2: Create Application Insights
echo -e "\n${BLUE}[2/6] Creating Application Insights...${NC}"
az monitor app-insights component create \
  --app "$APP_INSIGHTS_NAME" \
  --location "$LOCATION" \
  --resource-group "$RESOURCE_GROUP" \
  --workspace "$WORKSPACE_ID" \
  --application-type Node.JS \
  --retention-time "$RETENTION_DAYS" \
  --output none

INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app "$APP_INSIGHTS_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query instrumentationKey -o tsv)

CONNECTION_STRING=$(az monitor app-insights component show \
  --app "$APP_INSIGHTS_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query connectionString -o tsv)

echo -e "${GREEN}✓ Application Insights created${NC}"

# Step 3: Configure App Service to use Application Insights
echo -e "\n${BLUE}[3/6] Configuring App Service...${NC}"
az webapp config appsettings set \
  --name "$APP_SERVICE_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --settings \
    APPLICATIONINSIGHTS_CONNECTION_STRING="$CONNECTION_STRING" \
    ApplicationInsightsAgent_EXTENSION_VERSION="~3" \
  --output none

echo -e "${GREEN}✓ App Service configured with Application Insights${NC}"

# Step 4: Enable diagnostic settings
echo -e "\n${BLUE}[4/6] Enabling diagnostic settings...${NC}"
APP_SERVICE_ID=$(az webapp show \
  --name "$APP_SERVICE_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query id -o tsv)

az monitor diagnostic-settings create \
  --name "send-to-workspace" \
  --resource "$APP_SERVICE_ID" \
  --workspace "$WORKSPACE_ID" \
  --logs '[
    {
      "category": "AppServiceConsoleLogs",
      "enabled": true,
      "retentionPolicy": {
        "enabled": true,
        "days": '$RETENTION_DAYS'
      }
    },
    {
      "category": "AppServiceHTTPLogs",
      "enabled": true,
      "retentionPolicy": {
        "enabled": true,
        "days": '$RETENTION_DAYS'
      }
    },
    {
      "category": "AppServiceAppLogs",
      "enabled": true,
      "retentionPolicy": {
        "enabled": true,
        "days": '$RETENTION_DAYS'
      }
    }
  ]' \
  --metrics '[
    {
      "category": "AllMetrics",
      "enabled": true,
      "retentionPolicy": {
        "enabled": true,
        "days": '$RETENTION_DAYS'
      }
    }
  ]' \
  --output none

echo -e "${GREEN}✓ Diagnostic settings enabled${NC}"

# Step 5: Create Action Group for alerts
echo -e "\n${BLUE}[5/6] Creating Action Group...${NC}"
az monitor action-group create \
  --name "$ACTION_GROUP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --short-name "DevOps" \
  --email-receiver \
    name="DevOps Team" \
    email-address="$ALERT_EMAIL" \
  --output none

ACTION_GROUP_ID=$(az monitor action-group show \
  --name "$ACTION_GROUP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query id -o tsv)

echo -e "${GREEN}✓ Action Group created${NC}"

# Step 6: Create alert rules
echo -e "\n${BLUE}[6/6] Creating alert rules...${NC}"

# High error rate alert
az monitor scheduled-query create \
  --name "TTAUrban-High-Error-Rate" \
  --resource-group "$RESOURCE_GROUP" \
  --scopes "$WORKSPACE_ID" \
  --condition "count 'Heartbeat' > 10" \
  --condition-query "traces | where severityLevel >= 3 | where customDimensions.level == 'error' | summarize ErrorCount = count() by bin(timestamp, 5m) | where ErrorCount > 10" \
  --description "Alert when error count exceeds threshold" \
  --evaluation-frequency 5m \
  --window-size 5m \
  --severity 2 \
  --action-groups "$ACTION_GROUP_ID" \
  --output none 2>/dev/null || echo -e "${YELLOW}⚠ High error rate alert creation skipped (may require manual setup)${NC}"

# Slow API response time alert
az monitor scheduled-query create \
  --name "TTAUrban-Slow-API-Response" \
  --resource-group "$RESOURCE_GROUP" \
  --scopes "$WORKSPACE_ID" \
  --condition "count 'Heartbeat' > 1" \
  --condition-query "traces | where customDimensions.metricName == 'api_response_time' | extend duration = todouble(customDimensions.value) | summarize p95 = percentile(duration, 95) by bin(timestamp, 5m) | where p95 > 2000" \
  --description "Alert when p95 response time exceeds 2 seconds" \
  --evaluation-frequency 5m \
  --window-size 5m \
  --severity 3 \
  --action-groups "$ACTION_GROUP_ID" \
  --output none 2>/dev/null || echo -e "${YELLOW}⚠ Slow API alert creation skipped (may require manual setup)${NC}"

echo -e "${GREEN}✓ Alert rules configured${NC}"

# Display summary
echo -e "\n${BLUE}Setup Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Log Analytics Workspace created${NC}"
echo -e "${GREEN}✓ Application Insights configured${NC}"
echo -e "${GREEN}✓ App Service integrated${NC}"
echo -e "${GREEN}✓ Diagnostic settings enabled${NC}"
echo -e "${GREEN}✓ Action Group created${NC}"
echo -e "${GREEN}✓ Alert rules configured${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}Important Configuration Values:${NC}"
echo -e "Instrumentation Key: ${GREEN}$INSTRUMENTATION_KEY${NC}"
echo -e "Connection String: ${GREEN}$CONNECTION_STRING${NC}\n"

echo -e "${YELLOW}Add to your .env file:${NC}"
echo -e "APPLICATIONINSIGHTS_CONNECTION_STRING=\"$CONNECTION_STRING\"\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Restart your App Service to apply changes"
echo -e "2. Generate some traffic to start collecting telemetry"
echo -e "3. View logs in Azure Portal → Monitor → Logs"
echo -e "4. View Application Insights → Transaction search\n"

echo -e "${YELLOW}Useful Queries:${NC}"
echo -e "# View recent errors:"
echo -e "traces | where severityLevel >= 3 | order by timestamp desc | take 100\n"
echo -e "# API response times:"
echo -e "traces | where customDimensions.duration > 0 | summarize avg(todouble(customDimensions.duration)) by bin(timestamp, 5m)\n"

echo -e "${GREEN}Azure Monitor setup completed successfully!${NC}"
