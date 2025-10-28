# Fix: DynamoDB Has 0 Items (Files Upload to S3 Successfully)

## 🎯 The Issue

- ✅ Files are uploading to S3
- ❌ DynamoDB table has 0 items
- Form says "success" but items don't appear in AWS Console

## 🔍 Diagnosis Steps

### Step 1: Redeploy the Edge Function

The server code has been updated with better diagnostics. Deploy it:

```bash
cd /path/to/your/project
supabase functions deploy server
```

Wait 30-60 seconds for deployment to complete.

### Step 2: Use the Test Write Button

1. **Open your website** (http://localhost:5173/)
2. Look for **"AWS Configuration"** panel (bottom-right corner)
3. Click the **"Test Write"** button (orange button)
4. **Check the result:**

**If you see "Write Test: SUCCESS!"**
- ✅ DynamoDB writes ARE working
- The problem is elsewhere (see Step 4)

**If you see "AccessDeniedException"**
- ❌ Your IAM user is missing `dynamodb:PutItem` permission
- Go to Step 3 to fix

**If you see "ResourceNotFoundException"**
- ❌ Table name or region is wrong
- Check environment variables in Supabase

### Step 3: Fix Missing Permission

If the test shows "AccessDeniedException", your IAM user needs the `dynamodb:PutItem` permission.

#### Quick Fix:

1. **Go to AWS IAM Console:**
   ```
   https://console.aws.amazon.com/iam/home#/users/sweetchilli996?section=permissions
   ```

2. **Edit your policy** (e.g., `ContactFormAppPolicy`)

3. **Make sure it includes all these permissions:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "dynamodb:PutItem",      ← MUST HAVE THIS
           "dynamodb:GetItem",
           "dynamodb:DescribeTable"
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

4. **Save the policy**
5. **Wait 30 seconds**
6. **Click "Test Write" again** - it should now succeed!

### Step 4: Check Edge Function Logs

If "Test Write" succeeds but form submissions still don't create items:

```bash
# Stream live logs
supabase functions logs server --follow
```

Then submit the contact form and watch the logs for:

**Success indicators:**
```
About to send PutItemCommand to DynamoDB...
DynamoDB PutItem result: { ... }
✅ Contact submission stored in DynamoDB with ID: xxx-xxx-xxx
```

**Error indicators:**
```
DynamoDB error details: ...
Error name: AccessDeniedException
```

### Step 5: Verify in AWS Console

1. Go to [DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
2. Click **Tables** → **user**
3. Click **Explore table items**
4. Look for items

**Check these:**
- Is the table name exactly `user`?
- Is the region `us-east-1`?
- Does the table have a partition key named `userId`?

---

## 🚀 Most Likely Solutions

### Solution 1: Missing dynamodb:PutItem Permission

**Symptom:** "Test Write" button shows AccessDeniedException

**Fix:**
1. Go to IAM Console
2. Edit policy attached to user `sweetchilli996`
3. Add `"dynamodb:PutItem"` to the Actions array
4. Save and wait 30 seconds

### Solution 2: Wrong Table Name or Region

**Symptom:** "Test Write" shows "ResourceNotFoundException"

**Fix:**
1. Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
2. Check these values:
   - `AWS_DYNAMODB_TABLE_NAME` = exactly `user` (case-sensitive)
   - `AWS_REGION` = `us-east-1` (or wherever your table is)
3. Correct if needed
4. Redeploy: `supabase functions deploy server`

### Solution 3: Form Returns Success But No Item Created

**Symptom:** "Test Write" succeeds, but form submissions don't create items

**Possible causes:**
1. **Error is being swallowed** - Check browser console for errors
2. **Write succeeds but you're looking at wrong region** - Check AWS Console region selector
3. **Table primary key is wrong** - Must be `userId` not `id`

**Debug:**
```bash
# Check logs while submitting form
supabase functions logs server --follow

# Then submit form and look for errors
```

---

## ✅ Success Checklist

Use this to verify everything is configured correctly:

- [ ] Redeployed Edge Function: `supabase functions deploy server`
- [ ] "Test Write" button shows SUCCESS
- [ ] IAM policy includes `dynamodb:PutItem`
- [ ] `AWS_DYNAMODB_TABLE_NAME` = `user`
- [ ] `AWS_REGION` matches table location
- [ ] Table partition key is `userId`
- [ ] Submitted contact form
- [ ] Checked Edge Function logs - saw "✅ Contact submission stored..."
- [ ] Checked AWS Console - item appears in table

---

## 🔧 Quick Commands

```bash
# Redeploy Edge Function
supabase functions deploy server

# Watch logs in real-time
supabase functions logs server --follow

# Check recent logs
supabase functions logs server

# Check if table exists (using AWS CLI)
aws dynamodb describe-table --table-name user --region us-east-1
```

---

## 📊 Diagnostic Tool Reference

Your website now has these tools (bottom-right corner):

| Button | What It Tests | When to Use |
|--------|---------------|-------------|
| **Check Config** | Shows what env vars are set | Verify configuration |
| **Test Read** | Tests `dynamodb:DescribeTable` | Check if can read table info |
| **Test Write** | Tests `dynamodb:PutItem` | **Check if can write items** ⭐ |

The **Test Write** button is the most important - it tells you immediately if writes are working.

---

## 🆘 Still Not Working?

1. **Click "Test Write"** and copy the exact error message
2. **Check Edge Function logs:**
   ```bash
   supabase functions logs server
   ```
3. **Check these common issues:**
   - Table doesn't exist in the specified region
   - Table partition key is `id` instead of `userId`
   - Credentials have extra spaces/newlines
   - Wrong region in environment variables

4. **Test with AWS CLI:**
   ```bash
   # Try writing directly to DynamoDB
   aws dynamodb put-item \
     --table-name user \
     --item '{"userId":{"S":"test-123"},"name":{"S":"Test"}}' \
     --region us-east-1
   ```

   If this fails, the problem is with AWS credentials/permissions, not the app.

---

## 📝 After the Fix

Once it's working:

1. **Test Write** shows SUCCESS ✅
2. **Submit contact form** → Check logs for "✅ Contact submission stored..."
3. **AWS Console** → DynamoDB → user → Items appear!

You should see items in both the Edge Function logs AND the AWS Console.

---

## 💡 Prevention

To avoid this issue in the future:

1. Always include `dynamodb:PutItem` in IAM policies from the start
2. Use the "Test Write" button before deploying to production
3. Monitor Edge Function logs for errors
4. Set up CloudWatch alarms for DynamoDB write failures

Good luck! 🚀
