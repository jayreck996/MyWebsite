import { useState } from 'react';

export function IAMPolicyHelper() {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [showScanError, setShowScanError] = useState(false);

  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:DescribeTable"
        ],
        Resource: "arn:aws:dynamodb:us-east-1:298552056601:table/user"
      },
      {
        Effect: "Allow",
        Action: [
          "s3:PutObject",
          "s3:GetObject"
        ],
        Resource: "arn:aws:s3:::YOUR_BUCKET_NAME/*"
      }
    ]
  };

  const handleCopy = () => {
    const policyText = JSON.stringify(policy, null, 2);
    navigator.clipboard.writeText(policyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: '#fef3c7',
      borderLeft: '4px solid #f59e0b',
      padding: '1rem',
      marginBottom: '1.5rem',
      borderRadius: 'var(--radius-md)'
    }}>
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ color: '#92400e', marginBottom: 0 }}>⚠️ IAM Permissions Required</h3>
        </div>
        <svg 
          className="icon-sm" 
          viewBox="0 0 24 24" 
          style={{ 
            color: '#b45309',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {expanded && (
        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: 0 }}>
            Your IAM user <code style={{ background: '#fde68a', padding: '0 0.25rem', borderRadius: '0.25rem' }}>sweetchilli996</code> needs 
            permissions to access DynamoDB and S3. Follow these steps:
          </p>

          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '0.75rem',
            border: '1px solid #fde047'
          }}>
            <ol style={{ fontSize: '0.875rem', color: '#92400e', marginLeft: '1.25rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                Go to{' '}
                <a 
                  href="https://console.aws.amazon.com/iam/home#/users/sweetchilli996" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#2563eb', textDecoration: 'underline' }}
                >
                  AWS IAM Console → sweetchilli996
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>Click "Add permissions" → "Create inline policy"</li>
              <li style={{ marginBottom: '0.5rem' }}>Click the "JSON" tab</li>
              <li style={{ marginBottom: '0.5rem' }}>Copy and paste the policy below</li>
              <li style={{ marginBottom: '0.5rem' }}>
                Replace <code style={{ background: '#fde68a', padding: '0 0.25rem', borderRadius: '0.25rem' }}>YOUR_BUCKET_NAME</code> with your actual S3 bucket name
              </li>
              <li style={{ marginBottom: '0.5rem' }}>Click "Review policy" → Name it "ContactFormAppPolicy" → "Create policy"</li>
              <li>Wait 30 seconds, then try submitting the form again</li>
            </ol>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '0.875rem', color: '#92400e' }}>IAM Policy JSON:</span>
              <button
                onClick={handleCopy}
                className="btn"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.75rem',
                  background: '#d97706',
                  color: 'white'
                }}
              >
                {copied ? (
                  <>
                    <svg className="icon-sm" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="icon-sm" viewBox="0 0 24 24">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy Policy
                  </>
                )}
              </button>
            </div>
            <pre style={{
              background: '#0f172a',
              color: '#e2e8f0',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              overflowX: 'auto',
              margin: 0
            }}>
              {JSON.stringify(policy, null, 2)}
            </pre>
          </div>

          <div style={{
            background: '#dbeafe',
            border: '1px solid #93c5fd',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            fontSize: '0.75rem',
            color: '#1e3a8a'
          }}>
            <p style={{ marginBottom: '0.25rem' }}>
              <strong>Note:</strong> Replace <code style={{ background: '#bfdbfe', padding: '0 0.25rem', borderRadius: '0.25rem' }}>YOUR_BUCKET_NAME</code> with your actual S3 bucket name in the policy above.
            </p>
            <p style={{ marginBottom: '0.25rem' }}>
              Your DynamoDB table uses <code style={{ background: '#bfdbfe', padding: '0 0.25rem', borderRadius: '0.25rem' }}>userId</code> as the primary key.
            </p>
            <p style={{ marginBottom: 0 }}>
              After adding the policy, wait 30 seconds, then click "Test DB" to verify the connection.
            </p>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#b45309' }}>
            📖 For detailed instructions, see <code style={{ background: '#fde68a', padding: '0 0.25rem', borderRadius: '0.25rem' }}>IAM_PERMISSIONS_SETUP.md</code>
          </div>
        </div>
      )}
    </div>
  );
}
