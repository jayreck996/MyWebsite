# AWS Deployment Guide

This guide shows you how to deploy your personal website with contact form on AWS.

---

## 🎯 Deployment Options

You have **3 main options** for deploying on AWS:

| Option | Frontend | Backend | Difficulty | Cost | Best For |
|--------|----------|---------|------------|------|----------|
| **Option 1: AWS Amplify + Keep Supabase** | AWS Amplify | Supabase Edge Functions | ⭐ Easy | $ Low | Quick deployment, hybrid approach |
| **Option 2: S3/CloudFront + API Gateway** | S3 + CloudFront | API Gateway + Lambda | ⭐⭐ Medium | $$ Low | Full AWS solution |
| **Option 3: Full Amplify with Lambda** | AWS Amplify | AWS Lambda | ⭐⭐⭐ Advanced | $$ Medium | Fully managed AWS |

**Recommendation:** Start with **Option 1** (easiest), then migrate to Option 2 if needed.

---

## 📦 Option 1: AWS Amplify + Supabase (Recommended for Quick Start)

Deploy frontend on AWS Amplify, keep backend on Supabase Edge Functions.

### Architecture:
```
User → AWS Amplify (Frontend)
         ↓
      Supabase Edge Functions (Backend)
         ↓
      AWS Services (S3, DynamoDB)
```

### Prerequisites:
- AWS Account
- Supabase Account (you already have this)
- Git repository (GitHub, GitLab, or Bitbucket)

### Step 1: Push Code to Git

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create a GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Edge Functions to Supabase

```bash
# Make sure you're logged in to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy edge functions
supabase functions deploy server

# Set environment variables in Supabase Dashboard
# Go to: Project Settings → Edge Functions → Secrets
# Add all your AWS credentials
```

### Step 3: Deploy Frontend to AWS Amplify

1. **Go to AWS Amplify Console:**
   - https://console.aws.amazon.com/amplify/

2. **Click "New app" → "Host web app"**

3. **Connect your Git repository:**
   - Select GitHub/GitLab/Bitbucket
   - Authorize AWS Amplify
   - Select your repository and branch

4. **Configure build settings:**
   
   Create a file called `amplify.yml` in your project root:

   ```yaml
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
   ```

5. **Set environment variables in Amplify:**
   - Click "Environment variables" in Amplify console
   - Add `VITE_SUPABASE_PROJECT_ID` and `VITE_SUPABASE_ANON_KEY`
   - (These should match your Supabase project)

6. **Deploy:**
   - Click "Save and deploy"
   - Wait 3-5 minutes for build to complete

7. **Your site will be live at:**
   ```
   https://main.d1234567890.amplifyapp.com
   ```

8. **Optional: Add custom domain:**
   - In Amplify console → Domain management
   - Add your custom domain (e.g., `yourname.com`)

### Costs (Option 1):
- AWS Amplify: Free tier covers most small sites
- Supabase: Free tier (Edge Functions included)
- S3 + DynamoDB: Pay per use (~$1-5/month for low traffic)

---

## 📦 Option 2: Full AWS - S3/CloudFront + API Gateway

Deploy everything on AWS infrastructure.

### Architecture:
```
User → CloudFront → S3 (Frontend)
         ↓
      API Gateway → Lambda (Backend)
         ↓
      S3 + DynamoDB (Storage)
```

### Step 1: Build the Frontend

```bash
# Build the React app
npm run build

# This creates a 'dist' folder with static files
```

### Step 2: Create S3 Bucket for Frontend

```bash
# Replace YOUR-SITE-NAME with your actual site name
aws s3 mb s3://YOUR-SITE-NAME-frontend

# Enable static website hosting
aws s3 website s3://YOUR-SITE-NAME-frontend \
  --index-document index.html \
  --error-document index.html

# Upload files
aws s3 sync dist/ s3://YOUR-SITE-NAME-frontend \
  --acl public-read

# Set bucket policy for public access
cat > bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-SITE-NAME-frontend/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket YOUR-SITE-NAME-frontend \
  --policy file://bucket-policy.json
```

### Step 3: Create CloudFront Distribution

```bash
# Create CloudFront distribution (via AWS Console is easier)
# Go to: https://console.aws.amazon.com/cloudfront/

# Click "Create distribution"
# Origin domain: YOUR-SITE-NAME-frontend.s3.amazonaws.com
# Viewer protocol policy: Redirect HTTP to HTTPS
# Default root object: index.html
# Error pages: Custom error response for 404 → /index.html (for SPA routing)
```

### Step 4: Convert Edge Function to Lambda

Create a new file: `lambda/contact-handler.js`

```javascript
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  };

  // Handle OPTIONS for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Parse form data (you'll need to handle multipart/form-data)
    const body = JSON.parse(event.body);
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const submissionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Store in DynamoDB
    await dynamoDbClient.send(new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
        userId: { S: submissionId },
        name: { S: name },
        email: { S: email },
        message: { S: message },
        timestamp: { S: timestamp },
        status: { S: 'new' },
      },
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        submissionId,
        message: 'Contact form submitted successfully',
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to process contact form',
        details: error.message,
      }),
    };
  }
};
```

### Step 5: Deploy Lambda Function

```bash
# Create deployment package
cd lambda
npm init -y
npm install @aws-sdk/client-s3 @aws-sdk/client-dynamodb
zip -r function.zip .

# Create Lambda function
aws lambda create-function \
  --function-name contact-form-handler \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler contact-handler.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 256 \
  --environment Variables="{DYNAMODB_TABLE_NAME=user,AWS_REGION=us-east-1,S3_BUCKET_NAME=YOUR_BUCKET}"

# Grant Lambda permission to access DynamoDB and S3
# (Attach appropriate IAM policies to the Lambda execution role)
```

### Step 6: Create API Gateway

```bash
# Create API Gateway (REST API)
# Go to: https://console.aws.amazon.com/apigateway/

# Create new REST API
# Create resource: /contact
# Create method: POST
# Integration type: Lambda Function
# Lambda Function: contact-form-handler
# Enable CORS
# Deploy API to stage (e.g., 'prod')

# Your API will be available at:
# https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/contact
```

### Step 7: Update Frontend Config

Update `/utils/supabase/info.tsx` to point to API Gateway:

```typescript
// Change from Supabase to API Gateway
export const apiEndpoint = 'https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod';
export const apiKey = ''; // Not needed if using IAM auth
```

Update `/components/ContactForm.tsx`:

```typescript
const response = await fetch(
  `${apiEndpoint}/contact`,  // Changed from Supabase endpoint
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      message: formData.message,
    }),
  }
);
```

### Step 8: Rebuild and Redeploy Frontend

```bash
npm run build
aws s3 sync dist/ s3://YOUR-SITE-NAME-frontend --acl public-read
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Costs (Option 2):
- S3: ~$0.50/month
- CloudFront: Free tier + ~$1/month
- API Gateway: $3.50 per million requests
- Lambda: Free tier covers most small sites
- DynamoDB: Pay per use (~$1/month)
- **Total: ~$5-10/month for low traffic**

---

## 📦 Option 3: AWS Amplify with Lambda Backend

Use AWS Amplify CLI to manage everything.

### Step 1: Install Amplify CLI

```bash
npm install -g @aws-amplify/cli
amplify configure
```

### Step 2: Initialize Amplify

```bash
amplify init

# Follow prompts:
# Name: personal-website
# Environment: prod
# Editor: (your choice)
# Type of app: javascript
# Framework: react
# Source directory: src
# Distribution directory: dist
# Build command: npm run build
# Start command: npm run dev
```

### Step 3: Add Hosting

```bash
amplify add hosting

# Select: Amazon CloudFront and S3
```

### Step 4: Add API

```bash
amplify add api

# Select: REST
# Friendly name: contactApi
# Path: /contact
# Lambda source: Create a new Lambda function
# Function name: contactHandler
# Runtime: NodeJS
# Template: Serverless ExpressJS function
```

### Step 5: Update Lambda Function

Edit `amplify/backend/function/contactHandler/src/app.js` with your logic.

### Step 6: Deploy Everything

```bash
amplify push

# This will:
# - Create S3 bucket
# - Create CloudFront distribution
# - Create API Gateway
# - Create Lambda function
# - Set up all connections
```

### Step 7: Deploy Updates

```bash
# After making changes
npm run build
amplify publish
```

### Costs (Option 3):
- Same as Option 2 (~$5-10/month)
- Easier management with Amplify CLI

---

## 🔐 Security Best Practices

### 1. Use AWS Secrets Manager for Credentials

Instead of hardcoding AWS credentials:

```bash
# Store credentials in Secrets Manager
aws secretsmanager create-secret \
  --name contact-form/aws-creds \
  --secret-string '{"accessKeyId":"YOUR_KEY","secretAccessKey":"YOUR_SECRET"}'

# Lambda can retrieve them
const secret = await secretsManagerClient.send(
  new GetSecretValueCommand({ SecretId: "contact-form/aws-creds" })
);
```

### 2. Use IAM Roles (Not Access Keys)

For Lambda functions:
- Attach IAM role with specific permissions
- Don't hardcode access keys
- Use principle of least privilege

### 3. Enable CloudFront with HTTPS Only

```bash
# In CloudFront settings:
# Viewer Protocol Policy: Redirect HTTP to HTTPS
# SSL Certificate: Use ACM certificate
```

### 4. Set up WAF (Web Application Firewall)

```bash
# Protect against common attacks
# AWS Console → WAF → Create Web ACL
# Attach to CloudFront distribution
```

---

## 📊 Cost Comparison

### Low Traffic (1,000 visits/month, 50 form submissions)

| Option | Monthly Cost | Setup Time |
|--------|--------------|------------|
| Option 1 (Amplify + Supabase) | **$0-2** | 30 min |
| Option 2 (S3 + API Gateway) | **$5-8** | 3-4 hours |
| Option 3 (Full Amplify) | **$5-8** | 2-3 hours |

### Medium Traffic (10,000 visits/month, 500 form submissions)

| Option | Monthly Cost |
|--------|--------------|
| Option 1 | $2-5 |
| Option 2 | $10-15 |
| Option 3 | $10-15 |

---

## 🚀 Recommended Deployment Flow

### For Quick Start (Today):
```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# 2. Deploy to Amplify (via console)
# - Connect GitHub repo
# - Deploy automatically

# 3. Keep Supabase backend
supabase functions deploy server

# Done! ✅
```

### For Production (This Week):
```bash
# 1. Convert to full AWS (Option 2)
# 2. Set up CloudFront
# 3. Create Lambda functions
# 4. Set up custom domain
# 5. Enable HTTPS
# 6. Set up monitoring
```

---

## 🔄 CI/CD Setup (Automatic Deployments)

### With AWS Amplify (Automatic):
- Every git push automatically deploys
- No configuration needed
- Built-in preview environments

### With S3/CloudFront (Manual):

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to S3
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          aws s3 sync dist/ s3://YOUR-BUCKET-NAME --delete
          aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

## ✅ Deployment Checklist

- [ ] Choose deployment option (1, 2, or 3)
- [ ] Create AWS account (if not already)
- [ ] Set up S3 bucket for contact form attachments
- [ ] Set up DynamoDB table named "user" with partition key "userId"
- [ ] Deploy backend (Supabase or Lambda)
- [ ] Deploy frontend (Amplify or S3/CloudFront)
- [ ] Configure environment variables
- [ ] Test contact form submission
- [ ] Verify file upload to S3 works
- [ ] Verify DynamoDB write works
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS
- [ ] Set up monitoring/alerts
- [ ] Test on mobile devices
- [ ] Set up backup strategy

---

## 📝 Next Steps

1. **Choose your deployment option** (recommend Option 1 to start)
2. **Follow the steps above**
3. **Test everything thoroughly**
4. **Add custom domain** (optional)
5. **Set up monitoring** (CloudWatch)

Need help? Check these AWS resources:
- AWS Amplify Docs: https://docs.amplify.aws/
- S3 Static Website: https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html
- API Gateway: https://docs.aws.amazon.com/apigateway/

---

Good luck with your deployment! 🚀
