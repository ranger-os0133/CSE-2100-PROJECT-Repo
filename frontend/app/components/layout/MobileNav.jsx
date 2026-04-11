import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../store/AppContext';
import { Menu, X } from 'lucide-react';

export function MobileNav() {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Feed', path: '/app' },
    { label: 'Create Post', path: '/app/create-post' },
    { label: 'Communities', path: '/app/communities' },
    { label: 'Messages', path: '/app/messages' },
    { label: 'Profile', path: '/app/profile' },
  ];

  return (
    <div style={{ display: 'none', '@media (max-width: 768px)': { display: 'block' } }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#F1F5F9',
        }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 40,
        }} onClick={() => setIsOpen(false)}>
          <nav style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100%',
            maxWidth: '280px',
            height: '100%',
            background: '#0F1117',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            padding: '16px',
            overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#F1F5F9', fontSize: '18px', fontWeight: 700 }}>Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#F1F5F9' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {isAuthenticated ? (
                <>
                  {navItems.map(item => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsOpen(false);
                      }}
                      style={{
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        color: '#F1F5F9',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                      {item.label}
                    </button>
                  ))}
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate('/auth');
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '12px 16px',
                    background: '#6C63FF',
                    border: 'none',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Sign In
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
