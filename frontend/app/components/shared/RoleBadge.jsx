import React from 'react';
import { Shield, Users } from 'lucide-react';

export function AnonymousBadge() {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 8px',
      background: 'rgba(100,116,139,0.15)',
      border: '1px solid rgba(100,116,139,0.3)',
      borderRadius: 4,
      fontSize: '11px',
      color: '#94A3B8',
      fontWeight: 600,
    }}>
      👻 Anonymous
    </div>
  );
}

export function CaptainBadge() {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 8px',
      background: 'rgba(249,115,22,0.15)',
      border: '1px solid rgba(249,115,22,0.3)',
      borderRadius: 4,
      fontSize: '11px',
      color: '#F59E0B',
      fontWeight: 600,
    }}>
      <Shield size={12} /> Captain
    </div>
  );
}

export function MemberBadge() {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 8px',
      background: 'rgba(34,197,94,0.15)',
      border: '1px solid rgba(34,197,94,0.3)',
      borderRadius: 4,
      fontSize: '11px',
      color: '#22C55E',
      fontWeight: 600,
    }}>
      <Users size={12} /> Member
    </div>
  );
}
