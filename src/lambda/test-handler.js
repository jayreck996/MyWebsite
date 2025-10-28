// AWS Lambda Test Endpoints Handler
// Provides diagnostic endpoints for testing AWS configuration

const { DynamoDBClient, DescribeTableCommand, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts");

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const stsClient = new STSClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  console.log('Test handler invoked');
  console.log('Path:', event.path || event.rawPath);

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path || event.rawPath || '';

  try {
    // Health check endpoint
    if (path.endsWith('/health')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Lambda function is healthy',
          timestamp: new Date().toISOString(),
        }),
      };
    }

    // AWS config check endpoint
    if (path.endsWith('/aws-config')) {
      const identity = await stsClient.send(new GetCallerIdentityCommand({}));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          configured: {
            DYNAMODB_TABLE_NAME: !!process.env.DYNAMODB_TABLE_NAME,
            S3_BUCKET_NAME: !!process.env.S3_BUCKET_NAME,
            AWS_REGION: !!process.env.AWS_REGION,
          },
          values: {
            DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME,
            S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
            AWS_REGION: process.env.AWS_REGION,
          },
          identity: {
            account: identity.Account,
            arn: identity.Arn,
          },
        }),
      };
    }

    // Test DynamoDB connection
    if (path.endsWith('/test-dynamodb')) {
      const tableName = process.env.DYNAMODB_TABLE_NAME;
      
      if (!tableName) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'DYNAMODB_TABLE_NAME not configured',
          }),
        };
      }

      const describeCommand = new DescribeTableCommand({ TableName: tableName });
      const tableInfo = await dynamoDbClient.send(describeCommand);
      
      const identity = await stsClient.send(new GetCallerIdentityCommand({}));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          user: identity.Arn,
          table: {
            name: tableInfo.Table.TableName,
            status: tableInfo.Table.TableStatus,
            itemCount: tableInfo.Table.ItemCount,
          },
        }),
      };
    }

    // Test write to DynamoDB
    if (path.endsWith('/test-write')) {
      const tableName = process.env.DYNAMODB_TABLE_NAME;
      
      if (!tableName) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'DYNAMODB_TABLE_NAME not configured',
          }),
        };
      }

      const testId = `test-${Date.now()}`;
      
      const putCommand = new PutItemCommand({
        TableName: tableName,
        Item: {
          userId: { S: testId },
          name: { S: 'Test User' },
          email: { S: 'test@example.com' },
          message: { S: 'This is a test write from the diagnostic tool' },
          timestamp: { S: new Date().toISOString() },
          status: { S: 'test' },
        },
      });

      const result = await dynamoDbClient.send(putCommand);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Test item written successfully to DynamoDB',
          testId,
          tableName,
          result,
        }),
      };
    }

    // Unknown endpoint
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: 'Not found',
        availableEndpoints: [
          '/health',
          '/aws-config',
          '/test-dynamodb',
          '/test-write',
        ],
      }),
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        errorName: error.name,
        details: error.toString(),
      }),
    };
  }
};
