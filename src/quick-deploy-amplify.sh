#!/bin/bash

# Quick Deploy to AWS Amplify Script
# This script helps you deploy your site to AWS Amplify

set -e

echo "🚀 AWS Amplify Deployment Helper"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git repository not initialized."
    echo "   Run: git init"
    exit 1
fi

# Check if remote is set
if ! git remote | grep -q origin; then
    echo "❌ No git remote found."
    echo ""
    echo "To deploy to Amplify, you need to push your code to GitHub/GitLab/Bitbucket first."
    echo ""
    echo "Steps:"
    echo "1. Create a new repository on GitHub: https://github.com/new"
    echo "2. Run these commands:"
    echo ""
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git push -u origin main"
    echo ""
    exit 1
fi

# Create amplify.yml if it doesn't exist
if [ ! -f amplify.yml ]; then
    echo "📝 Creating amplify.yml configuration file..."
    cat > amplify.yml <<EOF
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
EOF
    git add amplify.yml
    git commit -m "Add Amplify configuration"
    echo "✅ Created amplify.yml"
fi

# Build test
echo ""
echo "🔨 Testing build process..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo ""
echo "✅ Pre-deployment checks passed!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NEXT STEPS - Deploy to AWS Amplify"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Push your code to GitHub (if not already done):"
echo "   git push origin main"
echo ""
echo "2. Open AWS Amplify Console:"
echo "   👉 https://console.aws.amazon.com/amplify/"
echo ""
echo "3. Click 'New app' → 'Host web app'"
echo ""
echo "4. Connect your Git repository:"
echo "   - Select your Git provider (GitHub/GitLab/Bitbucket)"
echo "   - Authorize AWS Amplify"
echo "   - Select this repository"
echo "   - Select branch: main"
echo ""
echo "5. Build settings will be auto-detected from amplify.yml"
echo "   - Just click 'Next' → 'Save and deploy'"
echo ""
echo "6. Wait 3-5 minutes for deployment"
echo ""
echo "7. Your site will be live at a URL like:"
echo "   https://main.d1234567890.amplifyapp.com"
echo ""
echo "8. Optional: Add a custom domain in Amplify console"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  IMPORTANT: Environment Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "After deployment, set these in Amplify Console:"
echo "  → Environment variables section"
echo ""
echo "Add these variables:"
echo "  VITE_SUPABASE_PROJECT_ID = (your Supabase project ID)"
echo "  VITE_SUPABASE_ANON_KEY = (your Supabase anon key)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Need help? See: AWS_DEPLOYMENT_GUIDE.md"
echo ""
