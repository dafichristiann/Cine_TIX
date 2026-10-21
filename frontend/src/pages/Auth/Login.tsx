import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api, { getApiError } from '../../api/axios';
import { ErrorBanner } from '../../components/Status';
import { useAuth } from '../../context/auth';
import type { AuthResponse } from '../../types';
import GoogleAuthModal from '../../components/GoogleAuthModal';

export default function Login() {
  const [activeTab, setActiveTab] = useState<'otp' | 'password'>('otp');
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const res = await api.post<{ success: boolean; message: string }>('/auth/send-otp', {
        email,
        purpose: 'login',
      });
      setOtpSent(true);
      setInfo(res.data.message || 'Kode OTP telah dikirim ke inbox email Anda.');
    } catch (requestError) {
      setError(getApiError(requestError, 'Gagal mengirim kode OTP ke email. Coba lagi.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Masukkan 6-digit kode OTP dengan lengkap.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post<AuthResponse>('/auth/verify-otp', {
        email,
        otp,
      });
      signIn(response.data);
      const requested = searchParams.get('redirect');
      navigate(requested?.startsWith('/') ? requested : '/');
    } catch (requestError) {
      setError(getApiError(requestError, 'Kode OTP tidak cocok atau kedaluwarsa.'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      signIn(response.data);
      const requested = searchParams.get('redirect');
      navigate(requested?.startsWith('/') ? requested : '/');
    } catch (requestError) {
      setError(getApiError(requestError, 'Email atau password salah.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex flex-col lg:grid lg:grid-cols-12 bg-canvas-card rounded-3xl overflow-hidden border border-border-subtle shadow-2xl animate-in fade-in duration-300">
      
      {/* PANEL KIRI (CINEMA IDENTITY) */}
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
            <span>Keamanan Terverifikasi</span>
          </span>
          <h1 className="text-3xl font-extrabold text-text-headline tracking-tight leading-tight">
            Akses Akun Resmi Penonton Bioskop.
          </h1>
          <p className="text-xs text-text-muted max-w-xs leading-relaxed">
            Dapatkan kemudahan pemesanan kursi, e-tiket digital, promo mingguan, dan notifikasi konfirmasi langsung via email resmi.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-text-disabled">
          <span>Enkripsi TLS 256-bit</span>
          <span>•</span>
          <span>SMTP Secure Dispatch</span>
        </div>
      </div>

      {/* PANEL FORM LOGIN (KANAN) */}
      <div className="flex-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-canvas-base">
        <div className="w-full max-w-md bg-canvas-card border border-border-subtle p-6 sm:p-8 rounded-2xl shadow-xl space-y-5">
          
          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-widest text-gold-400 uppercase">Otentikasi Anggota</p>
            <h2 className="text-xl font-bold text-text-headline tracking-tight">Masuk ke CineTix</h2>
            <p className="text-xs text-text-muted">
              Belum punya akun?{' '}
              <Link to="/register" className="text-gold-400 hover:text-gold-300 font-medium transition">
                Daftar sekarang
              </Link>
            </p>
          </div>

          {/* TAB SELECTION: SMTP OTP VS PASSWORD */}
          <div className="grid grid-cols-2 p-1 bg-canvas-base border border-border-subtle rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => { setActiveTab('otp'); setError(''); setInfo(''); }}
              className={`py-2 px-3 rounded-lg transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'otp' ? 'bg-gold-500 text-text-on-gold font-bold shadow-sm' : 'text-text-muted hover:text-text-headline'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Kode OTP Email</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('password'); setError(''); setInfo(''); }}
              className={`py-2 px-3 rounded-lg transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'password' ? 'bg-gold-500 text-text-on-gold font-bold shadow-sm' : 'text-text-muted hover:text-text-headline'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Kata Sandi</span>
            </button>
          </div>

          {error && <ErrorBanner message={error} />}
          {info && (
            <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
              <span>{info}</span>
            </div>
          )}

          {/* TAB 1: SMTP EMAIL OTP LOGIN */}
          {activeTab === 'otp' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider">
                      Alamat Email
                    </label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="nama@email.com" 
                      className="block w-full rounded-lg bg-canvas-base border border-border-subtle text-text-headline px-3.5 py-2.5 text-xs placeholder-text-disabled focus:border-gold-500 focus:outline-none transition"
                      required 
                      autoComplete="email" 
                    />
                    <p className="text-[11px] text-text-muted">
                      Sistem akan mengirimkan 6-digit kode verifikasi resmi ke email Anda via SMTP server.
                    </p>
                  </div>

                  <button 
                    className="w-full bg-gold-500 hover:bg-gold-600 text-text-on-gold font-bold text-xs py-2.5 px-4 rounded-xl disabled:opacity-50 transition flex items-center justify-center space-x-2 shadow-sm shadow-gold-500/15" 
                    type="submit" 
                    disabled={loading}
                  >
                    <span>{loading ? 'Mengirim kode via SMTP...' : 'Kirim Kode Verifikasi'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-canvas-base border border-border-subtle rounded-xl text-xs space-y-1">
                    <span className="text-text-muted block">Kode dikirim ke:</span>
                    <strong className="text-text-headline font-mono">{email}</strong>
                    <button 
                      type="button" 
                      onClick={() => setOtpSent(false)} 
                      className="text-gold-400 hover:text-gold-300 text-[11px] font-semibold block pt-1"
                    >
                      Ubah email
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider">
                      6-Digit Kode OTP
                    </label>
                    <input 
                      type="text" 
                      maxLength={6}
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                      placeholder="Contoh: 123456" 
                      className="block w-full text-center font-mono text-lg tracking-widest rounded-lg bg-canvas-base border border-border-subtle text-gold-400 px-3.5 py-2.5 focus:border-gold-500 focus:outline-none transition"
                      required 
                      autoFocus
                    />
                  </div>

                  <button 
                    className="w-full bg-gold-500 hover:bg-gold-600 text-text-on-gold font-bold text-xs py-2.5 px-4 rounded-xl disabled:opacity-50 transition shadow-sm shadow-gold-500/15" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? 'Memvalidasi...' : 'Verifikasi & Masuk'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: PASSWORD LOGIN */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider">
                  Alamat Email
                </label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="nama@email.com" 
                  className="block w-full rounded-lg bg-canvas-base border border-border-subtle text-text-headline px-3.5 py-2.5 text-xs placeholder-text-disabled focus:border-gold-500 focus:outline-none transition"
                  required 
                  autoComplete="email" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider">
                  Kata Sandi
                </label>
                <div className="relative flex items-center">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Masukkan kata sandi akun" 
                    className="block w-full rounded-lg bg-canvas-base border border-border-subtle text-text-headline pl-3.5 pr-20 py-2.5 text-xs placeholder-text-disabled focus:border-gold-500 focus:outline-none transition"
                    required 
                    autoComplete="current-password" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword((show) => !show)}
                    className="absolute right-2 text-[10px] font-bold text-text-muted hover:text-text-headline px-2 py-1 bg-canvas-elevated rounded border border-border-elevated transition"
                  >
                    {showPassword ? 'Tutup' : 'Lihat'}
                  </button>
                </div>
              </div>

              <button 
                className="w-full bg-gold-500 hover:bg-gold-600 text-text-on-gold font-bold text-xs py-2.5 px-4 rounded-xl disabled:opacity-50 transition shadow-sm shadow-gold-500/15" 
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Memeriksa akun...' : 'Masuk dengan Kata Sandi'}
              </button>
            </form>
          )}

          {/* DIVIDER & OPSI MASUK DENGAN GOOGLE / GMAIL */}
          <div className="pt-2 space-y-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-subtle" />
              </div>
              <span className="relative bg-canvas-card px-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Atau Opsi Cepat
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
              <span>Lanjutkan dengan Akun Google / Gmail</span>
            </button>
          </div>

        </div>
      </div>

      {/* GOOGLE AUTH MODAL */}
      <GoogleAuthModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
      />

    </section>
  );
}
