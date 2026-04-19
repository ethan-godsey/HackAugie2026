import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { LogoFull } from '../components/Logo.jsx';

export default function AuthPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from || '/';

  const [tab, setTab]       = useState(location.state?.tab || 'login');

  useEffect(() => {
    if (location.state?.tab) setTab(location.state.tab);
  }, [location.state?.tab]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const [loginForm, setLoginForm]     = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const setL = k => e => setLoginForm(f => ({ ...f, [k]: e.target.value }));
  const setR = k => e => setRegisterForm(f => ({ ...f, [k]: e.target.value }));

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('/api/auth/login', loginForm);
      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirm) {
      setError('Passwords do not match.'); return;
    }
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('/api/auth/register', {
        name:     registerForm.name,
        email:    registerForm.email,
        password: registerForm.password,
      });
      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <LogoFull />
        </div>

        <div className="tab-bar" style={{ marginBottom: '1.5rem' }}>
          <button className={`tab-btn${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>
            Sign in
          </button>
          <button className={`tab-btn${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>
            Create account
          </button>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠</span> {error}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Email address</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={setL('email')}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={setL('password')}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1.25rem' }} disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in…</> : 'Sign in →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="field">
              <label>Full name</label>
              <input
                type="text"
                value={registerForm.name}
                onChange={setR('name')}
                placeholder="Jane Smith"
                autoComplete="name"
                required
              />
            </div>
            <div className="field">
              <label>Email address</label>
              <input
                type="email"
                value={registerForm.email}
                onChange={setR('email')}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={registerForm.password}
                onChange={setR('password')}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
            <div className="field">
              <label>Confirm password</label>
              <input
                type="password"
                value={registerForm.confirm}
                onChange={setR('confirm')}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1.25rem' }} disabled={loading}>
              {loading ? <><span className="spinner" /> Creating account…</> : 'Create account →'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          {tab === 'login' ? (
            <>Don't have an account?{' '}
              <button className="auth-link" onClick={() => { setTab('register'); setError(''); }}>
                Create one free
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button className="auth-link" onClick={() => { setTab('login'); setError(''); }}>
                Sign in
              </button>
            </>
          )}
        </p>

        <p className="auth-legal">
          By continuing, you agree that Appeally helps you understand your federal rights under the Mental Health Parity and Addiction Equity Act (MHPAEA 2008). This is not legal advice.
        </p>
      </div>
    </div>
  );
}
