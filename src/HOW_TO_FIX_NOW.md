# 🚨 QUICK FIX - Do This Now!

## The Problem
Your IAM user is missing the `dynamodb:Scan` permission.

## The Solution (Takes 2 Minutes)

### Step 1: Open This Link
👉 **[Click Here to Open IAM Console](https://console.aws.amazon.com/iam/home#/users/sweetchilli996?section=permissions)**

### Step 2: Find Your Policy
Look for a policy attached to user `sweetchilli996` (probably named `ContactFormAppPolicy` or similar)

### Step 3: Edit the Policy
1. Click on the policy name
2. Click **"Edit"** or **"Edit policy"**
3. Click the **"JSON"** tab

### Step 4: Copy This Entire JSON

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

### Step 5: Paste and Save
1. **Select all text** in the JSON editor
2. **Delete it**
3. **Paste the JSON** from above
4. **Replace** `YOUR_BUCKET_NAME` with your actual S3 bucket name
5. Click **"Review policy"** or **"Next"**
6. Click **"Save changes"**

### Step 6: Wait 30 Seconds
AWS needs a moment to apply the changes.

### Step 7: Test It
Go back to your website and click **"Scan Table"** in the bottom-left corner.

It should now work! ✅

---

## What We Changed

We added one line to the permissions:

**Before:**
```json
"Action": [
  "dynamodb:PutItem",
  "dynamodb:GetItem",
  "dynamodb:DescribeTable"
]
```

**After:**
```json
"Action": [
  "dynamodb:PutItem",
  "dynamodb:GetItem",
  "dynamodb:DescribeTable",
  "dynamodb:Scan"              ← Added this!
]
```

---

## Need Your S3 Bucket Name?

Don't remember your bucket name? No problem:

1. Go to [S3 Console](https://console.aws.amazon.com/s3/)
2. Copy the bucket name you're using for contact form attachments
3. Replace `YOUR_BUCKET_NAME` in the policy with that name

---

## Still Not Working?

1. **Wait another 30 seconds** - AWS can be slow sometimes
2. **Refresh your browser**
3. **Check the policy was saved** - Go back to IAM and verify the JSON
4. **Try "Scan Table" again**

---

## That's It!

After this fix, you'll be able to:
- ✅ Use the DynamoDB Scanner
- ✅ See how many items are in your table
- ✅ Verify form submissions are being saved

Questions? The alert at the top of your website has a button to copy the full policy JSON.

🎉 Good luck!
