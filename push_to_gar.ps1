# ==============================================================================
# DENTEX - Google Artifact Registry (GAR) PowerShell Push Helper Script
# ==============================================================================
# This script builds, tags, and pushes Frontend/Backend Docker images to GCP.
# Make sure you are authenticated with GCP CLI (gcloud auth login) before running.
# ==============================================================================

$ErrorActionPreference = "Stop"

# Parameter defaults - replace these or pass them when calling
param (
    [string]$GcpRegion = "us-central1",
    [string]$GcpProjectId = "your-gcp-project-id",
    [string]$GcpGarRepository = "dentex-repo",
    [string]$ImageTag = "latest"
)

$RegistryUrl = "${GcpRegion}-docker.pkg.dev/${GcpProjectId}/${GcpGarRepository}"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  DENTEX GCP ARTIFACT REGISTRY DEPLOY (PS)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "GCP Region:      $GcpRegion"
Write-Host "Project ID:      $GcpProjectId"
Write-Host "Repository:      $GcpGarRepository"
Write-Host "Registry URL:    $RegistryUrl"
Write-Host "Image Tag:       $ImageTag"
Write-Host "=========================================" -ForegroundColor Cyan

# Check for gcloud command
if (-not (Get-Command "gcloud" -ErrorAction SilentlyContinue)) {
    Write-Error "Google Cloud SDK ('gcloud') was not found in your PATH. Please install it from https://cloud.google.com/sdk"
}

# 1. Authenticate Docker with GCP Artifact Registry
Write-Host "🔑 Configuring Docker authentication for Google Artifact Registry..." -ForegroundColor Yellow
gcloud auth configure-docker "${GcpRegion}-docker.pkg.dev" --quiet

# 2. Build and Tag Frontend
Write-Host "📦 Building Frontend Image..." -ForegroundColor Yellow
docker build -t dentex-frontend:latest ./frontend

Write-Host "🏷️ Tagging Frontend Image..." -ForegroundColor Yellow
docker tag dentex-frontend:latest "$RegistryUrl/dentex-frontend:$ImageTag"

# 3. Build and Tag Backend
Write-Host "📦 Building Backend Image..." -ForegroundColor Yellow
docker build -t dentex-backend:latest ./backend

Write-Host "🏷️ Tagging Backend Image..." -ForegroundColor Yellow
docker tag dentex-backend:latest "$RegistryUrl/dentex-backend:$ImageTag"

# 4. Push Frontend Image
Write-Host "🚀 Pushing Frontend Image to GAR..." -ForegroundColor Yellow
docker push "$RegistryUrl/dentex-frontend:$ImageTag"

# 5. Push Backend Image
Write-Host "🚀 Pushing Backend Image to GAR..." -ForegroundColor Yellow
docker push "$RegistryUrl/dentex-backend:$ImageTag"

Write-Host "=========================================" -ForegroundColor Green
Write-Host "🎉 Successfully pushed all images to GCP Artifact Registry!" -ForegroundColor Green
Write-Host "Registry Base URL: $RegistryUrl" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
