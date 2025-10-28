# 🚀 Deploy Your Site RIGHT NOW (15 Minutes)

## Fastest Way: AWS Amplify

### Prerequisites (2 minutes)
- [ ] AWS Account → [Sign up](https://aws.amazon.com/)
- [ ] GitHub Account → [Sign up](https://github.com/)
- [ ] Code pushed to GitHub

---

## Step 1: Push to GitHub (3 minutes)

```bash
# If you haven't already:
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub: https://github.com/new
# Then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## Step 2: Create amplify.yml (1 minute)

Create this file in your project root:

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

Commit and push:
```bash
git add amplify.yml
git commit -m "Add Amplify config"
git push
```

---

## Step 3: Deploy to Amplify (5 minutes)

1. **Open AWS Amplify Console:**
   ```
   https://console.aws.amazon.com/amplify/
   ```

2. **Click:** `New app` → `Host web app`

3. **Select:** GitHub → Click `Authorize AWS Amplify`

4. **Select your repository and branch:** `main`

5. **Build settings:** Auto-detected ✅ Click `Next`

6. **Review:** Click `Save and deploy`

7. **Wait 3-5 minutes** ⏱️

8. **Done!** Your site is live at:
   ```
   https://main.d1234567890.amplifyapp.com
   ```

---

## Step 4: Deploy Backend (3 minutes)

Your backend is still on Supabase. Make sure it's deployed:

```bash
# Deploy Edge Function
supabase functions deploy server

# Verify it's working
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-3699ee41/health
```

---

## Step 5: Test Everything (3 minutes)

1. **Open your Amplify URL**
2. **Submit the contact form**
3. **Check Edge Function logs:**
   ```bash
   supabase functions logs server
   ```
4. **Verify in DynamoDB:**
   - Go to AWS Console → DynamoDB → user table
   - Check for new items

---

## ✅ You're Done!

Your site is now live on AWS! 🎉

**Your URLs:**
- **Website:** `https://main.XXXXXXXXX.amplifyapp.com`
- **Backend:** `https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-3699ee41`

---

## 🌐 Add Custom Domain (Optional)

In Amplify Console:
1. Click **Domain management**
2. Click **Add domain**
3. Enter your domain (e.g., `yourname.com`)
4. Follow DNS setup instructions
5. Wait for SSL certificate (15-30 min)

---

## 🔄 Auto-Deploy on Every Git Push

Amplify automatically deploys when you push to GitHub!

```bash
# Make changes to your code
git add .
git commit -m "Update hero section"
git push

# Amplify automatically rebuilds and deploys! 🚀
```

---

## 🐛 Troubleshooting

### Build fails?
- Check build logs in Amplify Console
- Make sure `npm run build` works locally
- Verify `amplify.yml` is correct

### Form doesn't work?
- Check browser console for errors
- Verify Supabase Edge Function is deployed
- Check Edge Function logs: `supabase functions logs server`

### DynamoDB not updating?
- Run `supabase functions deploy server` again
- Check IAM permissions (see `FIX_DYNAMODB_ZERO_ITEMS.md`)
- Click "Test Write" button on your site

---

## 📊 Costs

**Amplify Free Tier (12 months):**
- 1000 build minutes/month
- 15 GB served/month
- 5 GB storage

**After free tier:**
- ~$0-5/month for small sites

**Supabase:**
- Free tier includes Edge Functions
- Unlimited for low traffic

**S3 + DynamoDB:**
- ~$1-5/month for low traffic

**Total: ~$0-10/month** 💰

---

## 🎯 What You Have Now

✅ Professional website hosted on AWS  
✅ Custom domain (optional)  
✅ HTTPS enabled automatically  
✅ Auto-deploy on git push  
✅ Contact form with file uploads  
✅ Data stored in DynamoDB  
✅ Files stored in S3  
✅ Scalable infrastructure  

---

## 📚 Next Steps

- [ ] Add custom domain
- [ ] Set up Google Analytics
- [ ] Add more pages
- [ ] Improve SEO
- [ ] Add blog section
- [ ] Set up email notifications for form submissions

---

## 🆘 Need Help?

- **Full deployment guide:** `AWS_DEPLOYMENT_GUIDE.md`
- **DynamoDB issues:** `FIX_DYNAMODB_ZERO_ITEMS.md`
- **AWS troubleshooting:** `AWS_TROUBLESHOOTING.md`
- **Amplify docs:** https://docs.amplify.aws/

---

**That's it! You're live on AWS! 🚀**
