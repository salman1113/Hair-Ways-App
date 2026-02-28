<#
.SYNOPSIS
    Builds and pushes Hair Ways Docker images to AWS ECR.

.DESCRIPTION
    Logs into ECR, builds both backend_core and ai_engine images,
    tags them, and pushes to your ECR repositories.

.PARAMETER AccountId
    Your 12-digit AWS Account ID (find via: aws sts get-caller-identity)

.PARAMETER Region
    AWS region (default: ap-south-1)

.EXAMPLE
    .\ecr_push.ps1 -AccountId "123456789012" -Region "ap-south-1"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$AccountId,

    [string]$Region = "ap-south-1"
)

$ErrorActionPreference = "Stop"
$ECR_BASE = "$AccountId.dkr.ecr.$Region.amazonaws.com"

Write-Host "`n=== Hair Ways — ECR Push Script ===" -ForegroundColor Cyan

# ── Step 1: Login to ECR ──────────────────────────────────────────────────
Write-Host "`n[1/5] Logging into ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $ECR_BASE
if ($LASTEXITCODE -ne 0) { Write-Error "ECR login failed"; exit 1 }

# ── Step 2: Build Backend ─────────────────────────────────────────────────
Write-Host "`n[2/5] Building backend_core image..." -ForegroundColor Yellow
docker build -t hairways-backend ./backend_core
if ($LASTEXITCODE -ne 0) { Write-Error "Backend build failed"; exit 1 }

# ── Step 3: Build AI Engine ───────────────────────────────────────────────
Write-Host "`n[3/5] Building ai_engine image..." -ForegroundColor Yellow
docker build -t hairways-ai ./ai_engine
if ($LASTEXITCODE -ne 0) { Write-Error "AI Engine build failed"; exit 1 }

# ── Step 4: Tag images ───────────────────────────────────────────────────
Write-Host "`n[4/5] Tagging images..." -ForegroundColor Yellow
docker tag hairways-backend:latest "$ECR_BASE/hairways/backend:latest"
docker tag hairways-ai:latest "$ECR_BASE/hairways/ai-engine:latest"

# ── Step 5: Push to ECR ──────────────────────────────────────────────────
Write-Host "`n[5/5] Pushing to ECR..." -ForegroundColor Yellow
docker push "$ECR_BASE/hairways/backend:latest"
if ($LASTEXITCODE -ne 0) { Write-Error "Backend push failed"; exit 1 }

docker push "$ECR_BASE/hairways/ai-engine:latest"
if ($LASTEXITCODE -ne 0) { Write-Error "AI Engine push failed"; exit 1 }

Write-Host "`n=== All images pushed successfully! ===" -ForegroundColor Green
Write-Host "Backend:   $ECR_BASE/hairways/backend:latest"
Write-Host "AI Engine: $ECR_BASE/hairways/ai-engine:latest"
