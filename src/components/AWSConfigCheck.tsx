import { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function AWSConfigCheck() {
  const [config, setConfig] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  const checkConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3699ee41/aws-config`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error checking AWS config:', error);
    } finally {
      setLoading(false);
    }
  };

  const testDynamoDB = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3699ee41/test-dynamodb`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setTestResult(data);
      console.log('DynamoDB test result:', data);
    } catch (error) {
      console.error('Error testing DynamoDB:', error);
      setTestResult({ success: false, error: (error as Error).message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      background: 'white',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      padding: '1rem',
      maxWidth: '28rem',
      border: '1px solid var(--color-border)',
      maxHeight: '80vh',
      overflowY: 'auto',
      zIndex: 100
    }}>
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.5rem'
        }}>
          <h3 style={{ fontSize: '0.875rem', marginBottom: 0 }}>AWS Configuration</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={checkConfig}
              disabled={loading}
              className="btn btn-primary"
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.75rem',
                minHeight: 'auto'
              }}
            >
              {loading ? 'Checking...' : 'Check Config'}
            </button>
            <button
              onClick={testDynamoDB}
              disabled={testing}
              className="btn"
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.75rem',
                background: '#10b981',
                color: 'white',
                minHeight: 'auto'
              }}
            >
              {testing ? (
                <>
                  <span className="spinner" style={{ width: '0.75rem', height: '0.75rem' }}></span>
                  Testing...
                </>
              ) : (
                'Test DB'
              )}
            </button>
          </div>
        </div>
        <p style={{ fontSize: '0.625rem', color: 'var(--color-text-tertiary)', marginBottom: 0 }}>
          Having issues? See AWS_TROUBLESHOOTING.md for detailed help
        </p>
      </div>

      {config && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
          <div>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
              Configuration Status:
            </p>
            {Object.entries(config.configured).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {value ? (
                  <svg className="icon-sm" viewBox="0 0 24 24" style={{ color: '#10b981' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ) : (
                  <svg className="icon-sm" viewBox="0 0 24 24" style={{ color: '#ef4444' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                )}
                <span style={{ color: 'var(--color-text)' }}>{key}</span>
              </div>
            ))}
          </div>

          {config.validation && (
            <div style={{ 
              background: 'var(--color-bg-secondary)', 
              padding: '0.5rem', 
              borderRadius: 'var(--radius-md)',
              fontSize: '0.625rem'
            }}>
              <p style={{ marginBottom: '0.25rem' }}><strong>Validation:</strong></p>
              {Object.entries(config.validation).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {value ? (
                    <svg className="icon-sm" viewBox="0 0 24 24" style={{ color: '#10b981' }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg className="icon-sm" viewBox="0 0 24 24" style={{ color: '#f59e0b' }}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  )}
                  <span>{key}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {testResult && (
        <div style={{ marginTop: '0.75rem' }}>
          {testResult.success ? (
            <div className="alert-success" style={{ padding: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <svg className="icon-sm" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Connection Successful</span>
              </div>
              <div style={{ marginTop: '0.25rem' }}>
                <strong>User:</strong> {testResult.user}
              </div>
              {testResult.table && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.625rem' }}>
                  <div><strong>Table:</strong> {testResult.table.name}</div>
                  <div><strong>Status:</strong> {testResult.table.status}</div>
                  <div><strong>Items:</strong> {testResult.table.itemCount || 0}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="alert-error" style={{ padding: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <svg className="icon-sm" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>Connection Failed</span>
              </div>
              {testResult.name && (
                <div style={{ marginTop: '0.25rem' }}>
                  <strong>{testResult.name}</strong>
                </div>
              )}
              <div style={{ color: '#7f1d1d', marginTop: '0.25rem' }}>
                {testResult.error || 'Unknown error'}
              </div>
              {testResult.helpText && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  background: '#fee2e2',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #fca5a5'
                }}>
                  <strong>Fix:</strong> {testResult.helpText}
                </div>
              )}
              {testResult.details && (
                <div style={{
                  color: '#991b1b',
                  marginTop: '0.25rem',
                  fontSize: '0.625rem',
                  wordBreak: 'break-all'
                }}>
                  {testResult.details}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
