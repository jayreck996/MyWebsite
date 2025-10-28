# Fix: AccessDeniedException - dynamodb:Scan

## ❌ The Error

```
User: arn:aws:iam::298552056601:user/sweetchilli996 
is not authorized to perform: dynamodb:Scan 
on resource: arn:aws:dynamodb:us-east-1:298552056601:table/user
```

## ✅ The Solution (2 Minutes)

Your IAM user `sweetchilli996` is missing the `dynamodb:Scan` permission.

---

### Step 1: Go to AWS IAM Console

Click this link (opens in new tab):
👉 https://console.aws.amazon.com/iam/home#/users/sweetchilli996?section=permissions

---

### Step 2: Edit Your Policy

1. You should see a policy attached (like `ContactFormAppPolicy`)
2. Click on the policy name
3. Click **"Edit"** or **"Edit policy"**
4. Click the **"JSON"** tab

---

### Step 3: Update the JSON

**Replace the entire JSON** with this:

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

**Important:** Replace `YOUR_BUCKET_NAME` with your actual S3 bucket name.

---

### Step 4: Save the Policy

1. Click **"Next"** or **"Review policy"**
2. Click **"Save changes"**
3. **Wait 30 seconds** for AWS to propagate the changes

---

### Step 5: Test It

Go back to your website and:

1. Find the **"DynamoDB Scanner"** panel (bottom-left)
2. Click **"Scan Table"**
3. It should now work! ✅

---

## What Changed?

We added one line to the `Action` array:

```json
"dynamodb:Scan"  ← This is the new permission
```

This allows your IAM user to scan (read all items) from the DynamoDB table.

---

## Alternative: Copy This Command

If you prefer using AWS CLI:

```bash
# Save the policy to a file
cat > policy.json <<EOF
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
EOF

# Update the policy (replace POLICY_ARN with your actual policy ARN)
aws iam put-user-policy \
  --user-name sweetchilli996 \
  --policy-name ContactFormAppPolicy \
  --policy-document file://policy.json
```

---

## ✅ Success!

After updating the policy, you should be able to:

- ✅ Scan the DynamoDB table
- ✅ See item counts
- ✅ View all submitted forms
- ✅ Use the DynamoDB Scanner component

---

## Still Getting Errors?

If you still see errors after updating the policy:

1. **Wait 60 seconds** - AWS permissions can take time to propagate
2. **Refresh your browser**
3. **Try "Scan Table" again**
4. **Check the policy was saved correctly** - Go back to IAM and verify the JSON

---

## Summary

**What you need:** `dynamodb:Scan` permission  
**Where to add it:** IAM Console → Users → sweetchilli996 → Permissions  
**How long it takes:** 30-60 seconds after saving  

That's it! 🎉
