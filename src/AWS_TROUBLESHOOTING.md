# AWS Integration Troubleshooting Guide

## Signature Error Diagnosis

If you're experiencing AWS signature errors, follow these steps:

### Step 1: Verify Your Credentials in AWS Console

1. **Log into AWS Console** at https://console.aws.amazon.com
2. **Navigate to IAM** → Users → Your User
3. **Check Access Keys**:
   - Find your Access Key ID (starts with `AKIA...`)
   - If you've lost the Secret Access Key, you'll need to create a new access key pair

### Step 2: Verify Credentials in Supabase

Your environment variables should be set in Supabase. Double-check these values:

- `AWS_ACCESS_KEY_ID` - Should be exactly 20 characters (e.g., `AKIAIOSFODNN7EXAMPLE`)
- `AWS_SECRET_ACCESS_KEY` - Should be exactly 40 characters
- `AWS_REGION` - Must match where your DynamoDB table is (e.g., `us-east-1`, `us-west-2`)
- `AWS_DYNAMODB_TABLE_NAME` - Exact name of your table
- `AWS_S3_BUCKET_NAME` - Exact name of your S3 bucket

**Common Issues:**
- Extra spaces before or after the values
- Copy-pasting issues that include invisible characters
- Using credentials from a different AWS account

### Step 3: Verify IAM Permissions

Your IAM user must have these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:DescribeTable"
      ],
      "Resource": "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/YOUR_TABLE_NAME"
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

### Step 4: Verify DynamoDB Table Configuration

1. Go to **DynamoDB Console** → Tables
2. Find your table and verify:
   - **Table name** matches `AWS_DYNAMODB_TABLE_NAME`
   - **Region** matches `AWS_REGION`
   - **Primary Key** is `id` (String type)

### Step 5: Use the Built-in Diagnostic Tools

Your website has a diagnostic panel in the bottom-right corner:

1. **Click "Check Config"** - Verifies all environment variables are set
2. **Click "Test DB"** - Actually connects to DynamoDB to test credentials

### Step 6: Common Error Messages

**"UnrecognizedClientException"**
- Wrong Access Key ID or Secret Access Key
- Credentials are for a different AWS account
- Re-enter your credentials carefully

**"ResourceNotFoundException"**
- Table doesn't exist in the specified region
- Table name is misspelled
- Check both table name and region

**"AccessDeniedException"**
- IAM user lacks necessary permissions
- Add `dynamodb:PutItem` and `dynamodb:DescribeTable` permissions

**"SignatureDoesNotMatch"**
- Secret Access Key is incorrect
- Secret key has extra spaces or characters
- Generate a new access key pair if needed

### Step 7: Generate New Credentials (if needed)

If you've verified everything and it still doesn't work:

1. Go to **IAM Console** → Users → Your User → Security credentials
2. **Create access key** (choose "Application running outside AWS")
3. **Copy the Access Key ID and Secret Access Key immediately**
4. **Delete the old access key** after confirming the new one works
5. **Update Supabase environment variables** with the new credentials

### Testing the Fix

After updating credentials:

1. Use the "Test DB" button in the diagnostic panel
2. Try submitting the contact form
3. Check the browser console for detailed error logs
4. Check Supabase Edge Function logs for server-side errors

## Quick Checklist

- [ ] Access Key ID is exactly 20 characters
- [ ] Secret Access Key is exactly 40 characters
- [ ] No extra spaces in any credentials
- [ ] Region matches where DynamoDB table is located
- [ ] Table name is spelled correctly
- [ ] IAM user has `dynamodb:PutItem` permission
- [ ] IAM user has `dynamodb:DescribeTable` permission
- [ ] Table primary key is named `id`
- [ ] S3 bucket exists and IAM user has `s3:PutObject` permission

## Still Having Issues?

1. Check the browser console for detailed error messages
2. Check Supabase Edge Function logs in the Supabase dashboard
3. Use AWS CloudTrail to see if API calls are reaching AWS
4. Verify your AWS account is in good standing
