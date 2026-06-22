import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getApiError } from '../../api/axios';
import { ErrorBanner } from '../../components/Status';
import { useAuth } from '../../context/auth';
import type { AuthResponse } from '../../types';

export default function Register() {
  const [form, setForm] = useState({ nama: '', email: '', no_telepon: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Konfirmasi password belum sama.'); return; }
    setLoading(true); setError('');
    try {
      const response = await api.post<AuthResponse>('/auth/register', { nama: form.nama, email: form.email, no_telepon: form.no_telepon, password: form.password });
      signIn(response.data); navigate('/film');
    } catch (requestError) {
      setError(getApiError(requestError, 'Pendaftaran gagal. Silakan coba lagi.'));
    } finally { setLoading(false); }
  };

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <section className="auth-minimal-page">
      <form className="auth-minimal-card" onSubmit={submit}>
        <Link className="auth-minimal-brand" to="/">CineTix</Link>
        <h1>Create an Account</h1>
        <p>Join to manage your bookings and preferences.</p>
        {error && <ErrorBanner message={error} />}
        <label>
          Full Name
          <span className="auth-input-icon"><i className="material-symbols-outlined">person</i><input value={form.nama} onChange={(event) => update('nama', event.target.value)} placeholder="John Doe" required autoComplete="name" /></span>
        </label>
        <label>
          Email Address
          <span className="auth-input-icon"><i className="material-symbols-outlined">mail</i><input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="john@example.com" required autoComplete="email" /></span>
        </label>
        <label>
          Password
          <span className="auth-input-icon"><i className="material-symbols-outlined">lock</i><input type="password" value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="********" minLength={6} required autoComplete="new-password" /></span>
        </label>
        <label>
          Confirm Password
          <span className="auth-input-icon"><i className="material-symbols-outlined">lock_reset</i><input type="password" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} placeholder="********" minLength={6} required autoComplete="new-password" /></span>
        </label>
        <button className="auth-submit-button" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Register'} <span className="material-symbols-outlined">arrow_forward</span></button>
        <small>Already have an account? <Link to="/login">Sign In</Link></small>
      </form>
      <p className="auth-minimal-footnote">Secure booking powered by CineTix Platform</p>
    </section>
  );
}
