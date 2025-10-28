export function About() {
  const features = [
    {
      icon: (
        <svg className="icon-lg" viewBox="0 0 24 24">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
          <path d="M7 21v-2a4 4 0 0 1 4-4h2" />
          <path d="M3.1 14.1a4 4 0 0 1 0-4.2" />
        </svg>
      ),
      title: 'AWS S3 Integration',
      description: 'Secure file storage and management with Amazon S3',
    },
    {
      icon: (
        <svg className="icon-lg" viewBox="0 0 24 24">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14a9 3 0 0 0 18 0V5" />
        </svg>
      ),
      title: 'DynamoDB Database',
      description: 'Fast and scalable NoSQL database for all your data needs',
    },
    {
      icon: (
        <svg className="icon-lg" viewBox="0 0 24 24">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      title: 'Lambda Functions',
      description: 'Serverless computing for efficient and cost-effective operations',
    },
  ];

  return (
    <section style={{ padding: '5rem 1rem' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Powered by AWS</h2>
          <p style={{
            color: 'var(--color-text-secondary)',
            maxWidth: '48rem',
            margin: '0 auto'
          }}>
            This website leverages multiple AWS services to provide a robust and scalable experience
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="card"
              style={{
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div style={{
                width: '3rem',
                height: '3rem',
                background: '#dbeafe',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: '#2563eb'
              }}>
                {feature.icon}
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>{feature.title}</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
