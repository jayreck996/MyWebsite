import { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setStatusMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('message', formData.message);
      if (file) {
        formDataToSend.append('file', file);
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3699ee41/contact`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: formDataToSend,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error('Contact form submission failed:', result);
        
        if (result.troubleshooting) {
          const troubleshootingText = Array.isArray(result.troubleshooting) 
            ? result.troubleshooting.join('\n')
            : result.troubleshooting;
          
          const errorMsg = `${result.error || 'Submission failed'}\n\n${result.message || ''}\n\n${troubleshootingText}\n\nDetails: ${result.details || ''}`;
          throw new Error(errorMsg);
        }
        
        throw new Error(result.error || 'Failed to submit contact form');
      }

      setStatus('success');
      setStatusMessage('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
      setFile(null);
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <section id="contact" style={{ padding: '5rem 1rem', background: 'white' }}>
      <div className="container-sm">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Get in Touch</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Send me a message and I'll get back to you as soon as possible
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Your message..."
            />
          </div>

          <div>
            <label htmlFor="file-upload">Attachment (Optional)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label
                htmlFor="file-upload"
                className="btn btn-secondary"
                style={{ cursor: 'pointer', margin: 0 }}
              >
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Choose File
              </label>
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {file && <span style={{ color: 'var(--color-text-secondary)' }}>{file.name}</span>}
            </div>
          </div>

          {statusMessage && (
            <div
              className={`alert ${status === 'success' ? 'alert-success' : 'alert-error'}`}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}
            >
              {status === 'success' ? (
                <svg className="icon" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '0.125rem' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg className="icon" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '0.125rem' }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              <span style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>{statusMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {status === 'loading' ? (
              <>
                <span className="spinner"></span>
                Sending...
              </>
            ) : (
              <>
                <svg className="icon" viewBox="0 0 24 24">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
