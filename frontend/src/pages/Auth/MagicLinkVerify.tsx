import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import api, { getApiError } from '../../api/axios';
import { useAuth } from '../../context/auth';
import type { AuthResponse } from '../../types';

export default function MagicLinkVerify() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!email || !token) {
      setStatus('error');
      setErrorMessage('Tautan verifikasi tidak lengkap. Pastikan Anda mengeklik tautan resmi dari email.');
      return;
    }

    let isMounted = true;

    api.post<AuthResponse>('/auth/google/verify-link', { email, token })
      .then((res) => {
        if (!isMounted) return;
        signIn(res.data);
        setStatus('success');
        setTimeout(() => {
          navigate('/film');
        }, 1800);
      })
      .catch((err) => {
        if (!isMounted) return;
        setStatus('error');
        setErrorMessage(getApiError(err, 'Tautan verifikasi telah kedaluwarsa atau sudah digunakan.'));
      });

    return () => {
      isMounted = false;
    };
  }, [email, token, signIn, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-canvas-card border border-border-subtle rounded-3xl p-8 text-center shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Brand Icon */}
        <div className="w-12 h-12 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 mx-auto font-black text-xl shadow-sm">
          C
        </div>

        {status === 'verifying' && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 text-gold-400 animate-spin mx-auto" />
            <div className="space-y-1">
              <h1 className="text-lg font-bold text-text-headline">Memverifikasi Akun Google Anda</h1>
              <p className="text-xs text-text-muted">
                Memproses konfirmasi <strong className="text-gold-400 font-mono">{email}</strong>...
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-bold text-emerald-400">Verifikasi Berhasil!</h1>
              <p className="text-xs text-text-body">
                Selamat datang di CineTix! Sesi Anda telah aktif dan sedang dialihkan ke katalog film...
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/film"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-gold-400 hover:text-gold-300"
              >
                <span>Buka Katalog Film Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-bold text-rose-400">Verifikasi Gagal</h1>
              <p className="text-xs text-text-muted leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center space-x-1.5 bg-gold-500 hover:bg-gold-600 text-text-on-gold text-xs font-bold py-2.5 px-5 rounded-xl transition shadow-sm"
              >
                <span>Kembali ke Halaman Masuk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
