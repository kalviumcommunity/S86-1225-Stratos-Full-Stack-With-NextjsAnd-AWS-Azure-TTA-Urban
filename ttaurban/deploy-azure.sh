#!/bin/bash

# Azure App Service Deployment Script
# This script automates the deployment process to Azure App Service for Containers

set -e

# Configuration
RESOURCE_GROUP="ttaurban-rg"
ACR_NAME="ttaurbanregistry"
APP_SERVICE_PLAN="ttaurban-plan"
WEB_APP_NAME="ttaurban-app"
LOCATION="centralindia"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Azure App Service Deployment...${NC}"

# Step 1: Create Resource Group (if not exists)
echo -e "${GREEN}Step 1: Creating/Verifying Resource Group...${NC}"
az group create --name ${RESOURCE_GROUP} --location ${LOCATION} || true

# Step 2: Create Azure Container Registry (if not exists)
echo -e "${GREEN}Step 2: Creating/Verifying Azure Container Registry...${NC}"
az acr create \
  --resource-group ${RESOURCE_GROUP} \
  --name ${ACR_NAME} \
  --sku Basic \
  --location ${LOCATION} || true

# Step 3: Enable Admin Access to ACR
echo -e "${GREEN}Step 3: Enabling admin access to ACR...${NC}"
az acr update --name ${ACR_NAME} --admin-enabled true

# Step 4: Login to ACR
echo -e "${GREEN}Step 4: Logging in to ACR...${NC}"
az acr login --name ${ACR_NAME}

# Step 5: Build and Push Docker Image to ACR
echo -e "${GREEN}Step 5: Building and pushing Docker image...${NC}"
az acr build \
  --registry ${ACR_NAME} \
  --image ttaurban:latest \
  --image ttaurban:$(git rev-parse --short HEAD) \
  --file Dockerfile \
  .

# Step 6: Get ACR Credentials
echo -e "${GREEN}Step 6: Retrieving ACR credentials...${NC}"
ACR_USERNAME=$(az acr credential show --name ${ACR_NAME} --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name ${ACR_NAME} --query passwords[0].value --output tsv)
ACR_LOGIN_SERVER=$(az acr show --name ${ACR_NAME} --query loginServer --output tsv)

# Step 7: Create App Service Plan (if not exists)
echo -e "${GREEN}Step 7: Creating/Verifying App Service Plan...${NC}"
az appservice plan create \
  --name ${APP_SERVICE_PLAN} \
  --resource-group ${RESOURCE_GROUP} \
  --is-linux \
  --sku B1 \
  --location ${LOCATION} || true

# Step 8: Create Web App
echo -e "${GREEN}Step 8: Creating/Updating Web App...${NC}"
az webapp create \
  --resource-group ${RESOURCE_GROUP} \
  --plan ${APP_SERVICE_PLAN} \
  --name ${WEB_APP_NAME} \
  --deployment-container-image-name ${ACR_LOGIN_SERVER}/ttaurban:latest || true

# Step 9: Configure Container Settings
echo -e "${GREEN}Step 9: Configuring container settings...${NC}"
az webapp config container set \
  --name ${WEB_APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --docker-custom-image-name ${ACR_LOGIN_SERVER}/ttaurban:latest \
  --docker-registry-server-url https://${ACR_LOGIN_SERVER} \
  --docker-registry-server-user ${ACR_USERNAME} \
  --docker-registry-server-password ${ACR_PASSWORD}

# Step 10: Configure App Settings
echo -e "${GREEN}Step 10: Configuring app settings...${NC}"
az webapp config appsettings set \
  --name ${WEB_APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --settings \
    WEBSITES_PORT=3000 \
    NODE_ENV=production \
    WEBSITES_ENABLE_APP_SERVICE_STORAGE=false

# Step 11: Enable Continuous Deployment
echo -e "${GREEN}Step 11: Enabling continuous deployment...${NC}"
az webapp deployment container config \
  --name ${WEB_APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --enable-cd true

# Step 12: Configure Health Check
echo -e "${GREEN}Step 12: Configuring health check...${NC}"
az webapp config set \
  --name ${WEB_APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --health-check-path "/api/health"

# Step 13: Restart Web App
echo -e "${GREEN}Step 13: Restarting web app...${NC}"
az webapp restart \
  --name ${WEB_APP_NAME} \
  --resource-group ${RESOURCE_GROUP}

# Get Web App URL
WEB_APP_URL=$(az webapp show \
  --name ${WEB_APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --query defaultHostName \
  --output tsv)

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Your app is available at: https://${WEB_APP_URL}${NC}"
