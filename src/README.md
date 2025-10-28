# Personal Website with AWS Integration

A modern personal website with a contact form that integrates with AWS services (S3 for file uploads and DynamoDB for form submissions), built with React, pure CSS, and Supabase Edge Functions.

## 🎯 Features

- **Hero Section**: Eye-catching landing section with background image
- **About Section**: Display AWS service integrations
- **Contact Form**: Full-featured contact form with file upload capabilities
- **AWS Integration**:
  - S3 for secure file attachment storage
  - DynamoDB for form submission persistence
- **Real-time Diagnostics**: Built-in AWS configuration testing tools
- **Responsive Design**: Mobile-friendly layout using pure CSS
- **Security**: Server-side AWS credential management via Supabase Edge Functions

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your Mac:

### Required Software

1. **Node.js** (v18 or higher recommended)
   - Check if installed: `node --version`
   - Download: https://nodejs.org/

2. **npm** (comes with Node.js)
   - Check if installed: `npm --version`

3. **Git**
   - Check if installed: `git --version`
   - Download: https://git-scm.com/

4. **Supabase CLI**
   - Will be installed in steps below

### AWS Requirements

You'll need an AWS account with:
- IAM user with appropriate permissions
- S3 bucket for file storage
- DynamoDB table with `userId` as primary key
- AWS Access Key ID and Secret Access Key

---

## 🚀 Step-by-Step Installation Guide for macOS

### Step 1: Install Homebrew (if not already installed)

Homebrew is a package manager for macOS that makes installing software easier.

```bash
# Check if Homebrew is installed
brew --version

# If not installed, run this command:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Follow the on-screen instructions
# After installation, run these commands (Homebrew will tell you to):
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### Step 2: Install Node.js and npm

```bash
# Install Node.js (this also installs npm)
brew install node

# Verify installation
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
```

### Step 3: Install Supabase CLI

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

### Step 4: Clone or Download Your Project

```bash
# Option A: If you have a Git repository
git clone <your-repository-url>
cd <your-project-directory>

# Option B: If you have a ZIP file
# 1. Extract the ZIP file to your desired location
# 2. Open Terminal and navigate to the project folder
cd /path/to/your/project
```

### Step 5: Install Project Dependencies

This is the main step where you install all required packages.

```bash
# Make sure you're in the project directory
pwd  # Should show your project path

# Install all dependencies from package.json
npm install
```

**What gets installed:**
- `react` - Core React library
- `react-dom` - React DOM rendering
- `@supabase/supabase-js` - Supabase client library
- `@types/react` - TypeScript types for React
- `@types/react-dom` - TypeScript types for React DOM
- `typescript` - TypeScript compiler
- `vite` - Build tool and development server
- And other development dependencies

**Expected output:**
```
added 234 packages, and audited 235 packages in 45s
found 0 vulnerabilities
```

> **Note:** The exact number of packages may vary. This is normal.

### Step 6: Verify Installation

```bash
# Check that node_modules folder was created
ls -la | grep node_modules

# Check package.json exists
cat package.json
```

You should see a `node_modules/` directory created in your project folder.

---

## ⚙️ Configuration

### Step 1: Create Supabase Project

#### 1.1 Sign up for Supabase

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub, Google, or email
4. Verify your email if required

#### 1.2 Create a New Project

1. Click "New Project" from your Supabase dashboard
2. Fill in the details:
   - **Name**: `my-personal-website` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to you
   - **Pricing Plan**: Free tier is fine for testing
3. Click "Create new project"
4. Wait 2-3 minutes for the project to initialize

#### 1.3 Get Your Supabase Credentials

1. Once your project is ready, go to **Project Settings** (gear icon in sidebar)
2. Click on **API** in the left menu
3. You'll need these two values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

#### 1.4 Update Your Project Files

Create or update `/utils/supabase/info.tsx`:

```typescript
// Extract the project ID from your Supabase URL
// If URL is https://abcdefghijk.supabase.co, project ID is "abcdefghijk"
export const projectId = 'your-project-id-here';

// Paste your anon public key here
export const publicAnonKey = 'your-anon-public-key-here';
```

**Example:**
```typescript
export const projectId = 'xyzabc123def';
export const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### Step 2: Set Up AWS Resources

#### 2.1 Create an S3 Bucket

**Option A: Using AWS Console (Easier for beginners)**

1. Log in to https://console.aws.amazon.com/s3/
2. Click "Create bucket"
3. Configuration:
   - **Bucket name**: `my-contact-form-attachments` (must be globally unique)
   - **AWS Region**: `us-east-1` (or your preferred region)
   - **Block Public Access**: Keep all checkboxes checked (default)
   - Leave other settings as default
4. Click "Create bucket"
5. **Save your bucket name** - you'll need it later

**Option B: Using AWS CLI**

```bash
# Install AWS CLI (if not installed)
brew install awscli

# Configure AWS CLI with your credentials
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter default region: us-east-1
# Enter default output format: json

# Create the S3 bucket
aws s3 mb s3://my-contact-form-attachments --region us-east-1
```

#### 2.2 Create a DynamoDB Table

**Option A: Using AWS Console**

1. Go to https://console.aws.amazon.com/dynamodb/
2. Click "Create table"
3. Configuration:
   - **Table name**: `user`
   - **Partition key**: `userId` (Type: String)
   - **Table settings**: Default settings
   - **Read/write capacity**: On-demand
4. Click "Create table"
5. Wait for the table status to become "Active" (30-60 seconds)
6. **Important**: Verify the partition key is named `userId` (not `id` or anything else)

**Option B: Using AWS CLI**

```bash
aws dynamodb create-table \
    --table-name user \
    --attribute-definitions AttributeName=userId,AttributeType=S \
    --key-schema AttributeName=userId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

#### 2.3 Create IAM User with Proper Permissions

**Important:** The IAM user needs specific permissions to access your DynamoDB table and S3 bucket.

1. Go to https://console.aws.amazon.com/iam/
2. Click **Users** in the left sidebar
3. Click **Create user**
4. **Step 1: User details**
   - User name: `contact-form-app-user`
   - Click **Next**

5. **Step 2: Set permissions**
   - Select "Attach policies directly"
   - Click "Create policy" (opens in new tab)
   
6. **In the new tab - Create Policy:**
   - Click the **JSON** tab
   - **Delete all existing text** and paste this policy:

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
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/user"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::my-contact-form-attachments/*"
    }
  ]
}
```

   - **Important**: Replace `my-contact-form-attachments` with your actual S3 bucket name
   - Click **Next**
   - **Policy name**: `ContactFormAppPolicy`
   - Click **Create policy**

7. **Back to Create User tab:**
   - Refresh the policies list (click the refresh icon)
   - Search for `ContactFormAppPolicy`
   - Check the box next to it
   - Click **Next**
   - Click **Create user**

8. **Create Access Keys:**
   - Click on the newly created user (`contact-form-app-user`)
   - Click the **Security credentials** tab
   - Scroll down to **Access keys**
   - Click **Create access key**
   - Choose **Third-party service**
   - Check the confirmation box
   - Click **Next**
   - (Optional) Add description: "Contact form app"
   - Click **Create access key**
   - **IMPORTANT**: Copy both keys now:
     - **Access Key ID**: Looks like `AKIAIOSFODNN7EXAMPLE`
     - **Secret Access Key**: Looks like `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`
   - **Save these in a secure location** - you won't be able to see the Secret Access Key again!
   - Click **Done**

### Step 3: Configure Supabase Edge Function Secrets

Your AWS credentials must be stored securely in Supabase, not in your code.

1. Go to your Supabase project dashboard
2. Click **Project Settings** (gear icon)
3. Click **Edge Functions** in the left menu
4. Click the **Secrets** tab
5. Click **Add new secret**

Add the following secrets one by one:

| Secret Name | Value | Example |
|------------|-------|---------|
| `AWS_ACCESS_KEY_ID` | Your AWS Access Key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Your AWS Secret Access Key | `wJalrXUtnFEMI/K7MDENG...` |
| `AWS_REGION` | Your AWS region | `us-east-1` |
| `AWS_S3_BUCKET_NAME` | Your S3 bucket name | `my-contact-form-attachments` |
| `AWS_DYNAMODB_TABLE_NAME` | Your DynamoDB table name | `user` |

**Important Notes:**
- The Supabase secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are automatically set by Supabase
- Make sure there are no extra spaces before or after the values
- The region must match where you created your DynamoDB table and S3 bucket

6. After adding all secrets, click **Apply** or **Save**

### Step 4: Deploy Supabase Edge Functions

Your project includes a backend server that needs to be deployed to Supabase.

```bash
# Make sure you're in your project directory
cd /path/to/your/project

# Login to Supabase CLI
supabase login

# This will open a browser window to authenticate
# Follow the prompts and authorize the CLI

# Link your project to the CLI
supabase link --project-ref your-project-id

# Replace 'your-project-id' with your actual project ID
# You can find this in your Supabase URL: https://YOUR-PROJECT-ID.supabase.co

# Deploy the Edge Function
supabase functions deploy server

# You should see output like:
# Deploying function server...
# Function deployed successfully!
```

**Verify Deployment:**

```bash
# List all deployed functions
supabase functions list

# You should see 'server' in the list with status 'ACTIVE'
```

---

## 🏃 Running the Application

### Development Mode

```bash
# Make sure you're in the project directory
cd /path/to/your/project

# Start the development server
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Open your browser and go to: http://localhost:5173/

### Production Build

```bash
# Build the application for production
npm run build

# Preview the production build locally
npm run preview
```

The production build will be in the `dist/` folder.

---

## 🧪 Testing Your Setup

### Test 1: Verify Development Server

1. Run `npm run dev`
2. Open http://localhost:5173/ in your browser
3. You should see your personal website with:
   - Hero section with background image
   - About section with AWS features
   - Contact form
   - Diagnostic tools (bottom-right corner)

### Test 2: Check AWS Configuration

1. On your website, look for the **AWS Configuration** panel in the bottom-right corner
2. Click **"Check Config"** button
3. You should see checkmarks (✓) for all AWS settings:
   - ✓ AWS_ACCESS_KEY_ID
   - ✓ AWS_SECRET_ACCESS_KEY
   - ✓ AWS_REGION
   - ✓ AWS_S3_BUCKET_NAME
   - ✓ AWS_DYNAMODB_TABLE_NAME

### Test 3: Test Database Connection

1. In the AWS Configuration panel, click **"Test DB"** button
2. Wait a few seconds
3. Expected result: "Connection Successful" with your user info and table details

**If you see errors**, see the [Troubleshooting](#troubleshooting) section below.

### Test 4: Submit a Contact Form

1. Fill out the contact form:
   - **Name**: Test User
   - **Email**: test@example.com
   - **Message**: This is a test message
   - **Attachment** (optional): Upload a small file
2. Click **"Send Message"**
3. You should see: "Message sent successfully! We'll get back to you soon."

**Verify in AWS:**
- **DynamoDB**: Go to AWS Console → DynamoDB → Tables → user → Explore table items
  - You should see a new item with your test data
- **S3** (if you uploaded a file): Go to AWS Console → S3 → your-bucket-name
  - You should see your uploaded file

---

## 📁 Project Structure

```
├── App.tsx                          # Main application component
├── components/
│   ├── Hero.tsx                     # Hero section with background
│   ├── About.tsx                    # AWS features section
│   ├── ContactForm.tsx              # Contact form with file upload
│   ├── AWSConfigCheck.tsx           # AWS configuration diagnostics
│   ├── AWSSettings.tsx              # AWS credentials validator
│   ├── IAMPolicyHelper.tsx          # IAM policy helper banner
│   └── figma/
│       └── ImageWithFallback.tsx    # Image component with fallback
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx            # Hono server (Edge Function)
│           └── kv_store.tsx         # Key-value store utilities
├── utils/
│   └── supabase/
│       └── info.tsx                 # Supabase credentials
├── styles/
│   └── globals.css                  # Pure CSS styles (no frameworks)
├── AWS_TROUBLESHOOTING.md           # AWS troubleshooting guide
├── IAM_PERMISSIONS_SETUP.md         # IAM setup instructions
└── package.json                     # Project dependencies
```

---

## 🔧 Troubleshooting

### Error: "npm install" fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Try again
npm install
```

### Error: "User is not authorized to perform: dynamodb:DescribeTable"

**Cause**: Your IAM user doesn't have the required permissions.

**Solution**:
1. Go to AWS IAM Console → Users → your-user → Permissions
2. Make sure the `ContactFormAppPolicy` is attached
3. Verify the policy includes `dynamodb:DescribeTable`, `dynamodb:PutItem`, and `dynamodb:GetItem`
4. Check that the table name in the policy matches your actual table name (`user`)

### Error: "Missing the key userId in the item"

**Cause**: Your DynamoDB table has the wrong primary key.

**Solution**:
1. Go to AWS DynamoDB Console
2. Select your table
3. Check the partition key is named `userId` (not `id`)
4. If wrong, you need to delete and recreate the table with the correct key

### Error: "CORS policy blocked"

**Cause**: Edge Function CORS configuration issue.

**Solution**:
```bash
# Redeploy the Edge Function
supabase functions deploy server
```

### Error: "Failed to connect to server"

**Possible causes and solutions**:

1. **Edge Function not deployed**
   ```bash
   supabase functions list
   # If 'server' is not listed or shows 'INACTIVE':
   supabase functions deploy server
   ```

2. **Wrong project ID in info.tsx**
   - Check `/utils/supabase/info.tsx`
   - Verify `projectId` matches your Supabase URL

3. **Environment variables not set**
   - Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
   - Verify all AWS credentials are saved

### Error: "Cannot find module 'react'"

**Solution**:
```bash
# Make sure you ran npm install
npm install

# If that doesn't work, try:
rm -rf node_modules package-lock.json
npm install
```

### File Upload Fails

**Check:**
1. S3 bucket name is correct in Supabase secrets
2. IAM user has `s3:PutObject` permission
3. S3 bucket resource in IAM policy matches your bucket name

### DynamoDB Write Fails

**Check:**
1. Table name is correct in Supabase secrets (`user`)
2. IAM user has `dynamodb:PutItem` permission
3. Table partition key is `userId` (not `id`)
4. Region matches between table, bucket, and configuration

---

## 📦 Dependencies Reference

### Runtime Dependencies

```json
{
  "react": "^18.2.0",           // React library
  "react-dom": "^18.2.0",       // React DOM rendering
  "@supabase/supabase-js": "^2.39.0"  // Supabase client
}
```

### Development Dependencies

```json
{
  "@types/react": "^18.2.0",       // TypeScript types for React
  "@types/react-dom": "^18.2.0",   // TypeScript types for React DOM
  "typescript": "^5.0.0",          // TypeScript compiler
  "vite": "^5.0.0"                 // Build tool and dev server
}
```

### Edge Function Dependencies (Deno)

These are imported in `/supabase/functions/server/index.tsx`:
- `@supabase/supabase-js` - Supabase server client
- `@aws-sdk/client-dynamodb` - AWS DynamoDB SDK
- `@aws-sdk/client-s3` - AWS S3 SDK
- `hono` - Web server framework
- `hono/cors` - CORS middleware
- `hono/logger` - Logging middleware

**Note**: Deno dependencies are automatically handled by Supabase - no manual installation needed.

---

## 🔐 Environment Variables

### Frontend (`/utils/supabase/info.tsx`)

```typescript
export const projectId = 'your-project-id';
export const publicAnonKey = 'your-anon-public-key';
```

### Backend (Supabase Edge Function Secrets)

Set these in Supabase Dashboard → Project Settings → Edge Functions → Secrets:

| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | Your IAM user access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Your IAM user secret key | `wJalrXUtnFEMI...` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_S3_BUCKET_NAME` | S3 bucket for uploads | `my-contact-form-attachments` |
| `AWS_DYNAMODB_TABLE_NAME` | DynamoDB table name | `user` |
| `SUPABASE_URL` | Auto-set by Supabase | - |
| `SUPABASE_ANON_KEY` | Auto-set by Supabase | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-set by Supabase | - |

---

## 🎨 Styling

This project uses **100% pure CSS** - no external CSS frameworks like Tailwind, Bootstrap, or Material-UI.

All styles are located in: `/styles/globals.css`

**Features:**
- CSS Custom Properties (variables)
- Flexbox and Grid layouts
- Responsive design with media queries
- CSS animations and transitions
- Reusable utility classes
- Component-specific styles

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS IAM Documentation](https://docs.aws.amazon.com/iam/)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

---

## 🔒 Security Best Practices

1. **Never commit AWS credentials to Git**
   - Use `.gitignore` to exclude sensitive files
   - Store credentials only in Supabase Edge Function secrets

2. **Use IAM policies with least privilege**
   - Only grant permissions that are absolutely necessary
   - Separate IAM users for different applications

3. **Rotate AWS access keys regularly**
   - Change keys every 90 days
   - Delete unused access keys

4. **Monitor AWS CloudTrail**
   - Review API calls for suspicious activity
   - Set up billing alerts

5. **Keep dependencies updated**
   ```bash
   npm outdated        # Check for outdated packages
   npm update          # Update packages
   ```

---

## 🆘 Getting Help

If you encounter issues:

1. **Check the diagnostic panel** (bottom-right corner on website)
2. **Review logs**:
   ```bash
   # Edge Function logs
   supabase functions logs server
   
   # Browser console (press F12 in browser)
   ```
3. **Read the troubleshooting guides**:
   - `AWS_TROUBLESHOOTING.md` - AWS-specific issues
   - `IAM_PERMISSIONS_SETUP.md` - IAM permission problems
4. **Check AWS Console**:
   - CloudWatch Logs for detailed errors
   - IAM Policy Simulator to test permissions

---

## ✅ Installation Checklist

Before you start development, make sure you've completed all these steps:

- [ ] Installed Node.js (v18+) and npm
- [ ] Installed Supabase CLI
- [ ] Cloned/downloaded the project
- [ ] Ran `npm install` successfully
- [ ] Created Supabase project
- [ ] Updated `/utils/supabase/info.tsx` with your project ID and anon key
- [ ] Created S3 bucket in AWS
- [ ] Created DynamoDB table with `userId` as partition key
- [ ] Created IAM user with proper permissions
- [ ] Generated AWS access keys
- [ ] Added all AWS secrets to Supabase Edge Function Secrets
- [ ] Deployed Edge Function with `supabase functions deploy server`
- [ ] Tested with `npm run dev`
- [ ] Verified AWS config with "Check Config" button
- [ ] Tested database connection with "Test DB" button
- [ ] Successfully submitted a test contact form

---

## 🎉 You're All Set!

Your personal website with AWS integration is now ready for development!

**Next Steps:**
1. Customize the content in `Hero.tsx` and `About.tsx`
2. Test the contact form thoroughly
3. Add your own styling touches
4. Deploy to production (Vercel, Netlify, or AWS Amplify)

**Questions?** Use the built-in diagnostic tools on the website (gear icon for settings, diagnostic panel for connection testing).

---

**Last Updated**: October 28, 2025
