# Quick Fix: DynamoDB Issues

## 🚨 Common Problems

### Problem 1: "AccessDeniedException: dynamodb:Scan"
**Solution:** See **HOW_TO_FIX_NOW.md** or **FIX_SCAN_PERMISSION.md**

### Problem 2: Files Upload to S3 but DynamoDB Has 0 Items
**Solution:** Follow the 5 steps below

---

## ⚡ Quick Solution (5 Steps)

### Step 1: Redeploy Edge Function
```bash
cd /path/to/your/project
supabase functions deploy server
```
**Wait 30-60 seconds for deployment to complete.**

---

### Step 2: Update IAM Permissions

1. Go to: https://console.aws.amazon.com/iam/home#/users/sweetchilli996
2. Click **Permissions** tab
3. Find your policy (e.g., `ContactFormAppPolicy`)
4. Click **Edit policy** → **JSON** tab
5. Replace with this:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:DescribeTable",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:298552056601:table/user"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

6. Replace `YOUR_BUCKET_NAME` with your actual S3 bucket name
7. Click **Review policy** → **Save changes**
8. **Wait 30 seconds**

---

### Step 3: Test the Connection

On your website:
1. Find **"DynamoDB Scanner"** panel (bottom-left corner)
2. Click **"Scan Table"**
3. Check if items appear

---

### Step 4: Submit Test Form

1. Fill out the contact form
2. Click Submit
3. Immediately check terminal:

```bash
supabase functions logs server --follow
```

**Look for:**
```
✅ Contact submission stored in DynamoDB with ID: xxx-xxx-xxx
```

---

### Step 5: Verify in AWS Console

1. Go to: https://console.aws.amazon.com/dynamodb/
2. Click **Tables** → **user**
3. Click **Explore table items**
4. You should see your submission!

---

## 🔍 If Still Not Working

### Check Edge Function Logs:
```bash
# View recent logs
supabase functions logs server

# Stream live logs
supabase functions logs server --follow
```

### Common Errors:

**Error: "AccessDeniedException"**
- Solution: IAM user needs `dynamodb:PutItem` permission (Step 2)

**Error: "ResourceNotFoundException"**
- Solution: Check table name is exactly "user" (case-sensitive)
- Verify region matches: `AWS_REGION=us-east-1`

**Error: "ValidationException"**
- Solution: Table partition key must be "userId" not "id"

---

## 📍 Diagnostic Tools Added

Your app now has TWO diagnostic panels:

**Bottom-Left: DynamoDB Scanner**
- Click "Scan Table" to see all items
- Shows actual item count
- Displays full item data

**Bottom-Right: AWS Configuration**
- Click "Test DB" to verify connection
- Click "Check Config" to see credentials

---

## ✅ Success Checklist

You'll know it's working when ALL of these are true:

- [ ] `supabase functions deploy server` completed successfully
- [ ] IAM policy includes `dynamodb:PutItem`
- [ ] "Test DB" button shows: ✅ Connection Successful
- [ ] Form submission shows: "Message sent successfully!"
- [ ] "Scan Table" shows: Items Found: 1 (or more)
- [ ] AWS Console shows items in the table
- [ ] Edge Function logs show: "✅ Contact submission stored..."

---

## 📝 Full Debugging Guide

For detailed troubleshooting, see: **DYNAMODB_WRITE_DEBUG.md**

---

## 💡 Most Likely Cause

Based on your symptoms (S3 works, DynamoDB doesn't):

**99% chance:** Your IAM user has S3 permissions but is **missing** `dynamodb:PutItem` permission.

**The fix:** Update the IAM policy (Step 2 above) and wait 30 seconds.

---

## 🆘 Need More Help?

1. Run: `supabase functions logs server`
2. Submit a form
3. Copy the error message
4. Check which line shows the error
5. See DYNAMODB_WRITE_DEBUG.md for specific error solutions

Good luck! 🚀
