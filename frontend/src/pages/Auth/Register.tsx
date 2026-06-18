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
    <section className="auth-page"><div className="auth-decoration register-decoration"><div><span className="brand-mark large">C</span><h1>Kursi terbaik menunggumu.</h1><p>Buat akun dan nikmati pengalaman pesan tiket yang lebih sederhana.</p></div></div><div className="auth-form-wrap"><form className="auth-card register-card" onSubmit={submit}><p className="eyebrow">Mulai petualanganmu</p><h2>Buat akun CineTix</h2><p>Sudah punya akun? <Link to="/login">Masuk di sini</Link></p>{error && <ErrorBanner message={error} />}<div className="form-row"><label>Nama lengkap<input value={form.nama} onChange={(event) => update('nama', event.target.value)} placeholder="Nama lengkap" required autoComplete="name" /></label><label>No. telepon<input type="tel" value={form.no_telepon} onChange={(event) => update('no_telepon', event.target.value)} placeholder="08xxxxxxxxxx" autoComplete="tel" /></label></div><label>Email<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="nama@email.com" required autoComplete="email" /></label><div className="form-row"><label>Password<input type="password" value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="Minimal 6 karakter" minLength={6} required autoComplete="new-password" /></label><label>Konfirmasi password<input type="password" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} placeholder="Ulangi password" minLength={6} required autoComplete="new-password" /></label></div><button className="button button-primary button-block" type="submit" disabled={loading}>{loading ? 'Membuat akun...' : 'Daftar sekarang'}</button><small>Dengan mendaftar, kamu menyetujui ketentuan layanan dan kebijakan privasi.</small></form></div></section>
  );
}
