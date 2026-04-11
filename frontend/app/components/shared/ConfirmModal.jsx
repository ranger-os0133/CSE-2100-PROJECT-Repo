import React from 'react';
import { AlertCircle } from 'lucide-react';

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, dangerous = false }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
    }}>
      <div style={{
        background: '#1A1D27',
        borderRadius: 12,
        padding: '24px',
        width: '90%',
        maxWidth: 400,
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        {dangerous && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <AlertCircle color="#EF4444" size={20} />
          </div>
        )}

        <h2 style={{ color: '#F1F5F9', fontSize: '18px', fontWeight: 600, marginBottom: 12 }}>{title}</h2>
        <p style={{ color: '#94A3B8', marginBottom: 24 }}>{message}</p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: dangerous ? '#EF4444' : '#6C63FF',
              border: 'none',
              borderRadius: 8,
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {dangerous ? 'Delete' : 'Confirm'}
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#F1F5F9',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
