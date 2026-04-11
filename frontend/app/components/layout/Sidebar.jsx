import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router';

export function Sidebar() {
  return (
    <aside style={{
      width: '250px',
      background: '#1A1D27',
      borderRight: '1px solid rgba(255,255,255,0.1)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#F1F5F9', fontSize: '24px', fontWeight: 800 }}>ShadowRealm</h1>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          { name: 'Feed', path: '/' },
          { name: 'Messages', path: '/messages' },
          { name: 'Communities', path: '/communities' },
          { name: 'Profile', path: '/profile' },
        ].map(item => (
          <a
            key={item.path}
            href={item.path}
            style={{
              padding: '12px 16px',
              color: '#94A3B8',
              textDecoration: 'none',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(108,99,255,0.1)';
              e.currentTarget.style.color = '#F1F5F9';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#94A3B8';
            }}
          >
            {item.name}
          </a>
        ))}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      display: 'none',
      background: '#1A1D27',
      padding: '12px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      '@media (max-width: 768px)': {
        display: 'flex',
      },
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#F1F5F9' }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <nav style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#1A1D27',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '12px 0',
        }}>
          {[
            { name: 'Feed', path: '/' },
            { name: 'Messages', path: '/messages' },
            { name: 'Communities', path: '/communities' },
            { name: 'Profile', path: '/profile' },
          ].map(item => (
            <a
              key={item.path}
              href={item.path}
              style={{
                display: 'block',
                padding: '12px 16px',
                color: '#94A3B8',
                textDecoration: 'none',
              }}
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
