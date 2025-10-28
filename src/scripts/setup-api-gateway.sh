#!/bin/bash

# Setup API Gateway for Lambda Functions
# Creates REST API with proper CORS configuration

set -e

echo "🌐 API Gateway Setup Script"
echo "============================"
echo ""

REGION="${AWS_REGION:-us-east-1}"
ACCOUNT_ID="298552056601"
API_NAME="ContactFormAPI"
CONTACT_FUNCTION="contact-form-handler"
TEST_FUNCTION="contact-form-test"

echo "📋 Configuration:"
echo "  Region: $REGION"
echo "  API Name: $API_NAME"
echo ""

# Check if API already exists
API_ID=$(aws apigateway get-rest-apis --region $REGION --query "items[?name=='$API_NAME'].id" --output text)

if [ -n "$API_ID" ]; then
    echo "⚠️  API Gateway '$API_NAME' already exists (ID: $API_ID)"
    read -p "Do you want to delete and recreate it? (y/N): " RECREATE
    
    if [ "$RECREATE" = "y" ] || [ "$RECREATE" = "Y" ]; then
        echo "Deleting existing API..."
        aws apigateway delete-rest-api --rest-api-id $API_ID --region $REGION
        API_ID=""
    else
        echo "Using existing API. Skipping creation."
        echo "API Endpoint: https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"
        exit 0
    fi
fi

# Create REST API
echo "📝 Creating REST API..."
API_ID=$(aws apigateway create-rest-api \
    --name $API_NAME \
    --description "API for contact form" \
    --endpoint-configuration types=REGIONAL \
    --region $REGION \
    --query 'id' \
    --output text)

echo "✅ API created: $API_ID"

# Get root resource ID
ROOT_ID=$(aws apigateway get-resources \
    --rest-api-id $API_ID \
    --region $REGION \
    --query 'items[0].id' \
    --output text)

echo "Root resource ID: $ROOT_ID"

# Create /contact resource
echo ""
echo "📝 Creating /contact resource..."
CONTACT_RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_ID \
    --path-part contact \
    --region $REGION \
    --query 'id' \
    --output text)

# Create /test resource
echo "📝 Creating /test resource..."
TEST_RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_ID \
    --path-part test \
    --region $REGION \
    --query 'id' \
    --output text)

# Create /test/{proxy+} for all test endpoints
echo "📝 Creating /test/{proxy+} resource..."
TEST_PROXY_RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $TEST_RESOURCE_ID \
    --path-part '{proxy+}' \
    --region $REGION \
    --query 'id' \
    --output text)

# Function to create method with Lambda integration
create_method_with_lambda() {
    local RESOURCE_ID=$1
    local HTTP_METHOD=$2
    local FUNCTION_NAME=$3
    local PROXY_RESOURCE=$4
    
    echo "Creating $HTTP_METHOD method for $FUNCTION_NAME..."
    
    # Create method
    aws apigateway put-method \
        --rest-api-id $API_ID \
        --resource-id $RESOURCE_ID \
        --http-method $HTTP_METHOD \
        --authorization-type NONE \
        --region $REGION >/dev/null
    
    # Create integration
    LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}"
    
    if [ "$PROXY_RESOURCE" = "true" ]; then
        aws apigateway put-integration \
            --rest-api-id $API_ID \
            --resource-id $RESOURCE_ID \
            --http-method $HTTP_METHOD \
            --type AWS_PROXY \
            --integration-http-method POST \
            --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations" \
            --region $REGION >/dev/null
    else
        aws apigateway put-integration \
            --rest-api-id $API_ID \
            --resource-id $RESOURCE_ID \
            --http-method $HTTP_METHOD \
            --type AWS_PROXY \
            --integration-http-method POST \
            --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations" \
            --region $REGION >/dev/null
    fi
    
    # Add Lambda permission
    aws lambda add-permission \
        --function-name $FUNCTION_NAME \
        --statement-id "apigateway-${RESOURCE_ID}-${HTTP_METHOD}" \
        --action lambda:InvokeFunction \
        --principal apigateway.amazonaws.com \
        --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/${HTTP_METHOD}/*" \
        --region $REGION 2>/dev/null || echo "  (Permission may already exist)"
}

# Create OPTIONS method for CORS
create_cors_method() {
    local RESOURCE_ID=$1
    
    echo "Creating OPTIONS method for CORS..."
    
    aws apigateway put-method \
        --rest-api-id $API_ID \
        --resource-id $RESOURCE_ID \
        --http-method OPTIONS \
        --authorization-type NONE \
        --region $REGION >/dev/null
    
    aws apigateway put-integration \
        --rest-api-id $API_ID \
        --resource-id $RESOURCE_ID \
        --http-method OPTIONS \
        --type MOCK \
        --request-templates '{"application/json": "{\"statusCode\": 200}"}' \
        --region $REGION >/dev/null
    
    aws apigateway put-method-response \
        --rest-api-id $API_ID \
        --resource-id $RESOURCE_ID \
        --http-method OPTIONS \
        --status-code 200 \
        --response-parameters '{"method.response.header.Access-Control-Allow-Headers": false, "method.response.header.Access-Control-Allow-Methods": false, "method.response.header.Access-Control-Allow-Origin": false}' \
        --region $REGION >/dev/null
    
    aws apigateway put-integration-response \
        --rest-api-id $API_ID \
        --resource-id $RESOURCE_ID \
        --http-method OPTIONS \
        --status-code 200 \
        --response-parameters '{"method.response.header.Access-Control-Allow-Headers": "'"'"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"'"'", "method.response.header.Access-Control-Allow-Methods": "'"'"'GET,POST,OPTIONS'"'"'", "method.response.header.Access-Control-Allow-Origin": "'"'"'*'"'"'"}' \
        --region $REGION >/dev/null
}

# Setup /contact endpoint
echo ""
echo "🔧 Setting up /contact endpoint..."
create_method_with_lambda $CONTACT_RESOURCE_ID POST $CONTACT_FUNCTION false
create_cors_method $CONTACT_RESOURCE_ID

# Setup /test/{proxy+} endpoint
echo ""
echo "🔧 Setting up /test/* endpoints..."
create_method_with_lambda $TEST_PROXY_RESOURCE_ID ANY $TEST_FUNCTION true
create_cors_method $TEST_PROXY_RESOURCE_ID

# Deploy API
echo ""
echo "🚀 Deploying API to 'prod' stage..."
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name prod \
    --region $REGION >/dev/null

echo "✅ API deployed"

# Get the invoke URL
INVOKE_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ API Gateway Created Successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "API Endpoint: $INVOKE_URL"
echo ""
echo "Available Endpoints:"
echo "  • POST $INVOKE_URL/contact"
echo "  • GET  $INVOKE_URL/test/health"
echo "  • GET  $INVOKE_URL/test/aws-config"
echo "  • GET  $INVOKE_URL/test/test-dynamodb"
echo "  • POST $INVOKE_URL/test/test-write"
echo ""
echo "Next Steps:"
echo "  1. Test the API:"
echo "     curl $INVOKE_URL/test/health"
echo ""
echo "  2. Update frontend config:"
echo "     Edit utils/api-config.ts with API endpoint"
echo ""
echo "  3. Deploy frontend to S3/CloudFront"
echo ""
echo "Save this API endpoint - you'll need it for the frontend!"
echo ""
