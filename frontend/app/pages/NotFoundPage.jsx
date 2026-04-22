import React from 'react';
import { useNavigate } from 'react-router';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: '#0F1117',
    }}>
      <div style={{
        textAlign: 'center',
        color: '#F1F5F9',
      }}>
        <h1 style={{ fontSize: '64px', fontWeight: 700, marginBottom: '16px' }}>404</h1>
        <p style={{ fontSize: '20px', marginBottom: '24px', color: '#94A3B8' }}>
          Page not found
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 24px',
            background: '#6C63FF',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
