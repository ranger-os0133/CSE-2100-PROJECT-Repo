import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { KeyRound, ShieldCheck, Sparkles } from 'lucide-react';
import { BrandMark } from '../components/layout/BrandMark';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { authService } from '../services';

export default function AdminAuthPage() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, setCurrentUser, setIsAuthenticated } = useApp();
  const { showError, showSuccess } = useToast();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', adminCode: '' });

  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'admin') {
      navigate('/admin');
    }
  }, [currentUser?.role, isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await authService.adminLogin(form.email, form.password, form.adminCode);
        setCurrentUser(response);
        setIsAuthenticated(true);
        showSuccess('Admin access granted', 'Moderation controls are ready.');
        navigate('/admin');
      } else {
        await authService.adminRegister(form.email, form.username, form.password, form.adminCode);
        setMode('login');
        setForm({ username: '', email: form.email, password: '', adminCode: '' });
        showSuccess('Admin account created', 'Sign in with the new admin credentials.');
      }
    } catch (error) {
      showError(error.message || 'Admin authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen auth-screen--admin">
      <div className="auth-screen__glow auth-screen__glow--cyan" />
      <div className="auth-screen__glow auth-screen__glow--amber" />

      <div className="auth-shell">
        <section className="auth-hero auth-hero--admin">
          <BrandMark align="center" />
          <span className="dashboard-badge dashboard-badge--danger">
            <ShieldCheck size={14} />
            Restricted surface
          </span>
          <h1>Admin entry for reports, moderation, and control.</h1>
          <p>
            This section is protected by the shared admin access code and only signs in accounts marked as admins.
          </p>

          <div className="auth-hero__points">
            <div className="auth-hero__point">
              <ShieldCheck size={18} />
              Review report queues and resolve abuse faster.
            </div>
            <div className="auth-hero__point">
              <KeyRound size={18} />
              Freeze user accounts and remove flagged content directly.
            </div>
          </div>

          <Link className="auth-link" to="/auth">
            Back to user login
          </Link>
        </section>

        <section className="auth-card auth-card--admin">
          <div className="auth-card__tabs">
            {['login', 'register'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setMode(tab)}
                className={`auth-card__tab ${mode === tab ? 'is-active' : ''}`}
              >
                {tab === 'login' ? 'Admin Login' : 'Admin Register'}
              </button>
            ))}
          </div>

          <div className="auth-card__copy">
            <h2>{mode === 'login' ? 'Open the control room' : 'Create an admin account'}</h2>
            <p>
              {mode === 'login'
                ? 'You need your account password plus the admin access code.'
                : 'This creates an account with the admin role when the access code is valid.'}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label className="auth-field">
                <span>Username</span>
                <input
                  type="text"
                  placeholder="nightwatch"
                  value={form.username}
                  onChange={event => setForm(prev => ({ ...prev, username: event.target.value }))}
                  required
                />
              </label>
            )}

            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                placeholder="admin@shadowrealm.app"
                value={form.email}
                onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))}
                required
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={event => setForm(prev => ({ ...prev, password: event.target.value }))}
                required
              />
            </label>

            <label className="auth-field">
              <span>Admin access code</span>
              <input
                type="password"
                placeholder="Shared passcode"
                value={form.adminCode}
                onChange={event => setForm(prev => ({ ...prev, adminCode: event.target.value }))}
                required
              />
            </label>

            <button className="app-button app-button--primary app-button--wide" type="submit" disabled={loading}>
              {loading ? 'Working...' : mode === 'login' ? 'Enter Admin Panel' : 'Create Admin'}
            </button>
          </form>

        </section>
      </div>
    </div>
  );
}