# ==============================================================================
# Dentex Amazon ECR Push Helper Script (PowerShell)
# ==============================================================================
# This script automates the process of logging into Amazon ECR, tagging local
# docker images, and pushing them to ECR repositories.
#
# Prerequisites:
# 1. AWS CLI installed (run 'aws --version' to verify).
# 2. AWS credentials configured (run 'aws configure').
# 3. Docker installed and running.
# ==============================================================================

$ErrorActionPreference = "Stop"

# Configurations - Update these defaults if desired
$AWS_REGION = "us-east-1"
$FRONTEND_REPO = "dentex-frontend"
$BACKEND_REPO = "dentex-backend"

# Prompt for AWS Account ID if not set
$AWS_ACCOUNT_ID = Read-Host "Enter your AWS Account ID (12 digits)"
if ($AWS_ACCOUNT_ID -notmatch '^\d{12}$') {
    Write-Error "❌ Error: AWS Account ID must be a 12-digit number."
    Exit
}

$ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "🚀 ECR Registry: $ECR_REGISTRY" -ForegroundColor Cyan
Write-Host "📍 Region:       $AWS_REGION" -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Cyan

# Step 1: Login to Amazon ECR
Write-Host "🔑 Logging in to Amazon ECR..." -ForegroundColor Yellow
$loginPassword = aws ecr get-login-password --region $AWS_REGION
$loginPassword | docker login --username AWS --password-stdin $ECR_REGISTRY
Write-Host "✅ Successfully logged in to Amazon ECR!" -ForegroundColor Green

# Function to tag and push an image
function Push-DockerImage {
    param(
        [string]$ServiceName,
        [string]$LocalImageName,
        [string]$EcrRepository
    )

    Write-Host "--------------------------------------------------" -ForegroundColor Cyan
    Write-Host "📦 Preparing $ServiceName image..." -ForegroundColor Yellow

    # Check if local image exists
    $imageCheck = docker image inspect $LocalImageName 2>$null
    if ($null -eq $imageCheck) {
        Write-Host "⚠️ Local image '$LocalImageName' not found. Building it now..." -ForegroundColor Magenta
        docker build -t $LocalImageName "./$ServiceName"
    }

    # Tag image for ECR
    $destinationTag = "${ECR_REGISTRY}/${EcrRepository}:latest"
    Write-Host "🏷️ Tagging image as: $destinationTag" -ForegroundColor Yellow
    docker tag $LocalImageName $destinationTag

    # Push image to ECR
    Write-Host "📤 Pushing image to ECR..." -ForegroundColor Yellow
    docker push $destinationTag
    Write-Host "✅ Successfully pushed $ServiceName image to ECR!" -ForegroundColor Green
}

# Step 2: Push Backend Image
Push-DockerImage -ServiceName "backend" -LocalImageName "dentex-backend" -EcrRepository $BACKEND_REPO

# Step 3: Push Frontend Image
Push-DockerImage -ServiceName "frontend" -LocalImageName "dentex-frontend" -EcrRepository $FRONTEND_REPO

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "🎉 All images successfully pushed to Amazon ECR!" -ForegroundColor Green
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
