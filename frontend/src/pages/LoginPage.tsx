import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { FormError, PasswordInput, Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from './AuthLayout';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as { username?: string } | null)?.username ?? '';
  const [username, setUsername] = useState(prefill);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Enter your username and password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      // On success the PublicOnly guard redirects into the app.
      await login(username.trim(), password, remember);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  const clearError = () => error && setError('');

  return (
    <AuthLayout>
      <h1 className="auth-title">Welcome back</h1>
      <p className="auth-desc">Sign in to continue to your workspace.</p>
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span className="field-label">Username</span>
          <input
            className="input"
            autoComplete="username"
            value={username}
            onChange={(e) => { setUsername(e.target.value); clearError(); }}
            placeholder="your.username"
            autoFocus={!prefill}
          />
        </label>
        <div className="field">
          <label htmlFor="ji-pw" className="field-label">Password</label>
          <PasswordInput
            id="ji-pw"
            autoComplete="current-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError(); }}
            placeholder="••••••••"
            autoFocus={!!prefill}
          />
        </div>
        <label className="checkbox">
          <input type="checkbox" checked={remember} onChange={() => setRemember((r) => !r)} />
          Remember me
        </label>
        <FormError message={error} />
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy && <Spinner />}
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="auth-switch">
        Don't have an account?{' '}
        <button type="button" className="link-btn" onClick={() => navigate('/register')}>Create one</button>
      </p>
    </AuthLayout>
  );
}
