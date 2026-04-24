import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Lock, Sparkles, UserPlus } from 'lucide-react';
import { BrandMark } from '../components/layout/BrandMark';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { authService } from '../services';

export default function AuthPage() {
  const navigate = useNavigate();
  const { authReady, currentUser, isAuthenticated, setIsAuthenticated, setCurrentUser } = useApp();
  const { showSuccess, showError } = useToast();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      return;
    }

    navigate(currentUser?.role === 'admin' ? '/admin' : '/app');
  }, [authReady, currentUser?.role, isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const response = await authService.login(form.email, form.password);
        setCurrentUser(response);
        setIsAuthenticated(true);
        showSuccess('Welcome back!', 'Good to see you again.');
        navigate('/app');
      } else {
        const response = await authService.register(form.email, form.username, form.password);
        setCurrentUser(response);
        // User is NOT authenticated after register - no token returned
        // They must login separately
        setIsAuthenticated(false);
        showSuccess('Account created!', 'Please login with your credentials.');
        // Stay on auth page, switch to login mode
        setMode('login');
        setForm({ username: '', email: form.email, password: '' });
      }
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-screen__glow auth-screen__glow--cyan" />
      <div className="auth-screen__glow auth-screen__glow--amber" />

      <div className="auth-shell">
        <section className="auth-hero">
          <BrandMark align="center" />
          <span className="dashboard-badge">
            <Sparkles size={14} />
            New social control center
          </span>
          <h1>Speak clearly. Connect for real.</h1>
          <p>ShadowRealm is built for sharp posting, direct replies, and a feed that feels alive across every screen.</p>

          <div className="auth-hero__points">
            <div className="auth-hero__point">
              <UserPlus size={18} />
              Smooth sign up and sign in for everyday users.
            </div>
            <div className="auth-hero__point">
              <Lock size={18} />
              Separate admin entrance for moderation and platform control.
            </div>
          </div>

          <Link className="auth-link" to="/admin/auth">
            Enter admin section
            <ArrowRight size={16} />
          </Link>
        </section>

        <section className="auth-card">
          <div className="auth-card__tabs">
            {['login', 'register'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setMode(tab)}
                className={`auth-card__tab ${mode === tab ? 'is-active' : ''}`}
              >
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="auth-card__copy">
            <h2>{mode === 'login' ? 'Welcome back' : 'Make your account'}</h2>
            <p>{mode === 'login' ? 'Pick up where you left off.' : 'Create a student profile and join the feed.'}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label className="auth-field">
                <span>Username</span>
                <input
                  type="text"
                  placeholder="shadowrunner"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  required
                />
              </label>
            )}

            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </label>

            <button className="app-button app-button--primary app-button--wide" type="submit" disabled={loading}>
              {loading ? 'Working...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footnote">
            Need moderation tools? Use the <Link to="/admin/auth">admin portal</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
