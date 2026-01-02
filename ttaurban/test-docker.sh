#!/bin/bash

# Docker Build and Test Script for Linux/macOS

echo "🐳 TTA Urban - Docker Build and Test Script"
echo "========================================="
echo ""

# Configuration
IMAGE_NAME="ttaurban"
IMAGE_TAG="test"
CONTAINER_NAME="ttaurban-test"
PORT=3000

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Step 1: Check Docker installation
echo -e "${GREEN}✓ Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed or not in PATH${NC}"
    exit 1
fi
docker --version

# Step 2: Clean up existing containers and images
echo -e "\n${GREEN}✓ Cleaning up existing test containers...${NC}"
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true
docker rmi ${IMAGE_NAME}:${IMAGE_TAG} 2>/dev/null || true

# Step 3: Build Docker image
echo -e "\n${GREEN}✓ Building Docker image...${NC}"
echo -e "${YELLOW}  This may take a few minutes...${NC}"

START_TIME=$(date +%s)
if ! docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .; then
    echo -e "${RED}✗ Docker build failed!${NC}"
    exit 1
fi
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo -e "${YELLOW}  Build completed in ${DURATION} seconds${NC}"

# Step 4: Check image size
echo -e "\n${GREEN}✓ Checking image size...${NC}"
IMAGE_SIZE=$(docker images ${IMAGE_NAME}:${IMAGE_TAG} --format "{{.Size}}")
echo -e "${YELLOW}  Image size: ${IMAGE_SIZE}${NC}"

# Step 5: Run container
echo -e "\n${GREEN}✓ Starting container...${NC}"
docker run -d \
    --name $CONTAINER_NAME \
    -p ${PORT}:${PORT} \
    -e NODE_ENV=production \
    -e NEXTAUTH_SECRET=test-secret-key \
    -e JWT_SECRET=test-jwt-secret \
    ${IMAGE_NAME}:${IMAGE_TAG}

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to start container!${NC}"
    exit 1
fi
echo -e "${YELLOW}  Container started successfully${NC}"

# Step 6: Wait for container to be ready
echo -e "\n${GREEN}✓ Waiting for application to start...${NC}"
echo -e "${YELLOW}  This may take 10-15 seconds...${NC}"

MAX_RETRIES=30
RETRY_COUNT=0
READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$READY" = false ]; do
    if curl -f http://localhost:${PORT}/api/health > /dev/null 2>&1; then
        READY=true
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo -n "."
        sleep 1
    fi
done
echo ""

if [ "$READY" = true ]; then
    echo -e "${GREEN}✓ Health check passed!${NC}"
    echo -e "${YELLOW}  Application is responding on http://localhost:${PORT}${NC}"
else
    echo -e "${RED}✗ Health check failed after ${MAX_RETRIES} seconds${NC}"
    echo -e "\n${YELLOW}Container logs:${NC}"
    docker logs $CONTAINER_NAME
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
    exit 1
fi

# Step 7: Show container information
echo -e "\n${GREEN}✓ Container Information:${NC}"
docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Step 8: Show container logs
echo -e "\n${GREEN}✓ Container Logs (last 20 lines):${NC}"
docker logs --tail 20 $CONTAINER_NAME

# Step 9: Test health endpoint
echo -e "\n${GREEN}✓ Testing health endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:${PORT}/api/health)
echo -e "${CYAN}${HEALTH_RESPONSE}${NC}"

# Summary
echo -e "\n========================================="
echo -e "${GREEN}✅ Docker build and test completed successfully!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Visit http://localhost:${PORT} to view your app"
echo -e "  2. View logs: docker logs -f $CONTAINER_NAME"
echo -e "  3. Stop container: docker stop $CONTAINER_NAME"
echo -e "  4. Remove container: docker rm $CONTAINER_NAME"
echo -e "\n${YELLOW}To clean up:${NC}"
echo -e "  docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME && docker rmi ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""
