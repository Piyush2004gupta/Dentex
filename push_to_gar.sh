#!/bin/bash

# ==============================================================================
# DENTEX - Google Artifact Registry (GAR) Push Helper Script
# ==============================================================================
# This script builds, tags, and pushes Frontend/Backend Docker images to GCP.
# Make sure you are authenticated with GCP CLI (gcloud auth login) before running.
# ==============================================================================

set -e

# Default variables - replace these or pass them as environment variables
GCP_REGION=${GCP_REGION:-"us-central1"}
GCP_PROJECT_ID=${GCP_PROJECT_ID:-"your-gcp-project-id"}
GCP_GAR_REPOSITORY=${GCP_GAR_REPOSITORY:-"dentex-repo"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}

REGISTRY_URL="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${GCP_GAR_REPOSITORY}"

echo "========================================="
echo "  DENTEX GCP ARTIFACT REGISTRY DEPLOY"
echo "========================================="
echo "GCP Region:      $GCP_REGION"
echo "Project ID:      $GCP_PROJECT_ID"
echo "Repository:      $GCP_GAR_REPOSITORY"
echo "Registry URL:    $REGISTRY_URL"
echo "Image Tag:       $IMAGE_TAG"
echo "========================================="

# 1. Authenticate Docker with GCP Artifact Registry
echo "🔑 Configuring Docker authentication for Google Artifact Registry..."
gcloud auth configure-docker "${GCP_REGION}-docker.pkg.dev" --quiet

# 2. Build and Tag Frontend
echo "📦 Building Frontend Image..."
docker build -t dentex-frontend:latest ./frontend

echo "🏷️ Tagging Frontend Image..."
docker tag dentex-frontend:latest "$REGISTRY_URL/dentex-frontend:$IMAGE_TAG"

# 3. Build and Tag Backend
echo "📦 Building Backend Image..."
docker build -t dentex-backend:latest ./backend

echo "🏷️ Tagging Backend Image..."
docker tag dentex-backend:latest "$REGISTRY_URL/dentex-backend:$IMAGE_TAG"

# 4. Push Frontend Image
echo "🚀 Pushing Frontend Image to GAR..."
docker push "$REGISTRY_URL/dentex-frontend:$IMAGE_TAG"

# 5. Push Backend Image
echo "🚀 Pushing Backend Image to GAR..."
docker push "$REGISTRY_URL/dentex-backend:$IMAGE_TAG"

echo "========================================="
echo "🎉 Successfully pushed all images to GCP Artifact Registry!"
echo "Registry Base URL: $REGISTRY_URL"
echo "========================================="
