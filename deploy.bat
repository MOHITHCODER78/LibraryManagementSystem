@echo off
REM Deploy script for Library Management System (Windows)
REM This script helps push code to GitHub and triggers deployments

setlocal enabledelayedexpansion

echo === Library Management System Deployment Script ===
echo.

REM Check if git is initialized
if not exist .git (
    echo Initializing Git...
    git init
)

REM Get GitHub URL if not provided
if "%GITHUB_URL%"=="" (
    set /p GITHUB_URL="Enter GitHub repository URL: "
)

REM Add remote if not exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo Adding remote origin: !GITHUB_URL!
    git remote add origin !GITHUB_URL!
)

REM Stage all changes
echo Staging changes...
git add .

REM Commit
set /p COMMIT_MSG="Enter commit message (default: 'Deploy to production'): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Deploy to production
git commit -m "%COMMIT_MSG%"

REM Push to GitHub
echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Code pushed to GitHub: !GITHUB_URL!
echo.
echo Next steps:
echo 1. Go to Render dashboard and create new Web Service
echo 2. Connect your GitHub repository
echo 3. Configure environment variables
echo 4. Deploy
echo.
echo 5. Go to Vercel dashboard and create new project
echo 6. Import your GitHub repository
echo 7. Configure environment variables
echo 8. Deploy
echo.
echo See DEPLOYMENT.md for detailed instructions
