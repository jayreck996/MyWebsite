# 🚀 START HERE - Deploy to AWS (Option 2)

You chose **Option 2: Full AWS Deployment** (S3 + CloudFront + API Gateway + Lambda)

---

## ⚡ Quick Deploy (3 Steps)

### Step 1: Make Scripts Executable

```bash
chmod +x setup-permissions.sh
./setup-permissions.sh
```

### Step 2: Run Deployment

```bash
./deploy-option-2.sh
```

### Step 3: Follow the Prompts

The script will ask for:
- S3 bucket name for uploads
- S3 bucket name for frontend

Then it deploys everything automatically!

---

## 📚 Documentation Guide

Read these in order:

### 1️⃣ First Time Deploying?
**Read:** `OPTION_2_QUICK_START.md`  
**Time:** 5 minutes  
**What:** Quick overview and 15-minute deployment guide

### 2️⃣ Want More Details?
**Read:** `OPTION_2_DEPLOYMENT.md`  
**Time:** 15 minutes  
**What:** Complete step-by-step guide with explanations

### 3️⃣ Need to Test Everything?
**Read:** `DEPLOYMENT_CHECKLIST.md`  
**Time:** 10 minutes  
**What:** Comprehensive testing checklist

### 4️⃣ Something Not Working?
**Read:** `AWS_TROUBLESHOOTING.md`  
**Time:** As needed  
**What:** Common issues and solutions

### 5️⃣ Want Script Details?
**Read:** `scripts/README.md`  
**Time:** 10 minutes  
**What:** Documentation for all deployment scripts

---

## 🎯 What Gets Deployed

When you run `./deploy-option-2.sh`:

```
✅ Lambda Functions
   • contact-form-handler (processes forms)
   • contact-form-test (diagnostics)

✅ API Gateway
   • REST API with CORS
   • POST /contact endpoint
   • GET /test/* endpoints

✅ S3 Buckets
   • Frontend hosting (your website)
   • File uploads (attachments)

✅ Configuration
   • IAM roles and policies
   • Environment variables
   • Public access settings
```

---

## 📋 Prerequisites

Before running the deployment:

- [ ] AWS Account created
- [ ] AWS CLI installed (`aws --version`)
- [ ] AWS credentials configured (`aws configure`)
- [ ] Node.js installed (`node --version`)
- [ ] S3 bucket name chosen (e.g., `my-uploads`)
- [ ] DynamoDB table `user` exists (script creates if needed)

**Don't have these?** See `OPTION_2_QUICK_START.md` for setup instructions.

---

## ⏱️ Timeline

| Phase | Time | What Happens |
|-------|------|--------------|
| Pre-checks | 1 min | Verify prerequisites |
| Lambda | 3 min | Deploy functions |
| API Gateway | 2 min | Create REST API |
| Frontend | 5 min | Build & upload to S3 |
| Testing | 2 min | Verify deployment |
| **Total** | **~15 min** | **Ready to use!** |

---

## 💰 Cost Estimate

| Service | Monthly Cost |
|---------|--------------|
| Lambda | Free tier (then ~$0.20) |
| API Gateway | Free tier (then ~$1) |
| S3 (Frontend) | ~$0.50 |
| S3 (Uploads) | ~$0.10 |
| DynamoDB | ~$0.50 |
| CloudFront* | ~$0.85 |
| **Total** | **$2-5/month** |

*CloudFront is optional but recommended for HTTPS

After 12-month free tier: ~$5-10/month

---

## 🌐 Your URLs

After deployment, you'll get:

**S3 Website (HTTP):**
```
http://your-site-frontend.s3-website-us-east-1.amazonaws.com
```

**API Endpoint:**
```
https://abc123.execute-api.us-east-1.amazonaws.com/prod
```

**CloudFront (HTTPS - after setup):**
```
https://d1234567890.cloudfront.net
```

---

## ✅ Post-Deployment

After running `deploy-option-2.sh`:

### Immediate Testing (5 min)

1. **Open your S3 website URL**
2. **Submit contact form** with test data
3. **Verify in AWS Console:**
   - DynamoDB → user table → Check for item
   - S3 → uploads bucket → Check for file

### Add HTTPS (10 min)

Set up CloudFront:
- See Step 5 in `OPTION_2_DEPLOYMENT.md`
- Provides HTTPS, CDN, better performance

### Monitor (Ongoing)

```bash
# Watch logs
aws logs tail /aws/lambda/contact-form-handler --follow

# Check costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

---

## 🔄 Making Updates

### Update Frontend

```bash
# After changing React components
export FRONTEND_BUCKET_NAME=your-site-frontend
export API_GATEWAY_ENDPOINT=https://YOUR_API.execute-api.us-east-1.amazonaws.com/prod
./scripts/deploy-frontend.sh
```

### Update Lambda

```bash
# After changing lambda/*.js files
export S3_BUCKET_NAME=your-uploads
./scripts/deploy-lambda.sh
```

### Full Redeploy

```bash
# Nuclear option - redeploy everything
./deploy-option-2.sh
```

---

## 🐛 Troubleshooting

### Script Won't Run?

```bash
# Make executable
chmod +x deploy-option-2.sh
./deploy-option-2.sh
```

### AWS CLI Not Configured?

```bash
aws configure
# Enter your:
# - Access Key ID
# - Secret Access Key
# - Region (us-east-1)
# - Output format (json)
```

### Build Fails?

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Form Doesn't Work?

```bash
# Check API
curl https://YOUR_API.execute-api.us-east-1.amazonaws.com/prod/test/health

# Check logs
aws logs tail /aws/lambda/contact-form-handler --follow
```

**More help:** `AWS_TROUBLESHOOTING.md`

---

## 📞 Need Help?

### Quick Reference

| Issue | Solution File |
|-------|--------------|
| First deployment | `OPTION_2_QUICK_START.md` |
| Detailed steps | `OPTION_2_DEPLOYMENT.md` |
| Testing | `DEPLOYMENT_CHECKLIST.md` |
| Errors | `AWS_TROUBLESHOOTING.md` |
| Scripts | `scripts/README.md` |
| DynamoDB issues | `FIX_DYNAMODB_ZERO_ITEMS.md` |

### Check Logs

```bash
# Lambda logs (most useful)
aws logs tail /aws/lambda/contact-form-handler --follow

# Recent errors
aws logs filter-pattern /aws/lambda/contact-form-handler --filter-pattern "ERROR"
```

### Test Components

```bash
# Test API health
curl https://YOUR_API.execute-api.us-east-1.amazonaws.com/prod/test/health

# Test DynamoDB write
curl -X POST https://YOUR_API.execute-api.us-east-1.amazonaws.com/prod/test/test-write

# Test Lambda directly
aws lambda invoke \
  --function-name contact-form-test \
  --payload '{"path": "/health"}' \
  response.json
```

---

## 🎯 Next Actions

### Right Now:
```bash
# 1. Set permissions
./setup-permissions.sh

# 2. Deploy!
./deploy-option-2.sh
```

### After Deployment:
- [ ] Test contact form
- [ ] Check DynamoDB
- [ ] Verify S3 uploads
- [ ] Review CloudWatch logs

### This Week:
- [ ] Set up CloudFront (HTTPS)
- [ ] Add custom domain
- [ ] Configure monitoring
- [ ] Set up billing alerts

---

## 🎉 You're Ready!

Everything is set up for you:

✅ Lambda function code written  
✅ Deployment scripts ready  
✅ Documentation complete  
✅ Troubleshooting guides available  

**Just run:**
```bash
./deploy-option-2.sh
```

Your site will be live in ~15 minutes! 🚀

---

## 📖 Quick Links

- **Quick Start:** `OPTION_2_QUICK_START.md`
- **Full Guide:** `OPTION_2_DEPLOYMENT.md`
- **Summary:** `DEPLOYMENT_SUMMARY.md`
- **Checklist:** `DEPLOYMENT_CHECKLIST.md`
- **Troubleshooting:** `AWS_TROUBLESHOOTING.md`
- **Scripts:** `scripts/README.md`

---

**Let's deploy! Run: `./deploy-option-2.sh`**

Good luck! 🍀
