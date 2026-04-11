import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { Home, MessagesSquare, PenSquare, Shield, Users, UserCircle2, LogOut } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { authService } from '../../services';
import { BrandMark } from './BrandMark';

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { authReady, currentUser, isAuthenticated, setIsAuthenticated, setCurrentUser } = useApp();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (authReady && !isAuthenticated) {
      navigate('/auth');
    }
  }, [authReady, isAuthenticated, navigate]);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/');
  };

  // Don't render if not authenticated
  if (!authReady || !isAuthenticated) {
    return null;
  }

  const links = [
    { to: '/app', label: 'Feed', icon: Home },
    { to: '/app/create-post', label: 'Create', icon: PenSquare },
    { to: '/app/messages', label: 'Messages', icon: MessagesSquare },
    { to: '/app/communities', label: 'Communities', icon: Users },
    { to: '/app/reports', label: 'My Reports', icon: Shield },
    { to: '/app/profile', label: 'Profile', icon: UserCircle2 },
  ];

  return (
    <div className="shell shell-app">
      <div className="app-shell">
        <nav className="topbar">
          <div className="topbar__inner">
            <div className="topbar__brand">
              <BrandMark compact />
              <div className="topbar__copy">
                <strong>{currentUser?.role === 'admin' ? 'Admin enabled' : 'Shadow feed'}</strong>
                <span>{currentUser?.username}</span>
              </div>
            </div>

            <div className="topbar__nav">
              {links.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Link key={to} className={`topbar__link ${isActive ? 'is-active' : ''}`} to={to}>
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
              {currentUser?.role === 'admin' && (
                <Link className={`topbar__link ${location.pathname.startsWith('/admin') ? 'is-active' : ''}`} to="/admin">
                  <Shield size={16} />
                  Admin
                </Link>
              )}
            </div>

            <button className="app-button app-button--danger" onClick={handleLogout}>
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </nav>

        <div className="app-shell__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
