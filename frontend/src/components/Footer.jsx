import React from 'react';
import { Activity, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: 'rgba(11, 15, 25, 0.9)',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      padding: '2rem 1.5rem',
      textAlign: 'center',
      fontSize: '0.9rem',
      color: '#64748b',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#f8fafc' }}>
          <Activity size={18} style={{ color: '#0ea5e9' }} />
          <span>MedConnect Platform</span>
        </div>
        <p>Providing seamless, role-based patient scheduling, doctor verification, and secure medical document uploads.</p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Made with <Heart size={12} style={{ color: '#f43f5e', fill: '#f43f5e' }} /> for Google DeepMind Coding evaluation &copy; 2026.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
