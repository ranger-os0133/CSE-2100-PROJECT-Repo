import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
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
            maxWidth: '500px',
          }}>
            <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px', color: '#EF4444' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '14px', marginBottom: '24px', color: '#94A3B8' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/';
              }}
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
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
