# Option 2: Quick Start Guide

Deploy your site to AWS in 15 minutes using Lambda + API Gateway + S3.

---

## ⚡ Super Quick Deploy

```bash
# 1. Make script executable
chmod +x deploy-option-2.sh

# 2. Run it!
./deploy-option-2.sh

# That's it! Follow the prompts.
```

The script will ask you for:
- S3 bucket name for uploads
- S3 bucket name for frontend

Then it automatically:
✅ Deploys Lambda functions  
✅ Creates API Gateway  
✅ Deploys frontend to S3  
✅ Tests everything  

---

## 📋 Prerequisites (2 minutes)

Make sure you have:

```bash
# 1. AWS CLI installed
aws --version

# 2. AWS credentials configured
aws configure

# 3. Node.js installed
node --version

# 4. Your S3 bucket name ready
# Example: my-contact-form-uploads
```

---

## 🚀 Step-by-Step (15 minutes)

### Step 1: Run Deployment Script

```bash
./deploy-option-2.sh
```

### Step 2: Answer Prompts

```
Enter S3 bucket name for file uploads: my-uploads
Enter S3 bucket name for frontend: my-site-frontend
Continue with deployment? (y/N): y
```

### Step 3: Wait for Deployment

The script will:
- Create Lambda functions (2 min)
- Create API Gateway (2 min)
- Build and deploy frontend (3 min)

### Step 4: Test Your Site

Open the URL provided:
```
http://my-site-frontend.s3-website-us-east-1.amazonaws.com
```

Submit a test contact form!

---

## ✅ What You Get

After deployment:

| Resource | Name | Purpose |
|----------|------|---------|
| 🔧 Lambda | contact-form-handler | Processes forms |
| 🔧 Lambda | contact-form-test | Diagnostics |
| 🌐 API Gateway | ContactFormAPI | REST API |
| 📦 S3 Bucket | your-site-frontend | Website files |
| 📦 S3 Bucket | your-uploads | File attachments |
| 💾 DynamoDB | user | Form data |

---

## 🌐 Your URLs

**Website:**
```
http://your-site-frontend.s3-website-us-east-1.amazonaws.com
```

**API:**
```
https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
```

---

## 🧪 Test Everything

### Test API Health

```bash
# Replace with your actual endpoint
curl https://YOUR_API.execute-api.us-east-1.amazonaws.com/prod/test/health
```

Should return:
```json
{"success": true, "message": "Lambda function is healthy"}
```

### Test Contact Form

1. Open your website
2. Fill out the form
3. Submit
4. Check for success message

### Verify in AWS Console

**DynamoDB:**
- Go to: https://console.aws.amazon.com/dynamodb/
- Tables → user → Items
- You should see your submission

**S3:**
- Go to: https://console.aws.amazon.com/s3/
- Click your uploads bucket
- Look in `contact-attachments/` folder

---

## 🔄 Making Updates

### Update Frontend

```bash
# Make changes to React components
# Then run:

export FRONTEND_BUCKET_NAME=your-site-frontend
export API_GATEWAY_ENDPOINT=https://abc123.execute-api.us-east-1.amazonaws.com/prod
./scripts/deploy-frontend.sh
```

### Update Lambda

```bash
# Make changes to lambda/*.js files
# Then run:

export S3_BUCKET_NAME=your-uploads
./scripts/deploy-lambda.sh
```

---

## 📊 View Logs

```bash
# Real-time Lambda logs
aws logs tail /aws/lambda/contact-form-handler --follow

# Last 10 minutes
aws logs tail /aws/lambda/contact-form-handler --since 10m
```

---

## 🔒 Add HTTPS (Recommended)

Your S3 website uses HTTP. For HTTPS, set up CloudFront:

### Quick CloudFront Setup

1. **Go to CloudFront Console:**
   https://console.aws.amazon.com/cloudfront/

2. **Create Distribution:**
   - Origin: `your-site-frontend.s3-website-us-east-1.amazonaws.com`
   - Viewer Protocol: Redirect HTTP to HTTPS
   - Click Create

3. **Wait 10-15 minutes**

4. **Your HTTPS URL:**
   ```
   https://d1234567890.cloudfront.net
   ```

See `OPTION_2_DEPLOYMENT.md` for detailed CloudFront setup.

---

## 🐛 Troubleshooting

### Build fails?

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Form doesn't submit?

```bash
# Check API endpoint
curl https://YOUR_API.execute-api.us-east-1.amazonaws.com/prod/test/health

# Check Lambda logs
aws logs tail /aws/lambda/contact-form-handler --follow
```

### DynamoDB empty?

```bash
# Test write directly
curl -X POST https://YOUR_API.execute-api.us-east-1.amazonaws.com/prod/test/test-write

# Check logs for errors
aws logs tail /aws/lambda/contact-form-handler
```

### Permission errors?

Make sure your IAM user has these permissions:
- `lambda:*`
- `apigateway:*`
- `s3:*`
- `iam:CreateRole`
- `iam:AttachRolePolicy`

---

## 💰 Costs

For small sites (1,000 visits/month):

| Service | Cost |
|---------|------|
| Lambda | Free tier |
| API Gateway | Free tier |
| S3 | $0.50/month |
| DynamoDB | $0.50/month |
| CloudFront | $0.85/month |
| **Total** | **$2-5/month** |

After free tier expires: ~$5-10/month

---

## 📚 More Help

- **Detailed guide:** `OPTION_2_DEPLOYMENT.md`
- **Script reference:** `scripts/README.md`
- **Troubleshooting:** `AWS_TROUBLESHOOTING.md`
- **DynamoDB issues:** `FIX_DYNAMODB_ZERO_ITEMS.md`

---

## ✨ Next Steps

After basic deployment works:

- [ ] Set up CloudFront for HTTPS
- [ ] Add custom domain
- [ ] Enable monitoring/alerts
- [ ] Set up automatic backups
- [ ] Add email notifications
- [ ] Implement rate limiting

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| "Permission denied" | Run `chmod +x deploy-option-2.sh` |
| "Bucket already exists" | Use a unique bucket name |
| CORS errors | Check API Gateway CORS settings |
| Lambda timeout | Increase timeout in script |
| Build fails | Delete node_modules and reinstall |

---

## ✅ Success Checklist

- [ ] Script ran without errors
- [ ] Website opens in browser
- [ ] Contact form visible
- [ ] Form submits successfully
- [ ] Item appears in DynamoDB
- [ ] File uploads to S3 (if tested)
- [ ] No errors in CloudWatch logs

---

**That's it! Your site is live on AWS! 🎉**

For production use, set up CloudFront for HTTPS and add a custom domain.

Questions? Check the detailed guides or AWS documentation.

Happy deploying! 🚀
