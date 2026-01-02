#!/bin/bash

# AWS ECS Deployment Script
# This script automates the deployment process to AWS ECS

set -e

# Configuration
AWS_REGION="ap-south-1"
ECR_REPOSITORY="ttaurban-app"
ECS_CLUSTER="ttaurban-cluster"
ECS_SERVICE="ttaurban-service"
TASK_FAMILY="ttaurban-task"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting AWS ECS Deployment...${NC}"

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"

echo -e "${YELLOW}AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"
echo -e "${YELLOW}ECR URI: ${ECR_URI}${NC}"

# Step 1: Authenticate Docker to ECR
echo -e "${GREEN}Step 1: Authenticating Docker to ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Step 2: Build Docker Image
echo -e "${GREEN}Step 2: Building Docker image...${NC}"
docker build -t ${ECR_REPOSITORY}:latest .

# Step 3: Tag Docker Image
echo -e "${GREEN}Step 3: Tagging Docker image...${NC}"
docker tag ${ECR_REPOSITORY}:latest ${ECR_URI}:latest
docker tag ${ECR_REPOSITORY}:latest ${ECR_URI}:$(git rev-parse --short HEAD)

# Step 4: Push to ECR
echo -e "${GREEN}Step 4: Pushing image to ECR...${NC}"
docker push ${ECR_URI}:latest
docker push ${ECR_URI}:$(git rev-parse --short HEAD)

# Step 5: Update ECS Task Definition
echo -e "${GREEN}Step 5: Updating ECS task definition...${NC}"
sed "s/<account-id>/${AWS_ACCOUNT_ID}/g" ecs-task-definition.json > ecs-task-definition-temp.json
aws ecs register-task-definition --cli-input-json file://ecs-task-definition-temp.json
rm ecs-task-definition-temp.json

# Step 6: Update ECS Service
echo -e "${GREEN}Step 6: Updating ECS service...${NC}"
aws ecs update-service \
  --cluster ${ECS_CLUSTER} \
  --service ${ECS_SERVICE} \
  --task-definition ${TASK_FAMILY} \
  --force-new-deployment

# Step 7: Wait for deployment to complete
echo -e "${GREEN}Step 7: Waiting for service to stabilize...${NC}"
aws ecs wait services-stable \
  --cluster ${ECS_CLUSTER} \
  --services ${ECS_SERVICE}

echo -e "${GREEN}Deployment completed successfully!${NC}"

# Get service URL (if using ALB)
SERVICE_URL=$(aws ecs describe-services \
  --cluster ${ECS_CLUSTER} \
  --services ${ECS_SERVICE} \
  --query 'services[0].loadBalancers[0].targetGroupArn' \
  --output text)

if [ ! -z "$SERVICE_URL" ]; then
  echo -e "${GREEN}Service is accessible via the load balancer${NC}"
fi
