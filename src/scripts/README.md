# Deployment Scripts

This directory contains automated deployment scripts for Option 2 (Full AWS Deployment).

## 📁 Files

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `deploy-lambda.sh` | Deploy Lambda functions | Initial setup & Lambda updates |
| `setup-api-gateway.sh` | Create API Gateway | Initial setup & API changes |
| `deploy-frontend.sh` | Deploy React app to S3 | Initial setup & frontend updates |

## 🚀 Quick Start

### Option A: All-in-One Deployment

Run the master deployment script from the project root:

```bash
chmod +x deploy-option-2.sh
./deploy-option-2.sh
```

This will:
1. Check prerequisites
2. Deploy Lambda functions
3. Create API Gateway
4. Deploy frontend to S3
5. Test everything

### Option B: Step-by-Step Deployment

Run each script individually:

```bash
# 1. Deploy Lambda functions
cd /path/to/project
chmod +x scripts/deploy-lambda.sh
export S3_BUCKET_NAME=your-bucket-name
./scripts/deploy-lambda.sh

# 2. Create API Gateway
chmod +x scripts/setup-api-gateway.sh
./scripts/setup-api-gateway.sh

# 3. Deploy Frontend
chmod +x scripts/deploy-frontend.sh
export FRONTEND_BUCKET_NAME=your-site-frontend
export API_GATEWAY_ENDPOINT=https://abc123.execute-api.us-east-1.amazonaws.com/prod
./scripts/deploy-frontend.sh
```

## 📝 Script Details

### deploy-lambda.sh

**Prerequisites:**
- AWS CLI configured
- IAM permissions to create roles and Lambda functions
- S3 bucket for file uploads exists

**Environment Variables:**
- `S3_BUCKET_NAME` - S3 bucket for file uploads (required)
- `AWS_REGION` - AWS region (default: us-east-1)

**What it does:**
1. Creates IAM role `LambdaContactFormRole` with permissions
2. Installs npm dependencies
3. Packages Lambda functions
4. Deploys `contact-form-handler` function
5. Deploys `contact-form-test` function
6. Configures environment variables

**Output:**
- Lambda function ARNs
- Execution role ARN

**Test:**
```bash
aws lambda invoke \
  --function-name contact-form-test \
  --payload '{"path": "/health"}' \
  response.json
```

---

### setup-api-gateway.sh

**Prerequisites:**
- Lambda functions deployed
- AWS CLI configured

**Environment Variables:**
- `AWS_REGION` - AWS region (default: us-east-1)

**What it does:**
1. Creates REST API `ContactFormAPI`
2. Creates resources `/contact` and `/test/{proxy+}`
3. Sets up POST method for `/contact` → contact-form-handler
4. Sets up ANY method for `/test/*` → contact-form-test
5. Configures CORS
6. Deploys to `prod` stage

**Output:**
- API Gateway ID
- API endpoint URL

**Test:**
```bash
curl https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/test/health
```

---

### deploy-frontend.sh

**Prerequisites:**
- API Gateway created
- AWS CLI configured
- Node.js installed

**Environment Variables:**
- `FRONTEND_BUCKET_NAME` - S3 bucket for frontend (required)
- `API_GATEWAY_ENDPOINT` - API Gateway URL (required)
- `AWS_REGION` - AWS region (default: us-east-1)

**What it does:**
1. Creates S3 bucket (if doesn't exist)
2. Configures static website hosting
3. Sets bucket policy for public read
4. Updates API configuration
5. Builds React app
6. Uploads files to S3

**Output:**
- S3 website URL

**Test:**
Open the S3 website URL in your browser

---

## 🔄 Common Workflows

### Initial Deployment

```bash
# From project root
./deploy-option-2.sh
```

### Update Lambda Functions Only

```bash
# After changing lambda/*.js files
export S3_BUCKET_NAME=your-bucket-name
./scripts/deploy-lambda.sh
```

### Update Frontend Only

```bash
# After changing React components
export FRONTEND_BUCKET_NAME=your-site-frontend
export API_GATEWAY_ENDPOINT=https://abc123.execute-api.us-east-1.amazonaws.com/prod
./scripts/deploy-frontend.sh

# If using CloudFront, invalidate cache:
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Recreate API Gateway

```bash
# If you need to change API structure
./scripts/setup-api-gateway.sh
# It will ask if you want to delete and recreate
```

### Full Redeployment

```bash
# Nuclear option - redeploy everything
./deploy-option-2.sh
```

---

## 🐛 Troubleshooting

### Script fails with "Permission denied"

```bash
chmod +x scripts/*.sh
chmod +x deploy-option-2.sh
```

### "AWS CLI not found"

Install AWS CLI:
```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Windows
# Download and run: https://awscli.amazonaws.com/AWSCLIV2.msi
```

### "AWS credentials not configured"

```bash
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1
# - Default output format: json
```

### Lambda deployment fails

Check IAM permissions:
```bash
# Your user needs these permissions:
# - iam:CreateRole
# - iam:AttachRolePolicy
# - iam:CreatePolicy
# - lambda:CreateFunction
# - lambda:UpdateFunctionCode
# - lambda:UpdateFunctionConfiguration
```

### API Gateway setup fails

```bash
# Check if API already exists
aws apigateway get-rest-apis --region us-east-1

# Delete existing API if needed
aws apigateway delete-rest-api --rest-api-id YOUR_API_ID --region us-east-1

# Run setup again
./scripts/setup-api-gateway.sh
```

### Frontend deployment fails during build

```bash
# Clear node_modules and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build

# Then retry deployment
./scripts/deploy-frontend.sh
```

### S3 bucket already exists (owned by someone else)

```bash
# Choose a different bucket name
export FRONTEND_BUCKET_NAME=your-unique-name-12345
./scripts/deploy-frontend.sh
```

---

## 📊 Monitoring Deployed Resources

### View Lambda Logs

```bash
# Real-time logs
aws logs tail /aws/lambda/contact-form-handler --follow --region us-east-1

# Last 10 minutes
aws logs tail /aws/lambda/contact-form-handler --since 10m --region us-east-1
```

### Check API Gateway Metrics

```bash
# Get request count
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiName,Value=ContactFormAPI \
  --statistics Sum \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --region us-east-1
```

### Check S3 Bucket Contents

```bash
# Frontend files
aws s3 ls s3://your-site-frontend/ --recursive

# Uploaded files
aws s3 ls s3://your-bucket-name/contact-attachments/
```

### Check DynamoDB Items

```bash
# Scan table
aws dynamodb scan --table-name user --region us-east-1

# Count items
aws dynamodb describe-table --table-name user --query 'Table.ItemCount' --region us-east-1
```

---

## 🧹 Cleanup (Delete Everything)

If you want to remove all deployed resources:

```bash
# Delete Lambda functions
aws lambda delete-function --function-name contact-form-handler --region us-east-1
aws lambda delete-function --function-name contact-form-test --region us-east-1

# Delete API Gateway
API_ID=$(aws apigateway get-rest-apis --query "items[?name=='ContactFormAPI'].id" --output text --region us-east-1)
aws apigateway delete-rest-api --rest-api-id $API_ID --region us-east-1

# Delete S3 buckets
aws s3 rb s3://your-site-frontend --force
# (Don't delete your uploads bucket if you need the files)

# Delete IAM role and policy
aws iam detach-role-policy \
  --role-name LambdaContactFormRole \
  --policy-arn arn:aws:iam::298552056601:policy/LambdaContactFormRolePolicy

aws iam delete-role --role-name LambdaContactFormRole

aws iam delete-policy \
  --policy-arn arn:aws:iam::298552056601:policy/LambdaContactFormRolePolicy

# Note: DynamoDB table is NOT deleted (contains your data)
# Delete manually if needed:
# aws dynamodb delete-table --table-name user --region us-east-1
```

---

## 📚 Additional Resources

- **Full deployment guide:** `/OPTION_2_DEPLOYMENT.md`
- **Troubleshooting:** `/AWS_TROUBLESHOOTING.md`
- **DynamoDB issues:** `/FIX_DYNAMODB_ZERO_ITEMS.md`
- **AWS Lambda docs:** https://docs.aws.amazon.com/lambda/
- **API Gateway docs:** https://docs.aws.amazon.com/apigateway/
- **S3 static hosting:** https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html

---

## 💡 Tips

1. **Use environment variables** to avoid hardcoding values
2. **Test each step** before moving to the next
3. **Check CloudWatch logs** if something doesn't work
4. **Enable versioning** on production buckets
5. **Set up CloudWatch alarms** for errors
6. **Use CloudFront** for HTTPS and better performance
7. **Implement CI/CD** with GitHub Actions for auto-deployment

---

Good luck with your deployment! 🚀
