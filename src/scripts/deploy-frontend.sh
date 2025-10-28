#!/bin/bash

# Deploy Frontend to S3 and CloudFront
# Part of Option 2: Full AWS Deployment

set -e

echo "🎨 Frontend Deployment Script"
echo "=============================="
echo ""

REGION="${AWS_REGION:-us-east-1}"
FRONTEND_BUCKET="${FRONTEND_BUCKET_NAME:-}"
API_ENDPOINT="${API_GATEWAY_ENDPOINT:-}"

# Get API endpoint if not provided
if [ -z "$API_ENDPOINT" ]; then
    echo "⚠️  API Gateway endpoint not set"
    echo ""
    read -p "Enter your API Gateway endpoint URL: " API_ENDPOINT
    
    if [ -z "$API_ENDPOINT" ]; then
        echo "❌ API endpoint is required. Exiting."
        echo "   Run ./scripts/setup-api-gateway.sh first to get the endpoint"
        exit 1
    fi
fi

# Get frontend bucket name
if [ -z "$FRONTEND_BUCKET" ]; then
    echo ""
    echo "Enter S3 bucket name for frontend (e.g., mysite-frontend)"
    read -p "Bucket name: " FRONTEND_BUCKET
    
    if [ -z "$FRONTEND_BUCKET" ]; then
        echo "❌ Bucket name is required. Exiting."
        exit 1
    fi
fi

echo "📋 Configuration:"
echo "  Region: $REGION"
echo "  Frontend Bucket: $FRONTEND_BUCKET"
echo "  API Endpoint: $API_ENDPOINT"
echo ""

# Step 1: Create S3 bucket if it doesn't exist
echo "📝 Step 1: Setting up S3 bucket..."

if aws s3 ls "s3://$FRONTEND_BUCKET" 2>/dev/null; then
    echo "✅ Bucket already exists: $FRONTEND_BUCKET"
else
    echo "Creating bucket: $FRONTEND_BUCKET"
    
    if [ "$REGION" = "us-east-1" ]; then
        aws s3 mb "s3://$FRONTEND_BUCKET" --region $REGION
    else
        aws s3 mb "s3://$FRONTEND_BUCKET" --region $REGION --create-bucket-configuration LocationConstraint=$REGION
    fi
    
    echo "✅ Bucket created"
fi

# Step 2: Configure bucket for static website hosting
echo ""
echo "📝 Step 2: Configuring static website hosting..."

aws s3 website "s3://$FRONTEND_BUCKET" \
    --index-document index.html \
    --error-document index.html

echo "✅ Static website hosting configured"

# Step 3: Set bucket policy for public read
echo ""
echo "📝 Step 3: Setting bucket policy..."

cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${FRONTEND_BUCKET}/*"
    }
  ]
}
EOF

# Disable block public access
aws s3api put-public-access-block \
    --bucket $FRONTEND_BUCKET \
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

aws s3api put-bucket-policy \
    --bucket $FRONTEND_BUCKET \
    --policy file:///tmp/bucket-policy.json

echo "✅ Bucket policy set"

# Step 4: Update API configuration
echo ""
echo "📝 Step 4: Updating API configuration..."

cat > utils/api-config.ts <<EOF
// API Configuration - AUTO-GENERATED
// Generated on: $(date)

export const config = {
  mode: 'aws',
  
  aws: {
    endpoint: '${API_ENDPOINT}',
  },
};

export function getApiEndpoint(): string {
  return config.aws.endpoint;
}

export function getAuthHeader(): string {
  return ''; // No auth needed for API Gateway
}

export async function apiCall(path: string, options: RequestInit = {}): Promise<Response> {
  const endpoint = getApiEndpoint();
  const url = \`\${endpoint}\${path}\`;
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
    },
  });
}

export default config;
EOF

echo "✅ API configuration updated"

# Step 5: Build the application
echo ""
echo "🔨 Step 5: Building application..."

# Set environment variables for build
export VITE_DEPLOYMENT_MODE=aws
export VITE_API_GATEWAY_ENDPOINT=$API_ENDPOINT

npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful"

# Step 6: Upload to S3
echo ""
echo "📤 Step 6: Uploading to S3..."

aws s3 sync dist/ "s3://$FRONTEND_BUCKET" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "*.html" \
    --region $REGION

# Upload HTML files with different cache control
aws s3 sync dist/ "s3://$FRONTEND_BUCKET" \
    --cache-control "public, max-age=0, must-revalidate" \
    --exclude "*" \
    --include "*.html" \
    --region $REGION

echo "✅ Files uploaded to S3"

# Get website URL
WEBSITE_URL="http://${FRONTEND_BUCKET}.s3-website-${REGION}.amazonaws.com"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Frontend Deployed Successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Website URL: $WEBSITE_URL"
echo ""
echo "⚠️  IMPORTANT: This URL uses HTTP only"
echo ""
echo "Next Steps:"
echo "  1. Test your site: $WEBSITE_URL"
echo "  2. Set up CloudFront for HTTPS:"
echo "     ./scripts/setup-cloudfront.sh"
echo ""
echo "CloudFront Benefits:"
echo "  • HTTPS/SSL support"
echo "  • Global CDN"
echo "  • Better performance"
echo "  • Custom domain support"
echo ""
