#!/bin/bash

# Deploy Lambda Functions to AWS
# This script packages and deploys the Lambda functions for Option 2

set -e

echo "🚀 Lambda Deployment Script"
echo "============================"
echo ""

# Configuration
REGION="${AWS_REGION:-us-east-1}"
ACCOUNT_ID="298552056601"
DYNAMODB_TABLE="user"
S3_BUCKET="${S3_BUCKET_NAME:-}"

# Lambda function names
CONTACT_FUNCTION="contact-form-handler"
TEST_FUNCTION="contact-form-test"

# IAM role name
ROLE_NAME="LambdaContactFormRole"

echo "📋 Configuration:"
echo "  Region: $REGION"
echo "  Account: $ACCOUNT_ID"
echo "  DynamoDB Table: $DYNAMODB_TABLE"
echo "  S3 Bucket: $S3_BUCKET"
echo ""

# Check if S3 bucket is set
if [ -z "$S3_BUCKET" ]; then
    echo "⚠️  WARNING: S3_BUCKET_NAME environment variable not set"
    echo "   Set it with: export S3_BUCKET_NAME=your-bucket-name"
    echo ""
    read -p "Enter your S3 bucket name: " S3_BUCKET
    
    if [ -z "$S3_BUCKET" ]; then
        echo "❌ S3 bucket name is required. Exiting."
        exit 1
    fi
fi

# Step 1: Create IAM Role for Lambda
echo "📝 Step 1: Creating IAM Role..."

ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text 2>/dev/null || echo "")

if [ -z "$ROLE_ARN" ]; then
    echo "Creating new IAM role: $ROLE_NAME"
    
    # Create the role
    aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document file://infrastructure/lambda-trust-policy.json \
        --description "Execution role for contact form Lambda functions"
    
    # Wait for role to be created
    sleep 5
    
    # Update the IAM policy with the correct S3 bucket
    sed "s/YOUR_S3_BUCKET_NAME/${S3_BUCKET}/g" infrastructure/iam-policy.json > /tmp/lambda-policy.json
    
    # Create and attach the policy
    POLICY_ARN=$(aws iam create-policy \
        --policy-name "${ROLE_NAME}Policy" \
        --policy-document file:///tmp/lambda-policy.json \
        --query 'Policy.Arn' \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$POLICY_ARN" ]; then
        # Policy might already exist, try to get its ARN
        POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/${ROLE_NAME}Policy"
    fi
    
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn $POLICY_ARN
    
    # Attach basic Lambda execution policy
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    # Get the role ARN
    ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
    
    echo "✅ IAM Role created: $ROLE_ARN"
    echo "⏳ Waiting 10 seconds for IAM role to propagate..."
    sleep 10
else
    echo "✅ IAM Role already exists: $ROLE_ARN"
fi

# Step 2: Package Lambda Functions
echo ""
echo "📦 Step 2: Packaging Lambda functions..."

cd lambda

# Install dependencies
echo "Installing dependencies..."
npm install

# Package contact handler
echo "Packaging contact-handler..."
zip -q -r ../contact-function.zip contact-handler.js package.json package-lock.json node_modules/

# Package test handler
echo "Packaging test-handler..."
zip -q -r ../test-function.zip test-handler.js package.json package-lock.json node_modules/

cd ..

echo "✅ Lambda functions packaged"

# Step 3: Create or Update Contact Handler Lambda
echo ""
echo "🚀 Step 3: Deploying Contact Handler Lambda..."

if aws lambda get-function --function-name $CONTACT_FUNCTION --region $REGION >/dev/null 2>&1; then
    echo "Updating existing function: $CONTACT_FUNCTION"
    aws lambda update-function-code \
        --function-name $CONTACT_FUNCTION \
        --zip-file fileb://contact-function.zip \
        --region $REGION
    
    aws lambda update-function-configuration \
        --function-name $CONTACT_FUNCTION \
        --environment "Variables={DYNAMODB_TABLE_NAME=${DYNAMODB_TABLE},S3_BUCKET_NAME=${S3_BUCKET},AWS_REGION=${REGION}}" \
        --region $REGION
else
    echo "Creating new function: $CONTACT_FUNCTION"
    aws lambda create-function \
        --function-name $CONTACT_FUNCTION \
        --runtime nodejs18.x \
        --role $ROLE_ARN \
        --handler contact-handler.handler \
        --zip-file fileb://contact-function.zip \
        --timeout 30 \
        --memory-size 512 \
        --environment "Variables={DYNAMODB_TABLE_NAME=${DYNAMODB_TABLE},S3_BUCKET_NAME=${S3_BUCKET},AWS_REGION=${REGION}}" \
        --region $REGION
fi

echo "✅ Contact handler deployed"

# Step 4: Create or Update Test Handler Lambda
echo ""
echo "🚀 Step 4: Deploying Test Handler Lambda..."

if aws lambda get-function --function-name $TEST_FUNCTION --region $REGION >/dev/null 2>&1; then
    echo "Updating existing function: $TEST_FUNCTION"
    aws lambda update-function-code \
        --function-name $TEST_FUNCTION \
        --zip-file fileb://test-function.zip \
        --region $REGION
    
    aws lambda update-function-configuration \
        --function-name $TEST_FUNCTION \
        --environment "Variables={DYNAMODB_TABLE_NAME=${DYNAMODB_TABLE},S3_BUCKET_NAME=${S3_BUCKET},AWS_REGION=${REGION}}" \
        --region $REGION
else
    echo "Creating new function: $TEST_FUNCTION"
    aws lambda create-function \
        --function-name $TEST_FUNCTION \
        --runtime nodejs18.x \
        --role $ROLE_ARN \
        --handler test-handler.handler \
        --zip-file fileb://test-function.zip \
        --timeout 30 \
        --memory-size 256 \
        --environment "Variables={DYNAMODB_TABLE_NAME=${DYNAMODB_TABLE},S3_BUCKET_NAME=${S3_BUCKET},AWS_REGION=${REGION}}" \
        --region $REGION
fi

echo "✅ Test handler deployed"

# Cleanup
echo ""
echo "🧹 Cleaning up deployment packages..."
rm -f contact-function.zip test-function.zip

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Lambda Functions Deployed Successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Lambda Functions:"
echo "  • $CONTACT_FUNCTION"
echo "  • $TEST_FUNCTION"
echo ""
echo "Next Steps:"
echo "  1. Create API Gateway (run: ./scripts/setup-api-gateway.sh)"
echo "  2. Test the Lambda functions"
echo "  3. Deploy frontend to S3/CloudFront"
echo ""
echo "To test Lambda directly:"
echo "  aws lambda invoke --function-name $TEST_FUNCTION --payload '{}' response.json --region $REGION"
echo ""
