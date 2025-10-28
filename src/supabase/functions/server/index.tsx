import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3@3";
import { DynamoDBClient, PutItemCommand, DescribeTableCommand } from "npm:@aws-sdk/client-dynamodb@3";
import { LambdaClient, InvokeCommand } from "npm:@aws-sdk/client-lambda@3";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize AWS clients with proper credential handling
const getAwsConfig = () => {
  const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')?.trim();
  const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')?.trim();
  const region = Deno.env.get('AWS_REGION')?.trim() || 'us-east-1';

  if (!accessKeyId || !secretAccessKey) {
    console.error('AWS credentials not configured properly');
    return null;
  }

  console.log(`AWS Config - Region: ${region}, Access Key ID: ${accessKeyId.substring(0, 4)}***`);

  return {
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  };
};

let s3Client: S3Client | null = null;
let dynamoDbClient: DynamoDBClient | null = null;
let lambdaClient: LambdaClient | null = null;

try {
  const awsConfig = getAwsConfig();
  if (awsConfig) {
    s3Client = new S3Client(awsConfig);
    dynamoDbClient = new DynamoDBClient(awsConfig);
    lambdaClient = new LambdaClient(awsConfig);
    console.log('AWS clients initialized successfully');
  }
} catch (error) {
  console.error('Failed to initialize AWS clients:', error);
}

// Health check endpoint
app.get("/make-server-3699ee41/health", (c) => {
  return c.json({ status: "ok" });
});

// AWS configuration check endpoint
app.get("/make-server-3699ee41/aws-config", (c) => {
  const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')?.trim();
  const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')?.trim();
  const region = Deno.env.get('AWS_REGION')?.trim();
  const bucketName = Deno.env.get('AWS_S3_BUCKET_NAME')?.trim();
  const tableName = Deno.env.get('AWS_DYNAMODB_TABLE_NAME')?.trim();

  // Validate credential formats
  const warnings = [];
  
  if (accessKeyId) {
    if (accessKeyId.length !== 20) {
      warnings.push(`Access Key ID should be 20 characters, got ${accessKeyId.length}`);
    }
    if (!accessKeyId.startsWith('AKIA') && !accessKeyId.startsWith('ASIA')) {
      warnings.push('Access Key ID should start with AKIA or ASIA');
    }
  }
  
  if (secretAccessKey) {
    if (secretAccessKey.length !== 40) {
      warnings.push(`Secret Access Key should be 40 characters, got ${secretAccessKey.length}`);
    }
    // Check for common whitespace issues
    const rawSecretKey = Deno.env.get('AWS_SECRET_ACCESS_KEY') || '';
    if (rawSecretKey !== rawSecretKey.trim()) {
      warnings.push('Secret Access Key has leading or trailing spaces!');
    }
  }

  return c.json({
    configured: {
      accessKeyId: !!accessKeyId,
      secretAccessKey: !!secretAccessKey,
      region: !!region,
      bucketName: !!bucketName,
      tableName: !!tableName,
    },
    values: {
      accessKeyId: accessKeyId ? `${accessKeyId.substring(0, 8)}***` : 'not set',
      secretAccessKey: secretAccessKey ? `${secretAccessKey.substring(0, 4)}***` : 'not set',
      region: region || 'not set',
      bucketName: bucketName || 'not set',
      tableName: tableName || 'not set',
    },
    clients: {
      s3Client: !!s3Client,
      dynamoDbClient: !!dynamoDbClient,
      lambdaClient: !!lambdaClient,
    },
    debug: {
      accessKeyIdLength: accessKeyId?.length || 0,
      secretAccessKeyLength: secretAccessKey?.length || 0,
      accessKeyIdFormat: accessKeyId ? (accessKeyId.startsWith('AKIA') || accessKeyId.startsWith('ASIA') ? 'valid' : 'invalid') : 'not set',
    },
    warnings: warnings.length > 0 ? warnings : null,
  });
});

// Test AWS DynamoDB connection endpoint
app.get("/make-server-3699ee41/test-dynamodb", async (c) => {
  try {
    const tableName = Deno.env.get('AWS_DYNAMODB_TABLE_NAME')?.trim();
    if (!tableName) {
      return c.json({ 
        success: false, 
        error: 'AWS_DYNAMODB_TABLE_NAME not configured' 
      }, 400);
    }

    if (!dynamoDbClient) {
      return c.json({ 
        success: false, 
        error: 'DynamoDB client not initialized. Check AWS credentials.' 
      }, 500);
    }

    console.log(`Testing DynamoDB connection to table: ${tableName}`);

    const describeCommand = new DescribeTableCommand({
      TableName: tableName,
    });

    const response = await dynamoDbClient.send(describeCommand);
    
    return c.json({
      success: true,
      message: 'Successfully connected to DynamoDB',
      table: {
        name: response.Table?.TableName,
        status: response.Table?.TableStatus,
        itemCount: response.Table?.ItemCount,
        keySchema: response.Table?.KeySchema,
      },
    });
  } catch (error) {
    console.error('DynamoDB test error:', error);
    
    // Provide specific guidance based on error type
    let helpText = '';
    if (error.name === 'AccessDeniedException') {
      helpText = 'Your IAM user needs the "dynamodb:DescribeTable" and "dynamodb:PutItem" permissions. See IAM_PERMISSIONS_SETUP.md for detailed instructions.';
    } else if (error.name === 'ResourceNotFoundException') {
      helpText = 'The table does not exist in this region. Check the table name and region are correct.';
    } else if (error.message?.includes('signature')) {
      helpText = 'Credentials are incorrect. Double-check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.';
    }
    
    return c.json({
      success: false,
      error: error.message,
      name: error.name,
      details: error.toString(),
      helpText: helpText,
    }, 500);
  }
});

// Contact form submission endpoint
app.post("/make-server-3699ee41/contact", async (c) => {
  try {
    // Get fresh AWS credentials for this request
    const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')?.trim();
    const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')?.trim();
    const region = Deno.env.get('AWS_REGION')?.trim() || 'us-east-1';

    if (!accessKeyId || !secretAccessKey) {
      console.error('AWS credentials not configured');
      return c.json({ 
        error: 'AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.' 
      }, 500);
    }

    // Create fresh AWS clients for this request
    const awsClientConfig = {
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };

    const requestS3Client = new S3Client(awsClientConfig);
    const requestDynamoDbClient = new DynamoDBClient(awsClientConfig);

    const formData = await c.req.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;
    const file = formData.get('file') as File | null;

    if (!name || !email || !message) {
      console.log('Contact form validation error: Missing required fields');
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const submissionId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    let fileUrl = null;

    // Upload file to S3 if provided
    if (file) {
      try {
        const bucketName = Deno.env.get('AWS_S3_BUCKET_NAME')?.trim();
        if (!bucketName) {
          console.log('S3 upload error: AWS_S3_BUCKET_NAME not configured');
          return c.json({ error: 'S3 bucket not configured. Please set AWS_S3_BUCKET_NAME.' }, 500);
        }

        const fileKey = `contact-attachments/${submissionId}/${file.name}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        console.log(`Uploading file to S3: ${bucketName}/${fileKey}`);

        const uploadCommand = new PutObjectCommand({
          Bucket: bucketName,
          Key: fileKey,
          Body: buffer,
          ContentType: file.type,
        });

        await requestS3Client.send(uploadCommand);
        fileUrl = `s3://${bucketName}/${fileKey}`;
        console.log(`File uploaded to S3 successfully: ${fileUrl}`);
      } catch (error) {
        console.error('S3 upload error details:', error);
        return c.json({ 
          error: `Failed to upload file to S3: ${error.message}. Please verify your S3 bucket exists and credentials are correct.` 
        }, 500);
      }
    }

    // Store submission in DynamoDB
    try {
      const tableName = Deno.env.get('AWS_DYNAMODB_TABLE_NAME')?.trim();
      if (!tableName) {
        console.log('DynamoDB error: AWS_DYNAMODB_TABLE_NAME not configured');
        return c.json({ error: 'DynamoDB table not configured. Please set AWS_DYNAMODB_TABLE_NAME.' }, 500);
      }

      console.log(`Attempting to store in DynamoDB - Table: ${tableName}, Region: ${region}`);
      console.log(`Access Key (first 4 chars): ${accessKeyId.substring(0, 4)}***`);

      const putCommand = new PutItemCommand({
        TableName: tableName,
        Item: {
          userId: { S: submissionId },
          id: { S: submissionId },
          name: { S: name },
          email: { S: email },
          message: { S: message },
          fileUrl: { S: fileUrl || '' },
          timestamp: { S: timestamp },
          status: { S: 'new' },
        },
      });

      await requestDynamoDbClient.send(putCommand);
      console.log(`Contact submission stored in DynamoDB with ID: ${submissionId}`);
    } catch (error) {
      console.error('DynamoDB error details:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Check if it's a credential error
      if (error.message?.includes('signature') || error.name === 'UnrecognizedClientException') {
        return c.json({ 
          error: 'AWS Authentication Error',
          message: 'The signature validation failed. This usually means:',
          troubleshooting: [
            '1. AWS_ACCESS_KEY_ID is incorrect - Please double-check the value',
            '2. AWS_SECRET_ACCESS_KEY is incorrect - Please verify there are no typos',
            '3. The credentials have extra spaces/newlines - Re-enter them carefully',
            '4. AWS_REGION does not match your table location - Check your DynamoDB console',
            '5. The IAM user associated with these credentials may not have the necessary permissions',
          ],
          currentConfig: {
            region: region,
            accessKeyIdPrefix: accessKeyId.substring(0, 8) + '...',
            secretKeyLength: secretAccessKey.length,
            tableName: tableName,
          },
          details: error.message,
        }, 401);
      }
      
      if (error.name === 'ResourceNotFoundException') {
        return c.json({ 
          error: 'DynamoDB Table Not Found',
          message: `The table "${tableName}" does not exist in region "${region}"`,
          troubleshooting: [
            '1. Verify the table name is correct',
            '2. Check that the table is in the correct AWS region',
            '3. Ensure the table has been created in your AWS account',
          ],
          details: error.message,
        }, 404);
      }
      
      return c.json({ 
        error: `Failed to store submission in DynamoDB: ${error.message}`,
        errorName: error.name,
        troubleshooting: 'Please check the server logs for more details',
      }, 500);
    }

    // Optionally invoke Lambda function for processing
    // Uncomment this section if you have a Lambda function to process contact submissions
    /*
    try {
      const lambdaFunctionName = Deno.env.get('AWS_LAMBDA_FUNCTION_NAME');
      if (lambdaFunctionName) {
        const invokeCommand = new InvokeCommand({
          FunctionName: lambdaFunctionName,
          InvocationType: 'Event', // Async invocation
          Payload: JSON.stringify({
            submissionId,
            name,
            email,
            message,
            fileUrl,
            timestamp,
          }),
        });

        await lambdaClient.send(invokeCommand);
        console.log(`Lambda function invoked: ${lambdaFunctionName}`);
      }
    } catch (error) {
      console.error('Lambda invocation error:', error);
      // Don't fail the request if Lambda fails
    }
    */

    return c.json({
      success: true,
      submissionId,
      message: 'Contact form submitted successfully',
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return c.json({
      error: `Failed to process contact form: ${error.message}`,
    }, 500);
  }
});

// Get all contact submissions from DynamoDB
app.get("/make-server-3699ee41/submissions", async (c) => {
  try {
    const tableName = Deno.env.get('AWS_DYNAMODB_TABLE_NAME');
    if (!tableName) {
      return c.json({ error: 'DynamoDB table not configured' }, 500);
    }

    // For demo purposes, we'll use kv_store to track submission IDs
    // In a real app, you'd use DynamoDB Scan or Query
    const submissions = await kv.getByPrefix('contact_');
    
    return c.json({
      success: true,
      submissions,
      note: 'For production, implement DynamoDB Scan/Query operations',
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return c.json({
      error: `Failed to fetch submissions: ${error.message}`,
    }, 500);
  }
});

Deno.serve(app.fetch);
