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
      const requested = searchParams.get('redirect');
      navigate(requested?.startsWith('/') ? requested : '/');
    } catch (requestError) {
      setError(getApiError(requestError, 'Email atau password salah.'));
    } finally { setLoading(false); }
  };

  return (
    <section className="auth-page"><div className="auth-decoration"><div><span className="brand-mark large">C</span><h1>Satu akun untuk semua cerita.</h1><p>Masuk, pilih kursi terbaikmu, dan biarkan layar lebar melakukan sisanya.</p></div></div><div className="auth-form-wrap"><form className="auth-card" onSubmit={submit}><p className="eyebrow">Selamat datang kembali</p><h2>Masuk ke CineTix</h2><p>Belum punya akun? <Link to="/register">Daftar sekarang</Link></p>{error && <ErrorBanner message={error} />}<label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" required autoComplete="email" /></label><label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password" required autoComplete="current-password" /><button type="button" onClick={() => setShowPassword((show) => !show)}>{showPassword ? 'Sembunyikan' : 'Lihat'}</button></div></label><button className="button button-primary button-block" type="submit" disabled={loading}>{loading ? 'Memeriksa akun...' : 'Masuk'}</button><small>Dengan masuk, kamu menyetujui ketentuan layanan CineTix.</small></form></div></section>
  );
}
