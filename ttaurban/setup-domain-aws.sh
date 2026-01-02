#!/bin/bash

# AWS Route 53 and SSL Certificate Setup Script
# This script automates domain and SSL configuration for AWS

set -e

# Configuration
DOMAIN_NAME="ttaurban.com"
HOSTED_ZONE_NAME="${DOMAIN_NAME}."
AWS_REGION="ap-south-1"
CERTIFICATE_DOMAIN="*.${DOMAIN_NAME}"
ALB_NAME="ttaurban-alb"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🌐 AWS Route 53 and SSL Setup${NC}"
echo -e "${CYAN}==============================${NC}\n"

# Step 1: Create Hosted Zone
echo -e "${GREEN}Step 1: Creating Route 53 Hosted Zone...${NC}"
HOSTED_ZONE_ID=$(aws route53 create-hosted-zone \
  --name ${HOSTED_ZONE_NAME} \
  --caller-reference $(date +%s) \
  --hosted-zone-config Comment="Hosted zone for ${DOMAIN_NAME}" \
  --query 'HostedZone.Id' \
  --output text 2>/dev/null || \
  aws route53 list-hosted-zones-by-name \
  --dns-name ${HOSTED_ZONE_NAME} \
  --query "HostedZones[0].Id" \
  --output text)

echo -e "${YELLOW}Hosted Zone ID: ${HOSTED_ZONE_ID}${NC}"

# Step 2: Get Nameservers
echo -e "\n${GREEN}Step 2: Retrieving Nameservers...${NC}"
aws route53 get-hosted-zone \
  --id ${HOSTED_ZONE_ID} \
  --query 'DelegationSet.NameServers' \
  --output table

echo -e "\n${YELLOW}⚠️  IMPORTANT: Update these nameservers in your domain registrar!${NC}\n"

# Step 3: Get Load Balancer Details
echo -e "${GREEN}Step 3: Getting Application Load Balancer details...${NC}"
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names ${ALB_NAME} \
  --query 'LoadBalancers[0].DNSName' \
  --output text 2>/dev/null || echo "")

ALB_HOSTED_ZONE=$(aws elbv2 describe-load-balancers \
  --names ${ALB_NAME} \
  --query 'LoadBalancers[0].CanonicalHostedZoneId' \
  --output text 2>/dev/null || echo "")

if [ -z "$ALB_DNS" ]; then
  echo -e "${RED}⚠️  Load Balancer '${ALB_NAME}' not found. Please create it first.${NC}"
  echo -e "${YELLOW}Skipping DNS record creation...${NC}"
else
  echo -e "${YELLOW}ALB DNS: ${ALB_DNS}${NC}"
  echo -e "${YELLOW}ALB Hosted Zone ID: ${ALB_HOSTED_ZONE}${NC}"

  # Step 4: Create DNS Records
  echo -e "\n${GREEN}Step 4: Creating DNS records...${NC}"
  
  # Create A record for root domain
  cat > /tmp/route53-changes.json <<EOF
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "${DOMAIN_NAME}",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "${ALB_HOSTED_ZONE}",
          "DNSName": "${ALB_DNS}",
          "EvaluateTargetHealth": true
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "www.${DOMAIN_NAME}",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "${DOMAIN_NAME}"
          }
        ]
      }
    }
  ]
}
EOF

  aws route53 change-resource-record-sets \
    --hosted-zone-id ${HOSTED_ZONE_ID} \
    --change-batch file:///tmp/route53-changes.json

  echo -e "${GREEN}✓ DNS records created successfully${NC}"
fi

# Step 5: Request SSL Certificate
echo -e "\n${GREEN}Step 5: Requesting SSL Certificate...${NC}"
CERT_ARN=$(aws acm request-certificate \
  --domain-name ${DOMAIN_NAME} \
  --subject-alternative-names "*.${DOMAIN_NAME}" \
  --validation-method DNS \
  --region ${AWS_REGION} \
  --query 'CertificateArn' \
  --output text 2>/dev/null || echo "")

if [ -z "$CERT_ARN" ]; then
  echo -e "${YELLOW}Certificate may already exist. Checking...${NC}"
  CERT_ARN=$(aws acm list-certificates \
    --region ${AWS_REGION} \
    --query "CertificateSummaryList[?DomainName=='${DOMAIN_NAME}'].CertificateArn | [0]" \
    --output text)
fi

echo -e "${YELLOW}Certificate ARN: ${CERT_ARN}${NC}"

# Step 6: Get DNS Validation Records
echo -e "\n${GREEN}Step 6: Retrieving DNS validation records...${NC}"
sleep 5  # Wait for certificate to be processed

aws acm describe-certificate \
  --certificate-arn ${CERT_ARN} \
  --region ${AWS_REGION} \
  --query 'Certificate.DomainValidationOptions[*].[DomainName, ResourceRecord.Name, ResourceRecord.Value]' \
  --output table

# Step 7: Add Validation Records to Route 53
echo -e "\n${GREEN}Step 7: Adding DNS validation records to Route 53...${NC}"

VALIDATION_RECORDS=$(aws acm describe-certificate \
  --certificate-arn ${CERT_ARN} \
  --region ${AWS_REGION} \
  --query 'Certificate.DomainValidationOptions[0].ResourceRecord' \
  --output json)

VALIDATION_NAME=$(echo $VALIDATION_RECORDS | jq -r '.Name')
VALIDATION_VALUE=$(echo $VALIDATION_RECORDS | jq -r '.Value')

cat > /tmp/validation-record.json <<EOF
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "${VALIDATION_NAME}",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "${VALIDATION_VALUE}"
          }
        ]
      }
    }
  ]
}
EOF

aws route53 change-resource-record-sets \
  --hosted-zone-id ${HOSTED_ZONE_ID} \
  --change-batch file:///tmp/validation-record.json

echo -e "${GREEN}✓ Validation records added${NC}"

# Step 8: Wait for Certificate Validation
echo -e "\n${GREEN}Step 8: Waiting for certificate validation...${NC}"
echo -e "${YELLOW}This may take 5-30 minutes...${NC}"

aws acm wait certificate-validated \
  --certificate-arn ${CERT_ARN} \
  --region ${AWS_REGION}

echo -e "${GREEN}✓ Certificate validated successfully!${NC}"

# Step 9: Update Load Balancer Listener (if exists)
if [ ! -z "$ALB_DNS" ]; then
  echo -e "\n${GREEN}Step 9: Updating Load Balancer to use SSL...${NC}"
  
  # Get listener ARN
  LISTENER_ARN=$(aws elbv2 describe-listeners \
    --load-balancer-arn $(aws elbv2 describe-load-balancers \
      --names ${ALB_NAME} \
      --query 'LoadBalancers[0].LoadBalancerArn' \
      --output text) \
    --query 'Listeners[?Port==`443`].ListenerArn | [0]' \
    --output text 2>/dev/null || echo "")

  if [ "$LISTENER_ARN" != "None" ] && [ ! -z "$LISTENER_ARN" ]; then
    aws elbv2 modify-listener \
      --listener-arn ${LISTENER_ARN} \
      --certificates CertificateArn=${CERT_ARN}
    echo -e "${GREEN}✓ HTTPS listener updated${NC}"
  else
    echo -e "${YELLOW}⚠️  No HTTPS listener found. Please create one manually.${NC}"
  fi
fi

# Summary
echo -e "\n${CYAN}==============================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}\n"
echo -e "${CYAN}Summary:${NC}"
echo -e "  Domain: ${DOMAIN_NAME}"
echo -e "  Hosted Zone ID: ${HOSTED_ZONE_ID}"
echo -e "  Certificate ARN: ${CERT_ARN}"
echo -e "  Certificate Status: Issued"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "  1. Update nameservers at your domain registrar"
echo -e "  2. Wait for DNS propagation (up to 48 hours)"
echo -e "  3. Test your site: https://${DOMAIN_NAME}"
echo -e "  4. Verify SSL: https://www.ssllabs.com/ssltest/analyze.html?d=${DOMAIN_NAME}\n"

# Cleanup
rm -f /tmp/route53-changes.json /tmp/validation-record.json
