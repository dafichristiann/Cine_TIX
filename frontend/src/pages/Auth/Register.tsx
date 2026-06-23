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

  const inputClass = "mt-2 block w-full rounded-lg bg-slate-955 border border-slate-800 text-slate-100 px-3 py-2 text-sm placeholder-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition";
  const labelClass = "block text-xs font-semibold text-slate-400 uppercase tracking-wider w-full";

  return (
    <section className="min-h-[85vh] flex flex-col lg:grid lg:grid-cols-12 bg-slate-950 rounded-3xl overflow-hidden border border-slate-900 shadow-2xl animate-in fade-in duration-300">
      
      {/* PANEL DEKORASI VISUAL (Kiri) - Tampilan Serasi dengan Login */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-10 flex-col justify-between relative overflow-hidden border-r border-slate-900">
        {/* Ambient Blurred Background Glow */}
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Branding Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center font-black text-slate-950 text-lg shadow-md shadow-teal-500/20">
            C
          </div>
          <span className="font-extrabold text-white text-lg tracking-tight">Cine<span className="text-teal-400">Tix</span></span>
        </div>

        {/* Hero Tagline */}
        <div className="space-y-4 relative z-10 my-auto">
          <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
            Kursi terbaik <br />menuggumu.
          </h1>
          <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
            Buat akun dan nikmati pengalaman pesan tiket bioskop yang jauh lebih sederhana, cepat, dan tanpa antre.
          </p>
        </div>

        {/* Security Info */}
        <div className="text-[11px] text-slate-600 font-medium">
          CineTix Member Registration Platform
        </div>
      </div>

      {/* PANEL FORM REGISTER (Kanan) */}
      <div className="flex-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-slate-900/20">
        <form className="w-full max-w-xl bg-slate-900 border border-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-xl space-y-5" onSubmit={submit}>
          
          {/* Header Form */}
          <div className="space-y-1">
            <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">Mulai petualanganmu</p>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Buat Akun CineTix</h2>
            <p className="text-sm text-slate-400">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium underline underline-offset-4 transition">
                Masuk di sini
              </Link>
            </p>
          </div>

          {error && <ErrorBanner message={error} />}

          {/* Baris Input: Nama Lengkap & No Telepon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={labelClass}>
              Nama Lengkap
              <input 
                value={form.nama} 
                onChange={(event) => update('nama', event.target.value)} 
                placeholder="Nama lengkap Anda" 
                className={inputClass}
                required 
                autoComplete="name" 
              />
            </label>
            <label className={labelClass}>
              No. Telepon
              <input 
                type="tel" 
                value={form.no_telepon} 
                onChange={(event) => update('no_telepon', event.target.value)} 
                placeholder="08xxxxxxxxxx" 
                className={inputClass}
                autoComplete="tel" 
              />
            </label>
          </div>

          {/* Input Email */}
          <label className={labelClass}>
            Email
            <input 
              type="email" 
              value={form.email} 
              onChange={(event) => update('email', event.target.value)} 
              placeholder="nama@email.com" 
              className={inputClass}
              required 
              autoComplete="email" 
            />
          </label>

          {/* Baris Input: Password & Konfirmasi Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={labelClass}>
              Password
              <input 
                type="password" 
                value={form.password} 
                onChange={(event) => update('password', event.target.value)} 
                placeholder="Minimal 6 karakter" 
                className={inputClass}
                minLength={6} 
                required 
                autoComplete="new-password" 
              />
            </label>
            <label className={labelClass}>
              Konfirmasi Password
              <input 
                type="password" 
                value={form.confirmPassword} 
                onChange={(event) => update('confirmPassword', event.target.value)} 
                placeholder="Ulangi password" 
                className={inputClass}
                minLength={6} 
                required 
                autoComplete="new-password" 
              />
            </label>
          </div>

          {/* Tombol Submit */}
          <div className="pt-2">
            <button 
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm py-3 px-4 rounded-xl disabled:opacity-50 transition shadow-lg shadow-teal-500/5 focus:outline-none" 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Membuat akun...' : 'Daftar Sekarang'}
            </button>
          </div>

          {/* Ketentuan Layanan */}
          <p className="text-center text-[11px] text-slate-500 leading-normal">
            Dengan mendaftar, Anda menyetujui ketentuan layanan serta kebijakan privasi enkripsi tiket otomatis CineTix.
          </p>
        </form>
      </div>

    </section>
  );
}