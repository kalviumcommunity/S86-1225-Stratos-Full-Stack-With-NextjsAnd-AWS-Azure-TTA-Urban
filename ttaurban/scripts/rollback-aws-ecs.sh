#!/bin/bash

###############################################################################
# AWS ECS Rollback Script
# Rolls back an ECS service to the previous task definition
# Usage: ./rollback-aws-ecs.sh [OPTIONS]
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
AWS_REGION="${AWS_REGION:-ap-south-1}"
ECS_CLUSTER="${ECS_CLUSTER:-ttaurban-cluster}"
ECS_SERVICE="${ECS_SERVICE:-ttaurban-service}"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --region)
            AWS_REGION="$2"
            shift 2
            ;;
        --cluster)
            ECS_CLUSTER="$2"
            shift 2
            ;;
        --service)
            ECS_SERVICE="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --region REGION    AWS region (default: ap-south-1)"
            echo "  --cluster CLUSTER  ECS cluster name (default: ttaurban-cluster)"
            echo "  --service SERVICE  ECS service name (default: ttaurban-service)"
            echo "  --help            Show this help message"
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
echo -e "${YELLOW}🔄 AWS ECS Rollback Script${NC}"
echo "=================================================="
echo "Region: $AWS_REGION"
echo "Cluster: $ECS_CLUSTER"
echo "Service: $ECS_SERVICE"
echo ""

###############################################################################
# Function: Check AWS CLI
###############################################################################
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI is not installed${NC}"
        echo "Please install AWS CLI: https://aws.amazon.com/cli/"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS credentials not configured${NC}"
        echo "Please run: aws configure"
        exit 1
    fi
    
    echo -e "${GREEN}✓ AWS CLI configured${NC}"
}

###############################################################################
# Function: Get Current Task Definition
###############################################################################
get_current_task_definition() {
    echo ""
    echo "📋 Getting current service configuration..."
    
    CURRENT_TASK_DEF=$(aws ecs describe-services \
        --cluster "$ECS_CLUSTER" \
        --services "$ECS_SERVICE" \
        --region "$AWS_REGION" \
        --query "services[0].taskDefinition" \
        --output text)
    
    if [ -z "$CURRENT_TASK_DEF" ] || [ "$CURRENT_TASK_DEF" == "None" ]; then
        echo -e "${RED}❌ Failed to get current task definition${NC}"
        exit 1
    fi
    
    echo "Current task definition: $CURRENT_TASK_DEF"
    
    # Extract task definition family and revision
    TASK_FAMILY=$(echo "$CURRENT_TASK_DEF" | sed 's|.*/||' | sed 's/:.*//')
    CURRENT_REVISION=$(echo "$CURRENT_TASK_DEF" | sed 's/.*://')
    
    echo "Task family: $TASK_FAMILY"
    echo "Current revision: $CURRENT_REVISION"
}

###############################################################################
# Function: Get Previous Task Definition
###############################################################################
get_previous_task_definition() {
    echo ""
    echo "🔍 Finding previous task definition..."
    
    if [ "$CURRENT_REVISION" -le 1 ]; then
        echo -e "${YELLOW}⚠️  No previous revision available (current is revision 1)${NC}"
        echo "Cannot rollback. Consider deploying a known good version instead."
        exit 1
    fi
    
    PREVIOUS_REVISION=$((CURRENT_REVISION - 1))
    PREVIOUS_TASK_DEF="$TASK_FAMILY:$PREVIOUS_REVISION"
    
    # Verify previous task definition exists
    if aws ecs describe-task-definition \
        --task-definition "$PREVIOUS_TASK_DEF" \
        --region "$AWS_REGION" &> /dev/null; then
        echo -e "${GREEN}✓ Previous task definition found: $PREVIOUS_TASK_DEF${NC}"
    else
        echo -e "${RED}❌ Previous task definition not found: $PREVIOUS_TASK_DEF${NC}"
        exit 1
    fi
}

###############################################################################
# Function: Confirm Rollback
###############################################################################
confirm_rollback() {
    echo ""
    echo -e "${YELLOW}⚠️  WARNING: About to rollback deployment${NC}"
    echo "  From: $CURRENT_TASK_DEF (revision $CURRENT_REVISION)"
    echo "  To:   $PREVIOUS_TASK_DEF (revision $PREVIOUS_REVISION)"
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
    
    # Update service to use previous task definition
    aws ecs update-service \
        --cluster "$ECS_CLUSTER" \
        --service "$ECS_SERVICE" \
        --task-definition "$PREVIOUS_TASK_DEF" \
        --region "$AWS_REGION" \
        --force-new-deployment \
        > /dev/null
    
    echo -e "${GREEN}✓ Rollback initiated${NC}"
}

###############################################################################
# Function: Wait for Service Stability
###############################################################################
wait_for_stability() {
    echo ""
    echo "⏳ Waiting for service to stabilize (this may take several minutes)..."
    
    if aws ecs wait services-stable \
        --cluster "$ECS_CLUSTER" \
        --services "$ECS_SERVICE" \
        --region "$AWS_REGION"; then
        echo -e "${GREEN}✓ Service is stable${NC}"
    else
        echo -e "${RED}⚠️  Service stability check timed out${NC}"
        echo "Please check the ECS console for service status."
        exit 1
    fi
}

###############################################################################
# Function: Verify Rollback
###############################################################################
verify_rollback() {
    echo ""
    echo "🔍 Verifying rollback..."
    
    NEW_TASK_DEF=$(aws ecs describe-services \
        --cluster "$ECS_CLUSTER" \
        --services "$ECS_SERVICE" \
        --region "$AWS_REGION" \
        --query "services[0].taskDefinition" \
        --output text)
    
    if [[ "$NEW_TASK_DEF" == *"$PREVIOUS_REVISION"* ]]; then
        echo -e "${GREEN}✅ Rollback successful!${NC}"
        echo "Service is now running: $NEW_TASK_DEF"
    else
        echo -e "${RED}❌ Rollback verification failed${NC}"
        echo "Expected: $PREVIOUS_TASK_DEF"
        echo "Current: $NEW_TASK_DEF"
        exit 1
    fi
}

###############################################################################
# Main Execution
###############################################################################
main() {
    check_aws_cli
    get_current_task_definition
    get_previous_task_definition
    confirm_rollback
    perform_rollback
    wait_for_stability
    verify_rollback
    
    echo ""
    echo "=================================================="
    echo -e "${GREEN}✅ ROLLBACK COMPLETE${NC}"
    echo "=================================================="
    echo "Rolled back from revision $CURRENT_REVISION to $PREVIOUS_REVISION"
    echo ""
    echo "Next steps:"
    echo "1. Run health checks: ./scripts/verify-deployment.sh <APP_URL>"
    echo "2. Monitor CloudWatch logs for errors"
    echo "3. Check application metrics in CloudWatch dashboard"
    echo "=================================================="
}

# Run main function
main
