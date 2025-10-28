#!/bin/bash

# Option 2 Deployment - All-in-One Script
# Deploys complete AWS infrastructure: Lambda + API Gateway + S3/CloudFront

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        AWS Full Deployment - Option 2                      ║"
echo "║        Lambda + API Gateway + S3 + CloudFront              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGION="${AWS_REGION:-us-east-1}"
ACCOUNT_ID="298552056601"

echo "📋 Pre-Deployment Checklist"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found${NC}"
    echo "   Install: https://aws.amazon.com/cli/"
    exit 1
fi
echo -e "${GREEN}✅ AWS CLI installed${NC}"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo "   Run: aws configure"
    exit 1
fi

CURRENT_ACCOUNT=$(aws sts get-caller-identity --query 'Account' --output text)
CURRENT_USER=$(aws sts get-caller-identity --query 'Arn' --output text)

echo -e "${GREEN}✅ AWS credentials configured${NC}"
echo "   Account: $CURRENT_ACCOUNT"
echo "   User: $CURRENT_USER"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "   Install: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js installed: $(node --version)${NC}"

# Check if DynamoDB table exists
if aws dynamodb describe-table --table-name user --region $REGION &> /dev/null; then
    echo -e "${GREEN}✅ DynamoDB table 'user' exists${NC}"
else
    echo -e "${YELLOW}⚠️  DynamoDB table 'user' not found${NC}"
    echo "   Creating table..."
    
    aws dynamodb create-table \
        --table-name user \
        --attribute-definitions AttributeName=userId,AttributeType=S \
        --key-schema AttributeName=userId,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region $REGION
    
    echo "   Waiting for table to be active..."
    aws dynamodb wait table-exists --table-name user --region $REGION
    echo -e "${GREEN}✅ DynamoDB table created${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get S3 bucket name
echo "📦 S3 Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You need TWO S3 buckets:"
echo "  1. File uploads bucket (for contact form attachments)"
echo "  2. Frontend bucket (for website files)"
echo ""

read -p "Enter S3 bucket name for file uploads: " S3_BUCKET
if [ -z "$S3_BUCKET" ]; then
    echo -e "${RED}❌ Bucket name required${NC}"
    exit 1
fi

read -p "Enter S3 bucket name for frontend [default: ${S3_BUCKET}-frontend]: " FRONTEND_BUCKET
FRONTEND_BUCKET="${FRONTEND_BUCKET:-${S3_BUCKET}-frontend}"

echo ""
echo "Using buckets:"
echo "  • Uploads: $S3_BUCKET"
echo "  • Frontend: $FRONTEND_BUCKET"
echo ""

# Confirm
read -p "Continue with deployment? (y/N): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Export variables
export S3_BUCKET_NAME=$S3_BUCKET
export FRONTEND_BUCKET_NAME=$FRONTEND_BUCKET
export AWS_REGION=$REGION

# Step 1: Deploy Lambda Functions
echo "🚀 Step 1/3: Deploying Lambda Functions..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
chmod +x scripts/deploy-lambda.sh
./scripts/deploy-lambda.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Lambda deployment failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Lambda functions deployed${NC}"
echo ""

# Step 2: Create API Gateway
echo "🌐 Step 2/3: Creating API Gateway..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
chmod +x scripts/setup-api-gateway.sh
./scripts/setup-api-gateway.sh > /tmp/api-output.txt

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ API Gateway setup failed${NC}"
    cat /tmp/api-output.txt
    exit 1
fi

# Extract API endpoint
API_ENDPOINT=$(grep "API Endpoint:" /tmp/api-output.txt | awk '{print $3}')

echo ""
echo -e "${GREEN}✅ API Gateway created${NC}"
echo "   Endpoint: $API_ENDPOINT"
echo ""

# Step 3: Deploy Frontend
echo "🎨 Step 3/3: Deploying Frontend to S3..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"

export API_GATEWAY_ENDPOINT=$API_ENDPOINT

chmod +x scripts/deploy-frontend.sh
./scripts/deploy-frontend.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend deployment failed${NC}"
    exit 1
fi

WEBSITE_URL="http://${FRONTEND_BUCKET}.s3-website-${REGION}.amazonaws.com"

echo ""
echo -e "${GREEN}✅ Frontend deployed${NC}"
echo ""

# Test the deployment
echo "🧪 Testing Deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Testing API health endpoint..."
HEALTH_RESPONSE=$(curl -s "$API_ENDPOINT/test/health")

if echo "$HEALTH_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  API health check inconclusive${NC}"
    echo "   Response: $HEALTH_RESPONSE"
fi

echo ""
echo "Testing DynamoDB connection..."
DB_RESPONSE=$(curl -s "$API_ENDPOINT/test/test-dynamodb")

if echo "$DB_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ DynamoDB connection working${NC}"
else
    echo -e "${YELLOW}⚠️  DynamoDB connection issues${NC}"
    echo "   Response: $DB_RESPONSE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║          🎉 DEPLOYMENT SUCCESSFUL! 🎉                      ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "📊 Your AWS Resources:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Lambda Functions:"
echo "  • contact-form-handler"
echo "  • contact-form-test"
echo ""
echo "API Gateway:"
echo "  • Endpoint: $API_ENDPOINT"
echo ""
echo "S3 Buckets:"
echo "  • Uploads: s3://$S3_BUCKET"
echo "  • Frontend: s3://$FRONTEND_BUCKET"
echo ""
echo "DynamoDB:"
echo "  • Table: user"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Your Website:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  URL: $WEBSITE_URL"
echo ""
echo -e "${YELLOW}⚠️  Note: This URL uses HTTP only${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Test your website:"
echo "   open $WEBSITE_URL"
echo ""
echo "2. Submit a test contact form"
echo ""
echo "3. Set up CloudFront for HTTPS (Recommended):"
echo "   • Go to: https://console.aws.amazon.com/cloudfront/"
echo "   • Create distribution"
echo "   • Origin: $FRONTEND_BUCKET.s3-website-$REGION.amazonaws.com"
echo "   • See OPTION_2_DEPLOYMENT.md for detailed instructions"
echo ""
echo "4. Monitor with CloudWatch:"
echo "   aws logs tail /aws/lambda/contact-form-handler --follow"
echo ""
echo "5. Add custom domain (Optional):"
echo "   • Route 53 → CloudFront → S3"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Documentation:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "• Full guide: OPTION_2_DEPLOYMENT.md"
echo "• Troubleshooting: AWS_TROUBLESHOOTING.md"
echo "• Updates: See 'Making Updates' in OPTION_2_DEPLOYMENT.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Congratulations! Your site is live on AWS! 🚀${NC}"
echo ""
