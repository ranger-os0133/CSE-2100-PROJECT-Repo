import React from 'react';

export function SkeletonCard({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            background: '#1A1D27',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '18px 20px',
            animation: 'pulse 2s infinite',
          }}
        >
          <div style={{ height: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 12 }} />
          <div style={{ height: 40, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 12 }} />
          <div style={{ height: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 4, width: '60%' }} />
        </div>
      ))}
    </>
  );
}
