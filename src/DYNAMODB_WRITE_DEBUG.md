# DynamoDB Write Debugging Guide

## Issue: Files Upload to S3 but DynamoDB Has 0 Items

If your files are uploading to S3 successfully but your DynamoDB table shows 0 items, follow this debugging guide.

---

## Step 1: Deploy Updated Edge Function

The server code has been updated with enhanced logging. Deploy it:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Deploy the updated Edge Function
supabase functions deploy server

# Wait for deployment to complete (30-60 seconds)
```

---

## Step 2: Check Edge Function Logs

After deploying, submit a test form and immediately check the logs:

```bash
# Stream real-time logs
supabase functions logs server --follow

# Or view recent logs
supabase functions logs server
```

**What to look for:**

✅ **Success - You should see:**
```
About to send PutItemCommand to DynamoDB...
PutItemCommand details: { ... }
DynamoDB PutItem result: { ... }
✅ Contact submission stored in DynamoDB with ID: xxx-xxx-xxx
```

❌ **If you see an error:**
```
DynamoDB error details: ...
Error name: AccessDeniedException
```
→ This means your IAM user doesn't have `dynamodb:PutItem` permission

---

## Step 3: Use the DynamoDB Scanner

1. **Open your website** (http://localhost:5173/)
2. Look for the **"DynamoDB Scanner"** panel in the **bottom-left corner**
3. Click **"Scan Table"**

**Expected Results:**

- **If count = 0**: The writes are failing (continue to Step 4)
- **If count > 0**: The writes are working! Items ARE being written
- **If you see an error**: Check the error message for permission issues

---

## Step 4: Verify IAM Permissions

Your IAM user needs **ALL** of these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",        ← Write items
        "dynamodb:GetItem",        ← Read items
        "dynamodb:DescribeTable",  ← Get table info
        "dynamodb:Scan"            ← List all items
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:YOUR_ACCOUNT_ID:table/user"
    }
  ]
}
```

### How to Update IAM Permissions:

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → Select your user (e.g., `sweetchilli996`)
3. Click the **Permissions** tab
4. Find your policy (e.g., `ContactFormAppPolicy`)
5. Click **Edit policy**
6. Update the JSON to include **all 4 actions** above
7. Click **Review policy** → **Save changes**
8. **Wait 30 seconds** for permissions to propagate

---

## Step 5: Common Issues & Solutions

### Issue 1: "AccessDeniedException" in logs

**Cause:** IAM user doesn't have `dynamodb:PutItem` permission

**Solution:**
```bash
# Go to AWS IAM Console → Users → Your User → Permissions
# Make sure the policy includes "dynamodb:PutItem"
```

### Issue 2: "ResourceNotFoundException"

**Cause:** Table name or region is incorrect

**Solution:**
```bash
# Check environment variables in Supabase
# Go to: Project Settings → Edge Functions → Secrets
# Verify:
# - AWS_DYNAMODB_TABLE_NAME = "user" (exactly, case-sensitive)
# - AWS_REGION = "us-east-1" (or wherever your table is)
```

### Issue 3: "ValidationException: One or more parameter values were invalid"

**Cause:** Table schema doesn't match the data being written

**Solution:**
```bash
# Check your table's partition key in AWS Console
# It MUST be named "userId" (not "id" or "ID")
# If wrong, you need to recreate the table with the correct key
```

### Issue 4: Files upload but no logs appear

**Cause:** Edge Function wasn't redeployed

**Solution:**
```bash
supabase functions deploy server
```

---

## Step 6: Manual Verification in AWS Console

1. Go to [DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
2. Click **Tables** → Select **user**
3. Click **Explore table items**
4. You should see your submissions here

**If you see items here but the scanner shows 0:**
- Your IAM user might lack `dynamodb:Scan` permission
- Add it to your policy (see Step 4)

**If you see 0 items:**
- The writes are definitely failing
- Check the Edge Function logs (Step 2)

---

## Step 7: Test DynamoDB Connection

On your website:

1. Find the **"AWS Configuration"** panel (bottom-right)
2. Click **"Test DB"**
3. Check the result:

✅ **Success:** Shows table info with itemCount  
❌ **Error:** Shows the specific permission or configuration issue

---

## Step 8: Submit Test Form with Logging

1. **Open browser console** (Press F12)
2. **Fill out contact form**:
   - Name: Debug Test
   - Email: debug@test.com
   - Message: Testing DynamoDB write
   - (Optional) Attach a small file
3. **Click Submit**
4. **Check these 3 places immediately:**

   **A. Browser Console:**
   - Should show: "Contact form submission..." logs
   
   **B. Terminal (Edge Function logs):**
   ```bash
   supabase functions logs server --follow
   ```
   - Should show: "About to send PutItemCommand..."
   
   **C. DynamoDB Scanner:**
   - Click "Scan Table" again
   - Count should increase by 1

---

## Debugging Checklist

Use this checklist to ensure everything is configured correctly:

- [ ] Edge Function redeployed with `supabase functions deploy server`
- [ ] IAM user has all 4 DynamoDB permissions (PutItem, GetItem, DescribeTable, Scan)
- [ ] DynamoDB table named exactly "user" (case-sensitive)
- [ ] Table partition key is "userId" (not "id")
- [ ] AWS_DYNAMODB_TABLE_NAME = "user" in Supabase secrets
- [ ] AWS_REGION matches table location (check in AWS Console)
- [ ] AWS credentials are correct (S3 uploads work = credentials OK)
- [ ] Edge Function logs show "About to send PutItemCommand..."
- [ ] No "AccessDeniedException" in logs
- [ ] DynamoDB Scanner shows actual item count

---

## Still Having Issues?

### Get Detailed Error Info:

1. Submit form
2. Check terminal:
   ```bash
   supabase functions logs server --follow
   ```
3. Look for the complete error message
4. Share these details:
   - Error name (e.g., "AccessDeniedException")
   - Error message
   - What "Test DB" button shows
   - What "Scan Table" button shows

### Quick Test Script:

Run this to verify all configurations:

```bash
# Check if Edge Function is running
curl -X GET "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-3699ee41/health" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Expected: {"status":"ok"}

# Test DynamoDB connection
curl -X GET "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-3699ee41/test-dynamodb" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Expected: {"success":true,...}
```

---

## Most Common Solution

**90% of the time, this fixes it:**

1. Update IAM policy to include `dynamodb:PutItem`
2. Redeploy Edge Function: `supabase functions deploy server`
3. Wait 30 seconds
4. Test form again
5. Check logs: `supabase functions logs server`

The issue is almost always **missing IAM permissions** or **Edge Function not redeployed** with the latest code.

---

## Success Indicators

You'll know it's working when:

✅ Form submission returns: "Message sent successfully!"  
✅ Edge Function logs show: "✅ Contact submission stored in DynamoDB..."  
✅ DynamoDB Scanner shows: "Items Found: 1" (or more)  
✅ AWS Console → DynamoDB → user table shows items  
✅ Browser console has no errors  

Good luck! 🚀
