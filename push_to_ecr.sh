#!/bin/bash

# ==============================================================================
# Dentex Amazon ECR Push Helper Script
# ==============================================================================
# This script automates the process of logging into Amazon ECR, tagging local
# docker images, and pushing them to ECR repositories.
#
# Prerequisites:
# 1. AWS CLI installed (run 'aws --version' to verify).
# 2. AWS credentials configured (run 'aws configure').
# 3. Docker installed and running.
# ==============================================================================

# Exit immediately if any command exits with a non-zero status
set -e

# Default configurations - Update these or pass as environment variables
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-""}
FRONTEND_REPO=${FRONTEND_REPO:-"dentex-frontend"}
BACKEND_REPO=${BACKEND_REPO:-"dentex-backend"}

# Prompt for AWS Account ID if not set
if [ -z "$AWS_ACCOUNT_ID" ]; then
    read -p "Enter your AWS Account ID (12 digits): " AWS_ACCOUNT_ID
    if [[ ! "$AWS_ACCOUNT_ID" =~ ^[0-9]{12}$ ]]; then
        echo "❌ Error: AWS Account ID must be a 12-digit number."
        exit 1
    fi
fi

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "--------------------------------------------------"
echo "🚀 ECR Registry: $ECR_REGISTRY"
echo "📍 Region:       $AWS_REGION"
echo "--------------------------------------------------"

# Step 1: Login to Amazon ECR
echo "🔑 Logging in to Amazon ECR..."
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"
echo "✅ Successfully logged in to Amazon ECR!"

# Function to push an image
push_image() {
    local service_name=$1
    local local_image=$2
    local ecr_repo=$3

    echo "--------------------------------------------------"
    echo "📦 Preparing $service_name image..."
    
    # Check if local image exists
    if ! docker image inspect "$local_image" >/dev/null 2>&1; then
        echo "⚠️ Local image '$local_image' not found. Building it now..."
        docker build -t "$local_image" "./$service_name"
    fi

    # Tag image for ECR
    local destination_tag="${ECR_REGISTRY}/${ecr_repo}:latest"
    echo "🏷️ Tagging image as: $destination_tag"
    docker tag "$local_image" "$destination_tag"

    # Push image to ECR
    echo "📤 Pushing image to ECR..."
    docker push "$destination_tag"
    echo "✅ Successfully pushed $service_name image to ECR!"
}

# Step 2: Push Backend Image
push_image "backend" "dentex-backend" "$BACKEND_REPO"

# Step 3: Push Frontend Image
push_image "frontend" "dentex-frontend" "$FRONTEND_REPO"

echo "--------------------------------------------------"
echo "🎉 All images successfully pushed to Amazon ECR!"
echo "--------------------------------------------------"
