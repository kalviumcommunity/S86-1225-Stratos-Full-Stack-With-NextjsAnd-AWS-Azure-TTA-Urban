#!/bin/bash

# Azure DNS and SSL Certificate Setup Script
# This script automates domain and SSL configuration for Azure App Service

set -e

# Configuration
DOMAIN_NAME="ttaurban.com"
RESOURCE_GROUP="ttaurban-rg"
APP_SERVICE_NAME="ttaurban-app"
DNS_ZONE_NAME="${DOMAIN_NAME}"
LOCATION="centralindia"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🌐 Azure DNS and SSL Setup${NC}"
echo -e "${CYAN}===========================${NC}\n"

# Step 1: Create DNS Zone
echo -e "${GREEN}Step 1: Creating Azure DNS Zone...${NC}"
az network dns zone create \
  --resource-group ${RESOURCE_GROUP} \
  --name ${DNS_ZONE_NAME} \
  --tags "Environment=Production" "Project=TTAUrban" || true

echo -e "${GREEN}✓ DNS Zone created/verified${NC}"

# Step 2: Get Nameservers
echo -e "\n${GREEN}Step 2: Retrieving Nameservers...${NC}"
az network dns zone show \
  --resource-group ${RESOURCE_GROUP} \
  --name ${DNS_ZONE_NAME} \
  --query nameServers \
  --output table

echo -e "\n${YELLOW}⚠️  IMPORTANT: Update these nameservers in your domain registrar!${NC}\n"

# Step 3: Get App Service IP/Hostname
echo -e "${GREEN}Step 3: Getting App Service details...${NC}"
APP_HOSTNAME=$(az webapp show \
  --name ${APP_SERVICE_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --query defaultHostName \
  --output tsv)

APP_IP=$(az webapp show \
  --name ${APP_SERVICE_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --query outboundIpAddresses \
  --output tsv | cut -d',' -f1)

echo -e "${YELLOW}App Hostname: ${APP_HOSTNAME}${NC}"
echo -e "${YELLOW}App IP: ${APP_IP}${NC}"

# Step 4: Create DNS Records
echo -e "\n${GREEN}Step 4: Creating DNS records...${NC}"

# Create A record pointing to App Service IP
echo -e "${CYAN}Creating A record for root domain...${NC}"
az network dns record-set a add-record \
  --resource-group ${RESOURCE_GROUP} \
  --zone-name ${DNS_ZONE_NAME} \
  --record-set-name "@" \
  --ipv4-address ${APP_IP} || true

# Create CNAME record for www subdomain
echo -e "${CYAN}Creating CNAME record for www...${NC}"
az network dns record-set cname set-record \
  --resource-group ${RESOURCE_GROUP} \
  --zone-name ${DNS_ZONE_NAME} \
  --record-set-name "www" \
  --cname ${DOMAIN_NAME} || true

# Create TXT record for domain verification
echo -e "${CYAN}Creating domain verification TXT record...${NC}"
VERIFICATION_ID=$(az webapp show \
  --name ${APP_SERVICE_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --query customDomainVerificationId \
  --output tsv)

az network dns record-set txt add-record \
  --resource-group ${RESOURCE_GROUP} \
  --zone-name ${DNS_ZONE_NAME} \
  --record-set-name "asuid" \
  --value ${VERIFICATION_ID} || true

echo -e "${GREEN}✓ DNS records created${NC}"

# Step 5: Add Custom Domain to App Service
echo -e "\n${GREEN}Step 5: Adding custom domain to App Service...${NC}"
echo -e "${YELLOW}Waiting for DNS propagation (30 seconds)...${NC}"
sleep 30

# Add root domain
az webapp config hostname add \
  --webapp-name ${APP_SERVICE_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --hostname ${DOMAIN_NAME} || true

# Add www subdomain
az webapp config hostname add \
  --webapp-name ${APP_SERVICE_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --hostname "www.${DOMAIN_NAME}" || true

echo -e "${GREEN}✓ Custom domains added${NC}"

# Step 6: Create Managed SSL Certificate
echo -e "\n${GREEN}Step 6: Creating managed SSL certificate...${NC}"

# Create certificate for root domain
echo -e "${CYAN}Creating certificate for ${DOMAIN_NAME}...${NC}"
az webapp config ssl create \
  --name ${APP_SERVICE_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --hostname ${DOMAIN_NAME} || true

# Create certificate for www subdomain
echo -e "${CYAN}Creating certificate for www.${DOMAIN_NAME}...${NC}"
az webapp config ssl create \
  --name ${APP_SERVICE_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --hostname "www.${DOMAIN_NAME}" || true

echo -e "${GREEN}✓ SSL certificates created${NC}"

# Step 7: Bind SSL Certificates
echo -e "\n${GREEN}Step 7: Binding SSL certificates...${NC}"

# Get certificate thumbprints
CERT_THUMBPRINT=$(az webapp config ssl list \
  --resource-group ${RESOURCE_GROUP} \
  --query "[?name=='${DOMAIN_NAME}'].thumbprint | [0]" \
  --output tsv)

WWW_CERT_THUMBPRINT=$(az webapp config ssl list \
  --resource-group ${RESOURCE_GROUP} \
  --query "[?name=='www.${DOMAIN_NAME}'].thumbprint | [0]" \
  --output tsv)

# Bind certificates
if [ ! -z "$CERT_THUMBPRINT" ]; then
  az webapp config ssl bind \
    --name ${APP_SERVICE_NAME} \
    --resource-group ${RESOURCE_GROUP} \
    --certificate-thumbprint ${CERT_THUMBPRINT} \
    --ssl-type SNI || true
fi

if [ ! -z "$WWW_CERT_THUMBPRINT" ]; then
  az webapp config ssl bind \
    --name ${APP_SERVICE_NAME} \
    --resource-group ${RESOURCE_GROUP} \
    --certificate-thumbprint ${WWW_CERT_THUMBPRINT} \
    --ssl-type SNI || true
fi

echo -e "${GREEN}✓ SSL certificates bound${NC}"

# Step 8: Enable HTTPS Only
echo -e "\n${GREEN}Step 8: Enforcing HTTPS...${NC}"
az webapp update \
  --name ${APP_SERVICE_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --https-only true

echo -e "${GREEN}✓ HTTPS enforced${NC}"

# Step 9: Configure Minimum TLS Version
echo -e "\n${GREEN}Step 9: Setting minimum TLS version to 1.2...${NC}"
az webapp config set \
  --name ${APP_SERVICE_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --min-tls-version 1.2

echo -e "${GREEN}✓ TLS version configured${NC}"

# Summary
echo -e "\n${CYAN}===========================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}\n"
echo -e "${CYAN}Summary:${NC}"
echo -e "  Domain: ${DOMAIN_NAME}"
echo -e "  DNS Zone: ${DNS_ZONE_NAME}"
echo -e "  App Service: ${APP_SERVICE_NAME}"
echo -e "  HTTPS: Enabled"
echo -e "  TLS Version: 1.2+"
echo -e "\n${CYAN}DNS Records Created:${NC}"
echo -e "  A     @ → ${APP_IP}"
echo -e "  CNAME www → ${DOMAIN_NAME}"
echo -e "  TXT   asuid → ${VERIFICATION_ID}"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "  1. Update nameservers at your domain registrar"
echo -e "  2. Wait for DNS propagation (up to 48 hours)"
echo -e "  3. Test your site: https://${DOMAIN_NAME}"
echo -e "  4. Verify SSL: https://www.ssllabs.com/ssltest/analyze.html?d=${DOMAIN_NAME}"
echo -e "\n${CYAN}View DNS records:${NC}"
echo -e "  az network dns record-set list -g ${RESOURCE_GROUP} -z ${DNS_ZONE_NAME} -o table"
echo -e "\n${CYAN}View SSL certificates:${NC}"
echo -e "  az webapp config ssl list -g ${RESOURCE_GROUP} -o table\n"
