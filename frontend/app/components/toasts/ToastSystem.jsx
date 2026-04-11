import React from 'react';
import { useToast } from '../../store/ToastContext';
import { X } from 'lucide-react';

export function ToastSystem() {
  const { toasts, removeToast } = useToast();

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            padding: '16px 20px',
            background: toast.variant === 'error' ? '#1F2937' : '#1A1D27',
            borderLeft: `4px solid ${
              toast.variant === 'success' ? '#22C55E' :
              toast.variant === 'error' ? '#EF4444' :
              toast.variant === 'warning' ? '#F59E0B' :
              '#6C63FF'
            }`,
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: 300,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            gap: 12,
          }}
        >
          <div>
            <div style={{ color: '#F1F5F9', fontWeight: 600, marginBottom: 4 }}>{toast.title}</div>
            {toast.subtitle && <div style={{ color: '#94A3B8', fontSize: '14px' }}>{toast.subtitle}</div>}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function ToastShowcase() {
  const { showSuccess, showError, showWarning, showCelebration, showVote, showComment } = useToast();

  return (
    <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
      <button onClick={() => showSuccess('Success!', 'Everything worked.')} style={{ padding: '8px 12px', background: '#22C55E', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Success</button>
      <button onClick={() => showError('Error!', 'Something went wrong.')} style={{ padding: '8px 12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Error</button>
      <button onClick={() => showWarning('Warning!', 'Be careful.')} style={{ padding: '8px 12px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Warning</button>
      <button onClick={() => showCelebration('TestCommunity')} style={{ padding: '8px 12px', background: '#6C63FF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Celebration</button>
      <button onClick={() => showVote()} style={{ padding: '8px 12px', background: '#38BDF8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Vote</button>
      <button onClick={() => showComment()} style={{ padding: '8px 12px', background: '#A78BFA', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Comment</button>
    </div>
  );
}
