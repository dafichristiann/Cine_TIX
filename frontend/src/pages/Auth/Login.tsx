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
    <section className="min-h-[80vh] flex flex-col lg:grid lg:grid-cols-12 bg-slate-950 rounded-3xl overflow-hidden border border-slate-900 shadow-2xl animate-in fade-in duration-300">
      
      {/* PANEL DEKORASI VISUAL (Kiri) - Hanya muncul di lg: screen ke atas */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-10 flex-col justify-between relative overflow-hidden border-r border-slate-900">
        {/* Ambient Blurred Background Glow */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Branding */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center font-black text-slate-950 text-lg shadow-md shadow-teal-500/20">
            C
          </div>
          <span className="font-extrabold text-white text-lg tracking-tight">Cine<span className="text-teal-400">Tix</span></span>
        </div>

        {/* Hero Tagline */}
        <div className="space-y-4 relative z-10 my-auto">
          <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
            Satu akun untuk <br />semua cerita.
          </h1>
          <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
            Masuk, pilih kursi terbaikmu, dan biarkan layar lebar melakukan sisanya.
          </p>
        </div>

        {/* Footer info kecil */}
        <div className="text-[11px] text-slate-600 font-medium">
          CineTix Gateway Security Verified
        </div>
      </div>

      {/* PANEL FORM LOGIN (Kanan) */}
      <div className="flex-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-900/20">
        <form className="w-full max-w-md bg-slate-900 border border-slate-800/80 p-8 rounded-2xl shadow-xl space-y-6" onSubmit={submit}>
          
          {/* Header Form */}
          <div className="space-y-1">
            <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">Selamat datang kembali</p>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Masuk ke CineTix</h2>
            <p className="text-sm text-slate-400">
              Belum punya akun?{' '}
              <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium underline underline-offset-4 transition">
                Daftar sekarang
              </Link>
            </p>
          </div>

          {error && <ErrorBanner message={error} />}

          {/* Input Email */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Email
              <input 
                type="email" 
                value={email} 
                onChange={(event) => setEmail(event.target.value)} 
                placeholder="nama@email.com" 
                className="mt-2 block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2.5 text-sm placeholder-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition"
                required 
                autoComplete="email" 
              />
            </label>
          </div>

          {/* Input Password */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Password
              <div className="relative mt-2 flex items-center">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(event) => setPassword(event.target.value)} 
                  placeholder="Masukkan password" 
                  className="block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 pl-3 pr-24 py-2.5 text-sm placeholder-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition"
                  required 
                  autoComplete="current-password" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword((show) => !show)}
                  className="absolute right-2 px-3 py-1 text-xs font-bold bg-slate-900 border border-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition focus:outline-none"
                >
                  {showPassword ? 'Sembunyikan' : 'Lihat'}
                </button>
              </div>
            </label>
          </div>

          {/* Tombol Submit */}
          <div className="pt-2">
            <button 
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm py-3 px-4 rounded-xl disabled:opacity-50 transition shadow-lg shadow-teal-500/5 focus:outline-none" 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Memeriksa akun...' : 'Masuk'}
            </button>
          </div>

          {/* Ketentuan Layanan */}
          <p className="text-center text-[11px] text-slate-500 leading-normal">
            Dengan masuk, Anda menyetujui ketentuan layanan dan kebijakan privasi enkripsi data CineTix.
          </p>
        </form>
      </div>

    </section>
  );
}