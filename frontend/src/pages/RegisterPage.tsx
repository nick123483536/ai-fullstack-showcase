import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client';
import { FormError, Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AuthLayout } from './AuthLayout';

export function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (error) setError('');
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const username = form.username.trim();
    if (!username) return setError('Choose a username.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (form.password !== form.confirm) return setError("Passwords don't match.");
    setBusy(true);
    setError('');
    try {
      await register(username, form.password);
      toast('Account created. Sign in to continue.');
      navigate('/login', { state: { username } });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  const pwType = showPw ? 'text' : 'password';

  return (
    <AuthLayout>
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-desc">Start tracking opportunities in one place.</p>
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span className="field-label">Username</span>
          <input className="input" autoComplete="username" value={form.username} onChange={set('username')} placeholder="your.username" autoFocus />
        </label>
        <label className="field">
          <span className="field-label">Password</span>
          <input className="input" type={pwType} autoComplete="new-password" value={form.password} onChange={set('password')} placeholder="At least 8 characters" />
        </label>
        <label className="field">
          <span className="field-label">Confirm password</span>
          <input className="input" type={pwType} autoComplete="new-password" value={form.confirm} onChange={set('confirm')} placeholder="Re-enter password" />
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={showPw} onChange={() => setShowPw((s) => !s)} />
          Show passwords
        </label>
        <FormError message={error} />
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy && <Spinner />}
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account?{' '}
        <button type="button" className="link-btn" onClick={() => navigate('/login')}>Sign in</button>
      </p>
    </AuthLayout>
  );
}
