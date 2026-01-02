#!/bin/bash

###############################################################################
# AWS CloudWatch Logging Setup Script
# 
# This script configures CloudWatch Logs, metric filters, dashboards, and 
# alarms for the TTA Urban Next.js application deployed on ECS.
#
# Prerequisites:
# - AWS CLI installed and configured
# - Appropriate IAM permissions for CloudWatch, SNS, and ECS
# - ECS task already deployed with awslogs configuration
#
# Usage:
#   chmod +x setup-cloudwatch.sh
#   ./setup-cloudwatch.sh
###############################################################################

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-ap-south-1}"
LOG_GROUP_NAME="/ecs/ttaurban"
RETENTION_DAYS=14
SNS_TOPIC_NAME="ttaurban-alerts"
ALERT_EMAIL=""
DASHBOARD_NAME="TTAUrban-Production-Dashboard"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}AWS CloudWatch Logging Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Prompt for configuration
read -p "Enter AWS region (default: ap-south-1): " input_region
AWS_REGION="${input_region:-$AWS_REGION}"

read -p "Enter alert email address: " ALERT_EMAIL
if [ -z "$ALERT_EMAIL" ]; then
  echo -e "${RED}Error: Email address is required for alerts${NC}"
  exit 1
fi

echo -e "\n${YELLOW}Configuration:${NC}"
echo -e "  Region: ${GREEN}$AWS_REGION${NC}"
echo -e "  Log Group: ${GREEN}$LOG_GROUP_NAME${NC}"
echo -e "  Retention: ${GREEN}$RETENTION_DAYS days${NC}"
echo -e "  Alert Email: ${GREEN}$ALERT_EMAIL${NC}\n"

read -p "Proceed with setup? (y/n): " confirm
if [ "$confirm" != "y" ]; then
  echo -e "${YELLOW}Setup cancelled${NC}"
  exit 0
fi

# Step 1: Create or verify CloudWatch Log Group
echo -e "\n${BLUE}[1/6] Creating CloudWatch Log Group...${NC}"
if aws logs describe-log-groups --log-group-name-prefix "$LOG_GROUP_NAME" --region "$AWS_REGION" | grep -q "$LOG_GROUP_NAME"; then
  echo -e "${GREEN}✓ Log group already exists${NC}"
else
  aws logs create-log-group \
    --log-group-name "$LOG_GROUP_NAME" \
    --region "$AWS_REGION"
  echo -e "${GREEN}✓ Log group created${NC}"
fi

# Set retention policy
aws logs put-retention-policy \
  --log-group-name "$LOG_GROUP_NAME" \
  --retention-in-days "$RETENTION_DAYS" \
  --region "$AWS_REGION"
echo -e "${GREEN}✓ Retention policy set to $RETENTION_DAYS days${NC}"

# Step 2: Create metric filters
echo -e "\n${BLUE}[2/6] Creating metric filters...${NC}"

# Error count metric filter
aws logs put-metric-filter \
  --log-group-name "$LOG_GROUP_NAME" \
  --filter-name "ErrorCount" \
  --filter-pattern '{ $.level = "error" }' \
  --metric-transformations \
    metricName=ApplicationErrors,metricNamespace=TTAUrban/Application,metricValue=1,defaultValue=0 \
  --region "$AWS_REGION"
echo -e "${GREEN}✓ Error count metric filter created${NC}"

# API response time metric filter
aws logs put-metric-filter \
  --log-group-name "$LOG_GROUP_NAME" \
  --filter-name "APIResponseTime" \
  --filter-pattern '{ $.context.duration > 0 }' \
  --metric-transformations \
    metricName=APIResponseTime,metricNamespace=TTAUrban/Performance,metricValue=$.context.duration,defaultValue=0,unit=Milliseconds \
  --region "$AWS_REGION"
echo -e "${GREEN}✓ API response time metric filter created${NC}"

# 5xx errors metric filter
aws logs put-metric-filter \
  --log-group-name "$LOG_GROUP_NAME" \
  --filter-name "HTTP5xxErrors" \
  --filter-pattern '{ $.context.statusCode >= 500 }' \
  --metric-transformations \
    metricName=HTTP5xxErrors,metricNamespace=TTAUrban/Application,metricValue=1,defaultValue=0 \
  --region "$AWS_REGION"
echo -e "${GREEN}✓ 5xx errors metric filter created${NC}"

# Step 3: Create SNS topic for alerts
echo -e "\n${BLUE}[3/6] Creating SNS topic for alerts...${NC}"
SNS_TOPIC_ARN=$(aws sns create-topic \
  --name "$SNS_TOPIC_NAME" \
  --region "$AWS_REGION" \
  --output text --query 'TopicArn')

if [ -z "$SNS_TOPIC_ARN" ]; then
  SNS_TOPIC_ARN=$(aws sns list-topics --region "$AWS_REGION" --output text --query "Topics[?contains(@, '$SNS_TOPIC_NAME')].TopicArn" | head -1)
fi

echo -e "${GREEN}✓ SNS topic created: $SNS_TOPIC_ARN${NC}"

# Subscribe email to SNS topic
aws sns subscribe \
  --topic-arn "$SNS_TOPIC_ARN" \
  --protocol email \
  --notification-endpoint "$ALERT_EMAIL" \
  --region "$AWS_REGION"
echo -e "${GREEN}✓ Email subscription created (check your inbox to confirm)${NC}"

# Step 4: Create CloudWatch Alarms
echo -e "\n${BLUE}[4/6] Creating CloudWatch alarms...${NC}"

# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "TTAUrban-High-Error-Rate" \
  --alarm-description "Alert when application error count exceeds threshold" \
  --metric-name ApplicationErrors \
  --namespace TTAUrban/Application \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --treat-missing-data notBreaching \
  --alarm-actions "$SNS_TOPIC_ARN" \
  --region "$AWS_REGION"
echo -e "${GREEN}✓ High error rate alarm created${NC}"

# Slow API response alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "TTAUrban-Slow-API-Response" \
  --alarm-description "Alert when API response time p95 exceeds 2 seconds" \
  --metric-name APIResponseTime \
  --namespace TTAUrban/Performance \
  --extended-statistic p95 \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 2000 \
  --comparison-operator GreaterThanThreshold \
  --treat-missing-data notBreaching \
  --alarm-actions "$SNS_TOPIC_ARN" \
  --region "$AWS_REGION"
echo -e "${GREEN}✓ Slow API response alarm created${NC}"

# High 5xx errors alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "TTAUrban-High-5xx-Errors" \
  --alarm-description "Alert when 5xx errors exceed threshold" \
  --metric-name HTTP5xxErrors \
  --namespace TTAUrban/Application \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --treat-missing-data notBreaching \
  --alarm-actions "$SNS_TOPIC_ARN" \
  --region "$AWS_REGION"
echo -e "${GREEN}✓ High 5xx errors alarm created${NC}"

# Step 5: Create CloudWatch Dashboard
echo -e "\n${BLUE}[5/6] Creating CloudWatch dashboard...${NC}"

DASHBOARD_BODY=$(cat <<EOF
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "title": "Application Errors",
        "region": "$AWS_REGION",
        "metrics": [
          ["TTAUrban/Application", "ApplicationErrors", { "stat": "Sum" }]
        ],
        "period": 300,
        "stat": "Sum",
        "yAxis": { "left": { "min": 0 } }
      }
    },
    {
      "type": "metric",
      "properties": {
        "title": "API Response Time (Percentiles)",
        "region": "$AWS_REGION",
        "metrics": [
          ["TTAUrban/Performance", "APIResponseTime", { "stat": "p50" }],
          ["...", { "stat": "p95" }],
          ["...", { "stat": "p99" }]
        ],
        "period": 300,
        "yAxis": { "left": { "label": "ms", "min": 0 } }
      }
    },
    {
      "type": "metric",
      "properties": {
        "title": "HTTP 5xx Errors",
        "region": "$AWS_REGION",
        "metrics": [
          ["TTAUrban/Application", "HTTP5xxErrors", { "stat": "Sum" }]
        ],
        "period": 300,
        "stat": "Sum",
        "yAxis": { "left": { "min": 0 } }
      }
    }
  ]
}
EOF
)

aws cloudwatch put-dashboard \
  --dashboard-name "$DASHBOARD_NAME" \
  --dashboard-body "$DASHBOARD_BODY" \
  --region "$AWS_REGION"
echo -e "${GREEN}✓ CloudWatch dashboard created${NC}"

# Step 6: Display summary
echo -e "\n${BLUE}[6/6] Setup Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ CloudWatch Logs configured${NC}"
echo -e "${GREEN}✓ Metric filters created (3 filters)${NC}"
echo -e "${GREEN}✓ SNS topic created${NC}"
echo -e "${GREEN}✓ CloudWatch alarms created (3 alarms)${NC}"
echo -e "${GREEN}✓ Dashboard created${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Confirm email subscription (check inbox for ${ALERT_EMAIL})"
echo -e "2. Deploy your ECS service to start generating logs"
echo -e "3. View dashboard: https://console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#dashboards:name=$DASHBOARD_NAME"
echo -e "4. View logs: https://console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#logsV2:log-groups/log-group/$LOG_GROUP_NAME\n"

echo -e "${GREEN}CloudWatch setup completed successfully!${NC}"
