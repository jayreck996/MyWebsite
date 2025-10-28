import './styles/globals.css';
import { Hero } from './components/Hero';
import { ContactForm } from './components/ContactForm';
import { About } from './components/About';
import { AWSConfigCheck } from './components/AWSConfigCheck';
import { AWSSettings } from './components/AWSSettings';
import { IAMPolicyHelper } from './components/IAMPolicyHelper';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)' }}>
      <Hero />
      <About />
      
      <section style={{ padding: '2rem 1rem', background: 'white' }}>
        <div className="container-sm">
          <IAMPolicyHelper />
        </div>
      </section>
      
      <ContactForm />
      
      <footer style={{ 
        background: '#0f172a', 
        color: 'white', 
        padding: '2rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <p style={{ color: 'white', marginBottom: 0 }}>
            &copy; 2025 My Personal Website. All rights reserved.
          </p>
        </div>
      </footer>
      
      <AWSSettings />
      <AWSConfigCheck />
    </div>
  );
}
