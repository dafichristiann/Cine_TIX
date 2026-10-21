import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, Mail } from 'lucide-react';
import api, { getApiError } from '../api/axios';
import { useAuth } from '../context/auth';
import type { AuthResponse } from '../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number | string;
              logo_alignment?: 'left' | 'center';
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = '122715247460-hvjn3b4nl87tj4tk58llmdghslsv4cah.apps.googleusercontent.com';

export default function GoogleAuthModal({ isOpen, onClose }: GoogleAuthModalProps) {
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [gmail, setGmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Inisialisasi Google Identity Services (One-Tap / Official Button)
  useEffect(() => {
    if (!isOpen) return;

    const setupGoogleGsi = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            setLoading(true);
            setError('');
            try {
              const res = await api.post<AuthResponse>('/auth/google/oauth', {
                credential: response.credential,
              });
              signIn(res.data);
              onClose();
              const requested = searchParams.get('redirect');
              navigate(requested?.startsWith('/') ? requested : '/film');
            } catch (err) {
              setError(getApiError(err, 'Otentikasi dengan akun Google gagal.'));
            } finally {
              setLoading(false);
            }
          },
        });

        // Render tombol Google resmi
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: '100%',
        });
      }
    };

    const timer = setTimeout(setupGoogleGsi, 150);
    return () => clearTimeout(timer);
  }, [isOpen, signIn, onClose, navigate, searchParams]);

  if (!isOpen) return null;

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    const clean = gmail.trim().toLowerCase();
    
    if (!clean.endsWith('@gmail.com') && !clean.endsWith('@googlemail.com')) {
      setError('Hanya alamat email @gmail.com yang dapat digunakan untuk opsi ini.');
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');

    try {
      const res = await api.post<{ success: boolean; message: string }>('/auth/google/request', {
        email: clean,
      });
      setStep('otp');
      setInfo(res.data.message || 'Kode verifikasi dan tautan konfirmasi telah dikirim ke akun Gmail Anda.');
    } catch (err) {
      setError(getApiError(err, 'Gagal mengirim verifikasi ke Gmail. Pastikan alamat email benar.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Masukkan 6-digit kode verifikasi lengkap.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post<AuthResponse>('/auth/google/verify-otp', {
        email: gmail.trim().toLowerCase(),
        otp: otp.trim(),
      });
      signIn(res.data);
      onClose();
      const requested = searchParams.get('redirect');
      navigate(requested?.startsWith('/') ? requested : '/film');
    } catch (err) {
      setError(getApiError(err, 'Kode verifikasi tidak cocok atau telah kedaluwarsa.'));
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('input');
    setOtp('');
    setError('');
    setInfo('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas-base/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-canvas-card border border-border-elevated rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={resetModal}
          className="absolute top-5 right-5 text-text-muted hover:text-text-headline p-1 rounded-xl hover:bg-canvas-elevated transition"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 pb-3 border-b border-border-subtle">
          <div className="w-10 h-10 rounded-2xl bg-canvas-elevated border border-border-elevated flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-text-headline tracking-tight">
              Masuk dengan Akun Google
            </h2>
            <p className="text-[11px] text-text-muted">
              Pilih 1-klik popup resmi atau verifikasi email Gmail
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {info && (
          <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
            <span className="leading-snug">{info}</span>
          </div>
        )}

        {/* 1. OFFICIAL GOOGLE ONE-TAP BUTTON (POP-UP RESMI GOOGLE) */}
        {step === 'input' && (
          <div className="space-y-3">
            <div className="w-full flex justify-center min-h-[44px]">
              <div ref={googleBtnRef} className="w-full flex justify-center" />
            </div>

            <div className="relative flex items-center justify-center pt-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-subtle" />
              </div>
              <span className="relative bg-canvas-card px-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Atau Verifikasi via Inbox Gmail
              </span>
            </div>
          </div>
        )}

        {step === 'input' ? (
          <form onSubmit={handleRequestOtp} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-gold-400" />
                <span>Alamat Akun Gmail Anda</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={gmail}
                  onChange={(e) => {
                    setGmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="contoh: nama.anda@gmail.com"
                  className="w-full bg-canvas-base border border-border-subtle rounded-xl px-3.5 py-2.5 text-xs text-text-headline placeholder-text-disabled focus:outline-none focus:border-gold-500 transition"
                  required
                />
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Kami akan mengirimkan <strong>6-digit kode OTP</strong> dan tombol verifikasi <strong>&quot;Ya, Ini Saya&quot;</strong> langsung ke email Gmail Anda.
              </p>
            </div>

            <div className="bg-canvas-elevated p-3 rounded-xl border border-border-subtle text-[11px] text-text-muted space-y-1">
              <div className="flex items-center space-x-1.5 text-gold-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Pendaftaran:</span>
              </div>
              <p>Jika akun Google Anda belum terdaftar di CineTix, akun member baru akan dibuatkan secara otomatis tanpa perlu mengisi formulir panjang.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 hover:bg-gold-600 text-text-on-gold font-bold text-xs py-3 px-4 rounded-xl transition shadow-sm shadow-gold-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Mengirim ke Gmail...' : 'Kirim Kode & Tautan ke Gmail'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-canvas-elevated border border-border-subtle rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Kode dikirim ke:</span>
                <button
                  type="button"
                  onClick={() => {
                    setStep('input');
                    setOtp('');
                    setError('');
                  }}
                  className="text-gold-400 hover:text-gold-300 text-[11px] font-bold"
                >
                  Ubah Alamat
                </button>
              </div>
              <strong className="text-text-headline font-mono block text-xs">{gmail}</strong>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider text-center">
                Masukkan 6-Digit Kode Verifikasi
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full bg-canvas-base border border-border-subtle text-gold-400 font-mono text-2xl font-bold tracking-[0.5em] text-center rounded-xl py-3 focus:outline-none focus:border-gold-500 transition"
                required
                autoFocus
              />
            </div>

            <div className="p-3 rounded-xl bg-canvas-elevated border border-border-subtle text-center space-y-1">
              <span className="text-[11px] font-bold text-text-headline block">Opsi Verifikasi Instan:</span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Anda juga dapat membuka pesan di Gmail dan mengeklik tombol <strong>&quot;Ya, Ini Saya&quot;</strong> untuk masuk langsung tanpa harus mengetik kode di atas.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-gold-500 hover:bg-gold-600 text-text-on-gold font-bold text-xs py-3 px-4 rounded-xl transition shadow-sm shadow-gold-500/20 disabled:opacity-40"
            >
              {loading ? 'Memvalidasi kode...' : 'Verifikasi & Masuk Sekarang'}
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-border-subtle flex items-center justify-center space-x-2 text-[10px] text-text-disabled">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
          <span>Keamanan Data Terverifikasi Google Cloud OAuth 2.0</span>
        </div>

      </div>
    </div>
  );
}
