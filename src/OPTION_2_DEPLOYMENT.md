# Option 2: Full AWS Deployment Guide

Complete step-by-step guide for deploying your site using S3/CloudFront + API Gateway + Lambda.

---

## 📋 What You're Building

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   CloudFront    │ (CDN + HTTPS)
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐  ┌──────────────┐
│   S3  │  │ API Gateway  │
│(HTML) │  └──────┬───────┘
└───────┘         │
                  ▼
            ┌──────────┐
            │  Lambda  │ (Contact Handler)
            └─────┬────┘
                  │
         ┌────────┴────────┐
         ▼                 ▼
    ┌─────────┐      ┌──────────┐
    │   S3    │      │ DynamoDB │
    │(Files)  │      │  (Data)  │
    └─────────┘      └──────────┘
```

---

## ⚙️ Prerequisites

Before starting, make sure you have:

- [x] AWS Account
- [x] AWS CLI installed and configured
  ```bash
  aws --version
  aws configure
  ```
- [x] Node.js installed (v18+)
- [x] S3 bucket for file uploads (already exists)
- [x] DynamoDB table named `user` with partition key `userId`
- [x] Your code ready to deploy

---

## 🚀 Deployment Steps

### Step 0: Verify Your Current Setup (2 minutes)

```bash
# Check if AWS CLI is configured
aws sts get-caller-identity

# You should see your Account ID: 298552056601
# And your IAM user

# Check if DynamoDB table exists
aws dynamodb describe-table --table-name user --region us-east-1

# Check if S3 bucket exists
aws s3 ls | grep your-bucket-name
```

### Step 1: Deploy Lambda Functions (5 minutes)

```bash
# Make the script executable
chmod +x scripts/deploy-lambda.sh

# Set your S3 bucket name
export S3_BUCKET_NAME=your-bucket-name-here

# Run deployment
./scripts/deploy-lambda.sh
```

**What this does:**
- Creates IAM role for Lambda with proper permissions
- Packages Lambda functions
- Deploys contact handler
- Deploys test/diagnostic handler

**Expected output:**
```
✅ Lambda Functions Deployed Successfully!

Lambda Functions:
  • contact-form-handler
  • contact-form-test
```

**Test it:**
```bash
# Test the Lambda function directly
aws lambda invoke \
  --function-name contact-form-test \
  --payload '{"path": "/health"}' \
  response.json \
  --region us-east-1

cat response.json
# Should show: {"success": true, "message": "Lambda function is healthy"}
```

### Step 2: Create API Gateway (5 minutes)

```bash
# Make the script executable
chmod +x scripts/setup-api-gateway.sh

# Run setup
./scripts/setup-api-gateway.sh
```

**What this does:**
- Creates REST API in API Gateway
- Sets up `/contact` endpoint → contact-form-handler
- Sets up `/test/*` endpoints → contact-form-test
- Configures CORS for frontend access
- Deploys to 'prod' stage

**Expected output:**
```
✅ API Gateway Created Successfully!

API Endpoint: https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod

Available Endpoints:
  • POST https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/contact
  • GET  https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/test/health
  ...
```

**IMPORTANT:** Copy this API endpoint URL - you'll need it for the next step!

**Test it:**
```bash
# Replace with your actual endpoint
API_ENDPOINT="https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod"

# Test health endpoint
curl $API_ENDPOINT/test/health

# Should return: {"success":true,"message":"Lambda function is healthy",...}

# Test DynamoDB connection
curl $API_ENDPOINT/test/test-dynamodb

# Test write
curl -X POST $API_ENDPOINT/test/test-write
```

### Step 3: Deploy Frontend to S3 (5 minutes)

```bash
# Make the script executable
chmod +x scripts/deploy-frontend.sh

# Set your configuration
export FRONTEND_BUCKET_NAME=your-site-frontend
export API_GATEWAY_ENDPOINT=https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod

# Run deployment
./scripts/deploy-frontend.sh
```

**What this does:**
- Creates S3 bucket for frontend
- Configures static website hosting
- Updates API configuration to use API Gateway
- Builds the React app
- Uploads files to S3

**Expected output:**
```
✅ Frontend Deployed Successfully!

Website URL: http://your-site-frontend.s3-website-us-east-1.amazonaws.com
```

**Test it:**
Open the website URL in your browser. You should see your site!

### Step 4: Test the Contact Form (3 minutes)

1. **Open your website**
2. **Fill out the contact form:**
   - Name: Test User
   - Email: test@example.com
   - Message: Testing AWS deployment
   - Attach a small file (optional)
3. **Submit the form**
4. **Check for success message**

**Verify submission:**

```bash
# Check CloudWatch logs
aws logs tail /aws/lambda/contact-form-handler --follow --region us-east-1

# Check DynamoDB
aws dynamodb scan --table-name user --region us-east-1

# Check S3 for uploaded files
aws s3 ls s3://your-bucket-name/contact-attachments/
```

### Step 5: Set Up CloudFront (Optional but Recommended) (10 minutes)

CloudFront provides:
- ✅ HTTPS/SSL
- ✅ Global CDN
- ✅ Better performance
- ✅ Custom domain support

**Manual Setup (AWS Console):**

1. **Go to CloudFront Console:**
   https://console.aws.amazon.com/cloudfront/

2. **Click "Create distribution"**

3. **Configure:**
   - **Origin domain:** your-site-frontend.s3-website-us-east-1.amazonaws.com
   - **Viewer protocol policy:** Redirect HTTP to HTTPS
   - **Allowed HTTP methods:** GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - **Cache policy:** CachingOptimized
   - **Origin request policy:** CORS-S3Origin

4. **Error pages (Important for SPA):**
   - Click "Error pages" tab
   - Create custom error response:
     - HTTP error code: 404
     - Customize error response: Yes
     - Response page path: /index.html
     - HTTP response code: 200

5. **Click "Create distribution"**

6. **Wait 10-15 minutes** for deployment

7. **Your site will be available at:**
   ```
   https://d1234567890.cloudfront.net
   ```

---

## ✅ Deployment Complete!

### Your AWS Resources:

| Resource | Name/ID | Purpose |
|----------|---------|---------|
| Lambda (Contact) | contact-form-handler | Processes contact form |
| Lambda (Test) | contact-form-test | Diagnostic endpoints |
| API Gateway | ContactFormAPI | REST API endpoints |
| S3 (Frontend) | your-site-frontend | Website files |
| S3 (Uploads) | your-bucket-name | File uploads |
| DynamoDB | user | Form submissions |
| CloudFront | (optional) | CDN + HTTPS |

### URLs:

- **API Endpoint:** https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
- **S3 Website:** http://your-site-frontend.s3-website-us-east-1.amazonaws.com
- **CloudFront:** https://d1234567890.cloudfront.net (if configured)

---

## 🔄 Making Updates

### Update Lambda Functions:

```bash
# Make changes to lambda/*.js files
./scripts/deploy-lambda.sh
```

### Update Frontend:

```bash
# Make changes to React components
./scripts/deploy-frontend.sh

# If using CloudFront, invalidate cache:
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Update API Gateway:

```bash
# Re-run setup (it will ask to recreate)
./scripts/setup-api-gateway.sh
```

---

## 🐛 Troubleshooting

### Lambda function errors?

```bash
# View logs in real-time
aws logs tail /aws/lambda/contact-form-handler --follow --region us-east-1

# Check last 10 minutes
aws logs tail /aws/lambda/contact-form-handler --since 10m --region us-east-1
```

### Form submission fails?

1. **Check browser console** for errors
2. **Test API directly:**
   ```bash
   curl -X POST https://YOUR_API.execute-api.us-east-1.amazonaws.com/prod/test/test-write
   ```
3. **Check Lambda permissions** in IAM Console
4. **Verify CORS** is enabled on API Gateway

### DynamoDB empty?

```bash
# Test write directly
curl -X POST https://YOUR_API.execute-api.us-east-1.amazonaws.com/prod/test/test-write

# Check logs
aws logs tail /aws/lambda/contact-form-handler --region us-east-1

# Verify permissions
aws iam get-role-policy \
  --role-name LambdaContactFormRole \
  --policy-name LambdaContactFormRolePolicy
```

### S3 upload fails?

1. **Check Lambda role permissions**
2. **Verify S3 bucket name** in environment variables
3. **Check CloudWatch logs** for detailed error

---

## 💰 Cost Estimate

Based on 1,000 visits/month, 50 form submissions:

| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 100 requests/month | Free tier |
| API Gateway | 100 requests/month | Free tier |
| S3 (Frontend) | 1 GB storage, 10 GB transfer | $0.50 |
| S3 (Uploads) | 100 MB storage | $0.02 |
| DynamoDB | 50 writes, read capacity | $0.50 |
| CloudFront | 10 GB transfer | $0.85 |
| **Total** | | **~$2-5/month** |

After free tier expires: ~$5-10/month

---

## 🔐 Security Best Practices

### 1. Enable Lambda Function URLs Authentication (Optional)

```bash
aws lambda update-function-url-config \
  --function-name contact-form-handler \
  --auth-type AWS_IAM
```

### 2. Add API Key to API Gateway

```bash
# Create API key
aws apigateway create-api-key \
  --name contact-form-key \
  --enabled

# Associate with usage plan
# (See AWS docs for full setup)
```

### 3. Enable S3 Bucket Versioning

```bash
aws s3api put-bucket-versioning \
  --bucket your-bucket-name \
  --versioning-configuration Status=Enabled
```

### 4. Set up CloudWatch Alarms

```bash
# Monitor Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name lambda-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

---

## 📊 Monitoring

### View Metrics:

```bash
# Lambda invocations
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=contact-form-handler \
  --statistics Sum \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600

# API Gateway requests
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiName,Value=ContactFormAPI \
  --statistics Sum \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600
```

### Set Up Alarms:

- Lambda errors > 5 in 5 minutes
- API Gateway 5xx errors > 10 in 5 minutes
- DynamoDB throttled requests > 0

---

## 🎯 Next Steps

- [ ] Set up custom domain (Route 53)
- [ ] Enable AWS WAF for security
- [ ] Add email notifications (SNS + Lambda)
- [ ] Set up backup strategy (DynamoDB backups)
- [ ] Configure CloudWatch dashboards
- [ ] Add monitoring and alerts
- [ ] Implement rate limiting
- [ ] Add reCAPTCHA to form

---

## 🆘 Getting Help

If you run into issues:

1. **Check the logs first:**
   ```bash
   aws logs tail /aws/lambda/contact-form-handler --follow
   ```

2. **Test each component:**
   - Lambda: Direct invoke
   - API Gateway: curl commands
   - Frontend: Browser dev tools

3. **Common issues:**
   - CORS errors → Check API Gateway CORS settings
   - 403 errors → Check IAM permissions
   - 500 errors → Check Lambda logs

4. **Reference docs:**
   - `AWS_DEPLOYMENT_GUIDE.md` - Full deployment options
   - `DEPLOYMENT_CHECKLIST.md` - Testing checklist
   - `FIX_DYNAMODB_ZERO_ITEMS.md` - DynamoDB issues

---

## ✅ Success Checklist

- [ ] Lambda functions deployed
- [ ] API Gateway created
- [ ] Frontend deployed to S3
- [ ] CloudFront configured (optional)
- [ ] Test contact form works
- [ ] DynamoDB receives submissions
- [ ] S3 receives file uploads
- [ ] No errors in CloudWatch logs
- [ ] Site accessible via HTTPS
- [ ] Mobile responsive

---

**Congratulations! Your site is now fully deployed on AWS! 🎉**

Your architecture is scalable, secure, and production-ready.
