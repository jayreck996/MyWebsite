import { ImageWithFallback } from './figma/ImageWithFallback';

export function Hero() {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={{
      position: 'relative',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1630283017802-785b7aff9aac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYxNTMwMTEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Hero background"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))'
        }} />
      </div>
      
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        color: 'white',
        padding: '0 1rem'
      }}>
        <h1 style={{ marginBottom: '1rem' }}>Welcome to My Website</h1>
        <p style={{
          maxWidth: '48rem',
          margin: '0 auto 2rem',
          color: '#cbd5e1',
          fontSize: '1.125rem'
        }}>
          Building innovative solutions with modern technologies and cloud services
        </p>
        <button
          onClick={scrollToContact}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          Get in Touch
          <svg className="icon" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
    </section>
  );
}
