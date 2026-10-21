import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import api, { getApiError } from '../../api/axios';
import { ErrorBanner } from '../../components/Status';
import { useAuth } from '../../context/auth';
import type { AuthResponse } from '../../types';
import GoogleAuthModal from '../../components/GoogleAuthModal';

export default function Register() {
  const [form, setForm] = useState({ nama: '', email: '', no_telepon: '', password: '', confirmPassword: '' });
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) { 
      setError('Konfirmasi kata sandi belum cocok.'); 
      return; 
    }
    setLoading(true); 
    setError('');
    try {
      const response = await api.post<AuthResponse>('/auth/register', { 
        nama: form.nama, 
        email: form.email, 
        no_telepon: form.no_telepon, 
        password: form.password 
      });
      signIn(response.data); 
      navigate('/film');
    } catch (requestError) {
      setError(getApiError(requestError, 'Pendaftaran gagal. Silakan coba lagi.'));
    } finally { 
      setLoading(false); 
    }
  };

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const inputClass = "mt-1.5 block w-full rounded-lg bg-canvas-base border border-border-subtle text-text-headline px-3.5 py-2 text-xs placeholder-text-disabled focus:border-gold-500 focus:outline-none transition";
  const labelClass = "block text-[11px] font-medium text-text-muted uppercase tracking-wider w-full";

  return (
    <section className="min-h-[85vh] flex flex-col lg:grid lg:grid-cols-12 bg-canvas-card rounded-3xl overflow-hidden border border-border-subtle shadow-2xl animate-in fade-in duration-300">
      
      {/* PANEL KIRI */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-canvas-elevated via-canvas-card to-canvas-base p-10 flex-col justify-between relative overflow-hidden border-r border-border-subtle">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center font-black text-text-on-gold text-base shadow-sm">
            C
          </div>
          <span className="font-extrabold text-text-headline text-lg tracking-tight">Cine<span className="text-gold-400">Tix</span></span>
        </div>

        <div className="space-y-4 relative z-10 my-auto">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Keanggotaan CineTix Club</span>
          </span>
          <h1 className="text-3xl font-extrabold text-text-headline tracking-tight leading-tight">
            Kursi Terbaik Menunggu Kehadiran Anda.
          </h1>
          <p className="text-xs text-text-muted max-w-xs leading-relaxed">
            Daftarkan diri Anda untuk menikmati pemesanan tiket instan tanpa antre, diskon voucher F&B, dan notifikasi tiket via email.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-text-disabled">
          <span>Keamanan Data Terjamin</span>
          <span>•</span>
          <span>Konfirmasi Email Resmi</span>
        </div>
      </div>

      {/* PANEL FORM REGISTER */}
      <div className="flex-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-canvas-base">
        <form className="w-full max-w-lg bg-canvas-card border border-border-subtle p-6 sm:p-8 rounded-2xl shadow-xl space-y-4" onSubmit={submit}>
          
          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-widest text-gold-400 uppercase">Pendaftaran Akun</p>
            <h2 className="text-xl font-bold text-text-headline tracking-tight">Daftar Member Bioskop</h2>
            <p className="text-xs text-text-muted">
              Sudah memiliki akun?{' '}
              <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium transition">
                Masuk di sini
              </Link>
            </p>
          </div>

          {error && <ErrorBanner message={error} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label className={labelClass}>
              Nama Lengkap
              <input 
                value={form.nama} 
                onChange={(e) => update('nama', e.target.value)} 
                placeholder="Nama sesuai KTP" 
                className={inputClass} 
                required 
                autoComplete="name" 
              />
            </label>

            <label className={labelClass}>
              Alamat Email
              <input 
                type="email" 
                value={form.email} 
                onChange={(e) => update('email', e.target.value)} 
                placeholder="nama@email.com" 
                className={inputClass} 
                required 
                autoComplete="email" 
              />
            </label>
          </div>

          <label className={labelClass}>
            Nomor Telepon / WhatsApp
            <input 
              type="tel" 
              value={form.no_telepon} 
              onChange={(e) => update('no_telepon', e.target.value)} 
              placeholder="08123456789" 
              className={inputClass} 
              required 
              autoComplete="tel" 
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label className={labelClass}>
              Kata Sandi
              <input 
                type="password" 
                value={form.password} 
                onChange={(e) => update('password', e.target.value)} 
                placeholder="Minimal 6 karakter" 
                className={inputClass} 
                required 
                autoComplete="new-password" 
              />
            </label>

            <label className={labelClass}>
              Ulangi Kata Sandi
              <input 
                type="password" 
                value={form.confirmPassword} 
                onChange={(e) => update('confirmPassword', e.target.value)} 
                placeholder="Konfirmasi sandi" 
                className={inputClass} 
                required 
                autoComplete="new-password" 
              />
            </label>
          </div>

          <p className="text-[11px] text-text-muted leading-relaxed">
            Dengan mendaftar, Anda menyetujui ketentuan layanan dan kebijakan privasi pemesanan tiket resmi CineTix.
          </p>

          <button 
            className="w-full bg-gold-500 hover:bg-gold-600 text-text-on-gold font-bold text-xs py-3 px-4 rounded-xl disabled:opacity-50 transition shadow-sm shadow-gold-500/15" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Mendaftarkan akun...' : 'Buat Akun Member'}
          </button>

          {/* OPSI DAFTAR VIA GOOGLE */}
          <div className="pt-2 space-y-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-subtle" />
              </div>
              <span className="relative bg-canvas-card px-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Atau Daftar Otomatis
              </span>
            </div>

            <button
              type="button"
              onClick={() => setGoogleModalOpen(true)}
              className="w-full flex items-center justify-center space-x-2.5 py-2.5 px-4 rounded-xl border border-border-elevated bg-canvas-elevated hover:bg-canvas-floating text-text-headline text-xs font-bold transition shadow-sm group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Daftar Cepat dengan Akun Google / Gmail</span>
            </button>
          </div>
        </form>
      </div>

      {/* GOOGLE AUTH MODAL */}
      <GoogleAuthModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
      />

    </section>
  );
}
