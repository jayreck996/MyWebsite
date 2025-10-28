# IAM Permissions Setup Guide

## Issue Identified

Your IAM user `sweetchilli996` is **authenticated correctly**, but lacks the necessary permissions to access your DynamoDB table `user` in region `us-east-1`.

## Required Permissions

Your IAM user needs these permissions:
- `dynamodb:DescribeTable` - To check table information
- `dynamodb:PutItem` - To store contact form submissions
- `s3:PutObject` - To upload file attachments

## How to Fix

### Option 1: AWS Console (Recommended)

1. **Go to AWS IAM Console**: https://console.aws.amazon.com/iam/

2. **Navigate to Users**:
   - Click "Users" in the left sidebar
   - Find and click on user: `sweetchilli996`

3. **Add Permissions**:
   - Click the "Add permissions" button
   - Select "Create inline policy"

4. **Use the JSON Policy Editor**:
   - Click the "JSON" tab
   - Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
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

5. **Important**: Replace `YOUR_BUCKET_NAME` with your actual S3 bucket name

6. **Review and Create**:
   - Click "Review policy"
   - Name it: `ContactFormAppPolicy`
   - Click "Create policy"

### Option 2: Using AWS CLI

If you prefer the command line:

```bash
# Create a policy document file
cat > contact-form-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
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
EOF

# Apply the policy
aws iam put-user-policy \
  --user-name sweetchilli996 \
  --policy-name ContactFormAppPolicy \
  --policy-document file://contact-form-policy.json
```

## Verify the Fix

After adding the permissions:

1. **Wait 30 seconds** for AWS to propagate the changes
2. **Click "Test DB"** in the diagnostic panel on your website
3. You should see "Connection Successful!"

## Your Current Configuration

- **AWS Account**: `298552056601`
- **IAM User**: `sweetchilli996`
- **DynamoDB Table**: `user`
- **Region**: `us-east-1`
- **Table ARN**: `arn:aws:dynamodb:us-east-1:298552056601:table/user`

## Alternative: Managed Policy (Broader Access)

If you want broader DynamoDB access (not recommended for production):

1. In IAM Console → Users → `sweetchilli996`
2. Click "Add permissions" → "Attach policies directly"
3. Search for and select: `AmazonDynamoDBFullAccess`
4. Click "Add permissions"

**Note**: This gives full DynamoDB access to all tables. For security, use the custom policy above instead.

## Troubleshooting

### If you still get errors after adding permissions:

1. **Check the table name**: Make sure it's exactly `user` (case-sensitive)
2. **Check the region**: Must be `us-east-1`
3. **Wait for propagation**: IAM changes can take up to 60 seconds
4. **Verify policy is attached**: Go to IAM → Users → sweetchilli996 → Permissions tab
5. **Check for typos**: Review the JSON policy for any typos

### If you need to create a new table:

If the table `user` doesn't exist or you want a dedicated table:

1. Go to **DynamoDB Console**: https://console.aws.amazon.com/dynamodb/
2. Click "Create table"
3. Table name: `contact-form-submissions` (or your choice)
4. Partition key: `id` (String)
5. Click "Create table"
6. Update `AWS_DYNAMODB_TABLE_NAME` in Supabase with the new table name
7. Update the IAM policy with the new table ARN

## Summary

✅ Your credentials are **working correctly**  
⚠️ You just need to add the permissions above  
🔧 Use the JSON policy in Option 1 for the quickest fix  
✨ After adding permissions, test again with "Test DB" button
