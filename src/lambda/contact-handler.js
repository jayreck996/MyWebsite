// AWS Lambda Contact Form Handler
// This replaces the Supabase Edge Function

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const multipart = require("lambda-multipart-parser");

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  console.log('Contact form handler invoked');
  console.log('Event:', JSON.stringify(event, null, 2));

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS for CORS preflight
  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    let name, email, message, file;

    // Parse multipart form data
    if (event.headers['content-type']?.includes('multipart/form-data') ||
        event.headers['Content-Type']?.includes('multipart/form-data')) {
      console.log('Parsing multipart form data...');
      
      const result = await multipart.parse(event);
      console.log('Parsed result:', JSON.stringify(result, null, 2));

      name = result.name;
      email = result.email;
      message = result.message;
      
      if (result.files && result.files.length > 0) {
        file = result.files[0];
      }
    } else {
      // Parse JSON body
      const body = JSON.parse(event.body || '{}');
      name = body.name;
      email = body.email;
      message = body.message;
    }

    // Validate required fields
    if (!name || !email || !message) {
      console.error('Missing required fields:', { name: !!name, email: !!email, message: !!message });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields',
          details: 'Name, email, and message are required' 
        }),
      };
    }

    console.log('Processing submission:', { name, email, messageLength: message.length, hasFile: !!file });

    // Generate unique submission ID
    const submissionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    let fileUrl = '';

    // Upload file to S3 if present
    if (file) {
      try {
        const bucketName = process.env.S3_BUCKET_NAME;
        if (!bucketName) {
          console.error('S3_BUCKET_NAME not configured');
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'S3 bucket not configured' }),
          };
        }

        const fileExtension = file.filename.split('.').pop();
        const sanitizedFilename = file.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const s3Key = `contact-attachments/${submissionId}-${sanitizedFilename}`;

        console.log(`Uploading file to S3: ${s3Key}`);

        const uploadCommand = new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: file.content,
          ContentType: file.contentType,
          Metadata: {
            'original-filename': file.filename,
            'uploaded-by': email,
            'submission-id': submissionId,
          },
        });

        await s3Client.send(uploadCommand);
        fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
        console.log(`✅ File uploaded successfully: ${fileUrl}`);
      } catch (error) {
        console.error('S3 upload error:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'Failed to upload file',
            details: error.message 
          }),
        };
      }
    }

    // Store submission in DynamoDB
    try {
      const tableName = process.env.DYNAMODB_TABLE_NAME;
      if (!tableName) {
        console.error('DYNAMODB_TABLE_NAME not configured');
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'DynamoDB table not configured' }),
        };
      }

      console.log(`Storing submission in DynamoDB table: ${tableName}`);

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

      const result = await dynamoDbClient.send(putCommand);
      console.log('✅ DynamoDB PutItem successful:', result);
    } catch (error) {
      console.error('DynamoDB error:', error);
      
      // Provide helpful error messages
      if (error.name === 'ResourceNotFoundException') {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            error: 'DynamoDB table not found',
            details: `Table "${process.env.DYNAMODB_TABLE_NAME}" does not exist`,
            troubleshooting: 'Verify the table name and region are correct',
          }),
        };
      }
      
      if (error.name === 'AccessDeniedException') {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({
            error: 'Permission denied',
            details: 'Lambda execution role lacks DynamoDB permissions',
            troubleshooting: 'Add dynamodb:PutItem permission to Lambda role',
          }),
        };
      }

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to store submission',
          details: error.message,
        }),
      };
    }

    // Return success
    console.log(`✅ Contact form submission processed successfully: ${submissionId}`);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        submissionId,
        fileUrl,
        message: 'Contact form submitted successfully',
      }),
    };

  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message,
      }),
    };
  }
};
