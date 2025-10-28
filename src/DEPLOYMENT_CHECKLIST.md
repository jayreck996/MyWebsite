# 📋 AWS Deployment Checklist

Use this checklist to ensure everything is configured correctly before and after deployment.

---

## Pre-Deployment Checklist

### Local Development
- [ ] App runs locally without errors (`npm run dev`)
- [ ] Build succeeds (`npm run build`)
- [ ] All environment variables are documented
- [ ] Contact form works in local environment
- [ ] File uploads work locally
- [ ] DynamoDB writes work locally

### Code Repository
- [ ] Code is committed to git
- [ ] `.gitignore` excludes `node_modules/` and `.env`
- [ ] Code is pushed to GitHub/GitLab/Bitbucket
- [ ] `amplify.yml` file exists in project root
- [ ] `README.md` is updated

### AWS Account Setup
- [ ] AWS account created
- [ ] Billing alerts set up (recommended)
- [ ] IAM user created with appropriate permissions
- [ ] Access keys generated (if needed)

### Supabase Setup (if using Option 1)
- [ ] Supabase project created
- [ ] Edge Functions deployed (`supabase functions deploy server`)
- [ ] All environment variables set in Supabase Dashboard
- [ ] Edge Function health check passes

### AWS Services Setup
- [ ] S3 bucket created for file uploads
- [ ] S3 bucket permissions configured
- [ ] DynamoDB table created (name: `user`)
- [ ] DynamoDB partition key is `userId` (String)
- [ ] IAM permissions for DynamoDB include `PutItem`, `GetItem`, `DescribeTable`
- [ ] IAM permissions for S3 include `PutObject`, `GetObject`

---

## Deployment Checklist (AWS Amplify)

### Initial Deployment
- [ ] Amplify app created in AWS Console
- [ ] Git repository connected to Amplify
- [ ] Branch selected for deployment (e.g., `main`)
- [ ] Build settings configured (uses `amplify.yml`)
- [ ] First deployment initiated

### Configuration
- [ ] Environment variables set in Amplify Console:
  - [ ] `VITE_SUPABASE_PROJECT_ID`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Build completed successfully
- [ ] App is accessible via Amplify URL

### Testing
- [ ] Website loads correctly
- [ ] All pages render properly
- [ ] No console errors in browser
- [ ] Mobile responsive design works
- [ ] Contact form is visible

---

## Post-Deployment Testing

### Frontend Testing
- [ ] Homepage loads
- [ ] Hero section displays correctly
- [ ] About section displays correctly
- [ ] Contact form displays correctly
- [ ] All buttons work
- [ ] All links work
- [ ] Images load correctly
- [ ] Styling looks correct
- [ ] Responsive design works on mobile
- [ ] No JavaScript errors in console

### Contact Form Testing
- [ ] Form fields accept input
- [ ] Form validation works (required fields)
- [ ] File upload button works
- [ ] Can select a file to upload
- [ ] Submit button becomes disabled during submission
- [ ] Success message appears after submission
- [ ] Form clears after successful submission

### Backend Testing
- [ ] Contact form submission succeeds
- [ ] File uploads to S3 successfully
- [ ] DynamoDB receives the submission data
- [ ] Edge Function logs show successful processing
- [ ] No errors in browser console
- [ ] No errors in Edge Function logs

### AWS Services Verification
- [ ] S3 bucket contains uploaded files
  - Check: AWS Console → S3 → Your bucket → `contact-attachments/` folder
- [ ] DynamoDB table contains submission records
  - Check: AWS Console → DynamoDB → user table → Items tab
- [ ] CloudWatch logs show Lambda/Edge Function activity (if applicable)

### Diagnostic Tools Testing
- [ ] Click "Check Config" button - shows all configs as ✅
- [ ] Click "Test Read" button - succeeds
- [ ] Click "Test Write" button - succeeds
- [ ] Settings panel works
- [ ] IAM Policy Helper displays correct policy

---

## Custom Domain Setup (Optional)

- [ ] Domain purchased (Route 53, Namecheap, GoDaddy, etc.)
- [ ] Domain added in Amplify Console
- [ ] DNS records configured
- [ ] SSL certificate issued (automatic via AWS)
- [ ] SSL certificate status: Issued
- [ ] Domain resolves to Amplify app
- [ ] HTTPS works on custom domain
- [ ] HTTP redirects to HTTPS

---

## Security Checklist

- [ ] HTTPS enabled (automatic with Amplify)
- [ ] AWS credentials not hardcoded in frontend
- [ ] Environment variables used for sensitive data
- [ ] CORS configured correctly
- [ ] S3 bucket not publicly writable
- [ ] DynamoDB table access restricted to IAM users/roles
- [ ] API endpoints protected (if using API Gateway)
- [ ] Input validation on both frontend and backend
- [ ] File upload size limits enforced
- [ ] File upload type restrictions enforced

---

## Performance Checklist

- [ ] Images optimized
- [ ] Build output size is reasonable (check `dist/` folder)
- [ ] No unnecessary dependencies
- [ ] CDN enabled (CloudFront via Amplify)
- [ ] Caching configured
- [ ] Lazy loading implemented (if needed)

---

## Monitoring & Alerts

- [ ] CloudWatch logs accessible
- [ ] Amplify build notifications enabled
- [ ] Error tracking set up (optional: Sentry, LogRocket)
- [ ] Uptime monitoring set up (optional: UptimeRobot, Pingdom)
- [ ] AWS billing alerts configured
- [ ] Email notifications for form submissions (optional)

---

## Documentation

- [ ] `README.md` includes deployment instructions
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] AWS resources documented
- [ ] Architecture diagram created (optional)
- [ ] Troubleshooting guide available

---

## Backup & Recovery

- [ ] Database backup strategy defined
- [ ] S3 versioning enabled (optional)
- [ ] DynamoDB point-in-time recovery enabled (optional)
- [ ] Code backed up in git
- [ ] Infrastructure as Code documented (optional)

---

## Final Verification

### Quick Test Script
```bash
# 1. Visit your site
open https://your-amplify-url.amplifyapp.com

# 2. Fill out contact form
# - Name: Test User
# - Email: test@example.com
# - Message: Testing deployment
# - Attach a small file (e.g., test.jpg)

# 3. Submit form

# 4. Check logs
supabase functions logs server

# 5. Verify in AWS Console
# - DynamoDB → user table → Check for new item
# - S3 → your-bucket → contact-attachments/ → Check for file
```

### Success Criteria
- [ ] ✅ Form submits without errors
- [ ] ✅ Success message appears
- [ ] ✅ File appears in S3 bucket
- [ ] ✅ Item appears in DynamoDB table
- [ ] ✅ Edge Function logs show success
- [ ] ✅ No errors in browser console
- [ ] ✅ Site loads in under 3 seconds
- [ ] ✅ Mobile view works correctly

---

## Troubleshooting Reference

If something doesn't work:

| Issue | Check | Fix Guide |
|-------|-------|-----------|
| Build fails | Amplify build logs | Check `amplify.yml` and dependencies |
| Site doesn't load | CloudFront/Amplify status | Check deployment status |
| Form doesn't submit | Browser console | Check API endpoint URL |
| DynamoDB empty | Edge Function logs | `FIX_DYNAMODB_ZERO_ITEMS.md` |
| S3 upload fails | IAM permissions | Check S3 bucket policy |
| CORS errors | Backend CORS config | Update CORS headers |

---

## Ongoing Maintenance

### Weekly
- [ ] Check error logs
- [ ] Monitor AWS costs
- [ ] Test contact form

### Monthly
- [ ] Review DynamoDB items
- [ ] Clean up old S3 files (if needed)
- [ ] Update dependencies (`npm update`)
- [ ] Check for security updates

### Quarterly
- [ ] Review IAM permissions
- [ ] Audit AWS costs
- [ ] Performance optimization
- [ ] Security review

---

## Rollback Plan

If deployment breaks something:

### Option 1: Revert in Amplify
1. Go to Amplify Console
2. Click on the app
3. Click "Deployments"
4. Find last working deployment
5. Click "Redeploy this version"

### Option 2: Git Revert
```bash
git revert HEAD
git push
# Amplify will auto-deploy previous version
```

### Option 3: Emergency Fix
```bash
# Fix the issue locally
git add .
git commit -m "Hotfix: [description]"
git push
# Amplify will auto-deploy
```

---

## ✅ Deployment Complete!

Once all items are checked:

- [ ] **Deployment Status:** LIVE ✅
- [ ] **URL:** _____________________________
- [ ] **Deployed Date:** _____________________________
- [ ] **Deployed By:** _____________________________
- [ ] **Notes:** _____________________________

---

**Congratulations! Your site is live on AWS! 🎉**

For help: See `AWS_DEPLOYMENT_GUIDE.md` or `DEPLOY_NOW.md`
