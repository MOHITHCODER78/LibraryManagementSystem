#!/bin/bash
# Deploy script for Library Management System
# This script helps push code to GitHub and triggers deployments

set -e

echo "=== Library Management System Deployment Script ==="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized. Initializing..."
    git init
fi

# Get GitHub URL if not provided
if [ -z "$GITHUB_URL" ]; then
    read -p "Enter GitHub repository URL: " GITHUB_URL
fi

# Add remote if not exists
if ! git remote | grep -q origin; then
    echo "Adding remote origin: $GITHUB_URL"
    git remote add origin "$GITHUB_URL"
fi

# Stage all changes
echo "Staging changes..."
git add .

# Commit
read -p "Enter commit message (default: 'Deploy to production'): " COMMIT_MSG
COMMIT_MSG=${COMMIT_MSG:-"Deploy to production"}
git commit -m "$COMMIT_MSG"

# Push to GitHub
echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub: $GITHUB_URL"
echo ""
echo "Next steps:"
echo "1. Go to Render dashboard and create new Web Service"
echo "2. Connect your GitHub repository"
echo "3. Configure environment variables"
echo "4. Deploy"
echo ""
echo "5. Go to Vercel dashboard and create new project"
echo "6. Import your GitHub repository"
echo "7. Configure environment variables"
echo "8. Deploy"
echo ""
echo "See DEPLOYMENT.md for detailed instructions"
