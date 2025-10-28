#!/bin/bash

# Make all deployment scripts executable
echo "🔧 Setting up script permissions..."

chmod +x deploy-option-2.sh
chmod +x scripts/deploy-lambda.sh
chmod +x scripts/setup-api-gateway.sh
chmod +x scripts/deploy-frontend.sh
chmod +x quick-deploy-amplify.sh

echo "✅ All scripts are now executable!"
echo ""
echo "You can now run:"
echo "  ./deploy-option-2.sh"
echo ""
