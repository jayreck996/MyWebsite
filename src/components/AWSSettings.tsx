import { useState } from 'react';

export function AWSSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [credentials, setCredentials] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
    bucketName: '',
    tableName: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      if (!credentials.accessKeyId || !credentials.secretAccessKey || !credentials.region) {
        setMessage({ type: 'error', text: 'Please fill in all required fields' });
        setSaving(false);
        return;
      }

      if (credentials.accessKeyId.length !== 20) {
        setMessage({ 
          type: 'error', 
          text: 'Access Key ID should be exactly 20 characters' 
        });
        setSaving(false);
        return;
      }

      if (!credentials.accessKeyId.startsWith('AKIA') && !credentials.accessKeyId.startsWith('ASIA')) {
        setMessage({ 
          type: 'error', 
          text: 'Access Key ID should start with AKIA or ASIA' 
        });
        setSaving(false);
        return;
      }

      if (credentials.secretAccessKey.length !== 40) {
        setMessage({ 
          type: 'error', 
          text: 'Secret Access Key should be exactly 40 characters' 
        });
        setSaving(false);
        return;
      }

      setMessage({ 
        type: 'success', 
        text: 'Credentials validated! Please update them in Supabase Dashboard → Project Settings → Edge Functions → Secrets' 
      });
      
      setTimeout(() => {
        setCredentials({
          accessKeyId: '',
          secretAccessKey: '',
          region: credentials.region,
          bucketName: credentials.bucketName,
          tableName: credentials.tableName,
        });
      }, 5000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to validate credentials' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary btn-icon"
        style={{
          position: 'fixed',
          bottom: '1rem',
          left: '1rem',
          zIndex: 100
        }}
        title="AWS Settings"
      >
        <svg className="icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m-1 1l-4.2 4.2m13.2-5.2h-6m-6 0H1m18.2 5.2l-4.2-4.2m-1-1l-4.2-4.2" />
        </svg>
      </button>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 style={{ fontSize: '1.125rem', marginBottom: 0 }}>AWS Credentials Setup</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="btn-icon"
            style={{
              background: 'transparent',
              color: 'var(--color-text-tertiary)',
              width: '2rem',
              height: '2rem'
            }}
          >
            <svg className="icon" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="alert-info">
            <p style={{ marginBottom: '0.5rem' }}><strong>How to Update AWS Credentials:</strong></p>
            <ol style={{ marginLeft: '1.5rem', fontSize: '0.875rem' }}>
              <li>Enter your AWS credentials below to validate the format</li>
              <li>Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets</li>
              <li>Update the environment variables with your credentials</li>
              <li>The Edge Functions will automatically restart with new values</li>
            </ol>
          </div>

          {message && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {message.text}
            </div>
          )}

          <div>
            <label htmlFor="accessKeyId">
              AWS Access Key ID <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              type={showSecrets ? 'text' : 'password'}
              id="accessKeyId"
              value={credentials.accessKeyId}
              onChange={(e) =>
                setCredentials({ ...credentials, accessKeyId: e.target.value.trim() })
              }
              placeholder="AKIAIOSFODNN7EXAMPLE"
              style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
            />
            <p className="text-xs" style={{ marginTop: '0.25rem', color: 'var(--color-text-tertiary)' }}>
              Should be 20 characters, starting with AKIA or ASIA
            </p>
          </div>

          <div>
            <label htmlFor="secretAccessKey">
              AWS Secret Access Key <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              type={showSecrets ? 'text' : 'password'}
              id="secretAccessKey"
              value={credentials.secretAccessKey}
              onChange={(e) =>
                setCredentials({ ...credentials, secretAccessKey: e.target.value.trim() })
              }
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
            />
            <p className="text-xs" style={{ marginTop: '0.25rem', color: 'var(--color-text-tertiary)' }}>
              Should be exactly 40 characters
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowSecrets(!showSecrets)}
              className="btn-secondary"
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              <svg className="icon-sm" viewBox="0 0 24 24">
                {showSecrets ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
              {showSecrets ? 'Hide credentials' : 'Show credentials'}
            </button>
          </div>

          <div>
            <label htmlFor="region">
              AWS Region <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <select
              id="region"
              value={credentials.region}
              onChange={(e) => setCredentials({ ...credentials, region: e.target.value })}
            >
              <option value="us-east-1">US East (N. Virginia) - us-east-1</option>
              <option value="us-east-2">US East (Ohio) - us-east-2</option>
              <option value="us-west-1">US West (N. California) - us-west-1</option>
              <option value="us-west-2">US West (Oregon) - us-west-2</option>
              <option value="eu-west-1">Europe (Ireland) - eu-west-1</option>
              <option value="eu-central-1">Europe (Frankfurt) - eu-central-1</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore) - ap-southeast-1</option>
              <option value="ap-northeast-1">Asia Pacific (Tokyo) - ap-northeast-1</option>
            </select>
            <p className="text-xs" style={{ marginTop: '0.25rem', color: 'var(--color-text-tertiary)' }}>
              Must match the region where your DynamoDB table is located
            </p>
          </div>

          <div>
            <label htmlFor="tableName">DynamoDB Table Name</label>
            <input
              type="text"
              id="tableName"
              value={credentials.tableName}
              onChange={(e) =>
                setCredentials({ ...credentials, tableName: e.target.value.trim() })
              }
              placeholder="my-contact-form-table"
            />
            <p className="text-xs" style={{ marginTop: '0.25rem', color: 'var(--color-text-tertiary)' }}>
              The exact name of your DynamoDB table (primary key should be 'userId')
            </p>
          </div>

          <div>
            <label htmlFor="bucketName">S3 Bucket Name</label>
            <input
              type="text"
              id="bucketName"
              value={credentials.bucketName}
              onChange={(e) =>
                setCredentials({ ...credentials, bucketName: e.target.value.trim() })
              }
              placeholder="my-contact-attachments-bucket"
            />
            <p className="text-xs" style={{ marginTop: '0.25rem', color: 'var(--color-text-tertiary)' }}>
              The exact name of your S3 bucket for file uploads
            </p>
          </div>

          <div className="alert-warning">
            <p style={{ marginBottom: 0 }}>
              <strong>⚠️ Security Note:</strong> These credentials will NOT be saved in the app. 
              After validation, you must manually update them in the Supabase Dashboard.
            </p>
          </div>

          <div style={{
            padding: '1rem',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.75rem'
          }}>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Required Environment Variables in Supabase:</strong>
            </p>
            <ul style={{ marginLeft: '1.5rem', fontFamily: 'monospace' }}>
              <li>AWS_ACCESS_KEY_ID</li>
              <li>AWS_SECRET_ACCESS_KEY</li>
              <li>AWS_REGION</li>
              <li>AWS_DYNAMODB_TABLE_NAME</li>
              <li>AWS_S3_BUCKET_NAME</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            <svg className="icon-sm" viewBox="0 0 24 24">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {saving ? 'Validating...' : 'Validate Credentials'}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
