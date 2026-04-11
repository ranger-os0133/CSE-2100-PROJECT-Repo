import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { Shield, Sparkles, LogOut, ArrowLeft } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { useApp } from '../../store/AppContext';
import { authService } from '../../services';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { authReady, currentUser, isAuthenticated, setCurrentUser, setIsAuthenticated } = useApp();

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/admin/auth');
      return;
    }

    if (currentUser?.role !== 'admin') {
      navigate('/app');
    }
  }, [authReady, currentUser?.role, isAuthenticated, navigate]);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    navigate('/admin/auth');
  };

  if (!authReady || !isAuthenticated || currentUser?.role !== 'admin') {
    return null;
  }

  const isDashboard = location.pathname === '/admin';

  return (
    <div className="shell shell-admin">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar__header">
          <BrandMark compact />
          <span className="dashboard-badge">
            <Shield size={14} />
            Admin Control
          </span>
        </div>

        <div className="dashboard-sidebar__intro">
          <h1>Moderation cockpit</h1>
          <p>Review reports, freeze accounts, and remove content from one place.</p>
        </div>

        <nav className="dashboard-nav">
          <Link className={`dashboard-nav__link ${isDashboard ? 'is-active' : ''}`} to="/admin">
            <Sparkles size={16} />
            Dashboard
          </Link>
          <Link className="dashboard-nav__link" to="/app">
            <ArrowLeft size={16} />
            Back to app
          </Link>
        </nav>

        <div className="dashboard-sidebar__footer">
          <div>
            <div className="dashboard-sidebar__label">Signed in as</div>
            <div className="dashboard-sidebar__value">{currentUser.username}</div>
          </div>
          <button className="app-button app-button--ghost" onClick={handleLogout}>
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}