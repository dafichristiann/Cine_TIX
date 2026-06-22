import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api, { getApiError } from '../../api/axios';
import { ErrorBanner } from '../../components/Status';
import { useAuth } from '../../context/auth';
import type { AuthResponse } from '../../types';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true); setError('');
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      signIn(response.data);
      if (response.data.user.role?.toLowerCase() === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }
      const requested = searchParams.get('redirect');
      navigate(requested?.startsWith('/') ? requested : '/', { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError, 'Email atau password salah.'));
    } finally { setLoading(false); }
  };

  return (
    <section className="auth-minimal-page">
      <form className="auth-minimal-card" onSubmit={submit}>
        <Link className="auth-minimal-brand" to="/">CineTix</Link>
        <h1>Sign In</h1>
        <p>Access your bookings and CineTix preferences.</p>
        {error && <ErrorBanner message={error} />}
        <label>
          Email Address
          <span className="auth-input-icon"><i className="material-symbols-outlined">mail</i><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="john@example.com" required autoComplete="email" /></span>
        </label>
        <label>
          Password
          <span className="auth-input-icon">
            <i className="material-symbols-outlined">lock</i>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="********" required autoComplete="current-password" />
            <button type="button" onClick={() => setShowPassword((show) => !show)}>{showPassword ? 'Hide' : 'Show'}</button>
          </span>
        </label>
        <button className="auth-submit-button" type="submit" disabled={loading}>{loading ? 'Checking...' : 'Sign In'} <span className="material-symbols-outlined">arrow_forward</span></button>
        <small>Don't have an account? <Link to="/register">Register</Link></small>
      </form>
      <p className="auth-minimal-footnote">Secure booking powered by CineTix Platform</p>
    </section>
  );
}
