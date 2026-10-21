import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  QrCode, 
  Building2, 
  CreditCard, 
  Tag, 
  Plus, 
  Minus, 
  UtensilsCrossed, 
  CheckCircle2, 
  ShieldCheck,
  Check
} from 'lucide-react';
import api, { getApiError } from '../api/axios';
import { ErrorBanner, LoadingState } from '../components/Status';
import { formatCurrency, formatDate } from '../lib/format';
import type { Pembayaran, Pemesanan } from '../types';

interface ConcessionItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
}

interface PromoResult {
  valid: boolean;
  discount: number;
  finalTotal: number;
  message: string;
}

const paymentChannels = [
  { id: 'QRIS', label: 'QRIS Digital Pay', description: 'Scan instan via GoPay, BCA, Livin, OVO, atau ShopeePay', icon: QrCode },
  { id: 'VIRTUAL_ACCOUNT', label: 'Virtual Account', description: 'Transfer kode unik Bank BCA, Mandiri, BRI, atau BNI', icon: Building2 },
  { id: 'E_WALLET', label: 'Kartu Debit / Kredit', description: 'Transaksi aman dengan proteksi 3D Secure & OTP', icon: CreditCard },
];

export default function Checkout() {
  const { id_pemesanan } = useParams();
  const [booking, setBooking] = useState<Pemesanan | null>(null);
  const [method, setMethod] = useState('QRIS');
  const [payment, setPayment] = useState<Pembayaran | null>(null);
  const [remaining, setRemaining] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Concessions & Promo State
  const [concessions, setConcessions] = useState<ConcessionItem[]>([]);
  const [cartConcessions, setCartConcessions] = useState<Record<string, number>>({});
  const [promoCode, setPromoCode] = useState('');
  const [promoSuccess, setPromoSuccess] = useState<PromoResult | null>(null);
  const [promoError, setPromoError] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Pemesanan>(`/pemesanan/${id_pemesanan}`),
      api.get<ConcessionItem[]>('/cinema-features/concessions').catch(() => ({ data: [] })),
    ])
      .then(([bookingRes, concRes]) => {
        setBooking(bookingRes.data);
        setPayment(bookingRes.data.pembayaran);
        setConcessions(concRes.data);
      })
      .catch((requestError: unknown) => setError(getApiError(requestError)))
      .finally(() => setLoading(false));
  }, [id_pemesanan]);

  useEffect(() => {
    if (!booking) return;
    const updateTimer = () => {
      const difference = Math.max(0, new Date(booking.expired_at).getTime() - Date.now());
      const minutes = Math.floor(difference / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((difference % 60000) / 1000).toString().padStart(2, '0');
      setRemaining(`${minutes}:${seconds}`);
    };
    updateTimer();
    const timer = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(timer);
  }, [booking]);

  const updateConcessionQty = (id: string, delta: number) => {
    setCartConcessions((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const ticketSubtotal = Number(booking?.total_harga || 0);

  const concessionSubtotal = Object.entries(cartConcessions).reduce((sum, [id, qty]) => {
    const item = concessions.find((c) => c.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const discountAmount = promoSuccess?.discount || 0;
  const rawTotal = ticketSubtotal + concessionSubtotal;
  const grandTotal = Math.max(0, rawTotal - discountAmount);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setValidatingPromo(true);
    setPromoError('');
    setPromoSuccess(null);

    try {
      const res = await api.post<PromoResult>('/cinema-features/promo/validate', {
        code: promoCode,
        subtotal: rawTotal,
      });

      if (res.data.valid) {
        setPromoSuccess(res.data);
      } else {
        setPromoError(res.data.message || 'Kode voucher tidak valid.');
      }
    } catch (err) {
      setPromoError(getApiError(err, 'Gagal memvalidasi kode promo.'));
    } finally {
      setValidatingPromo(false);
    }
  };

  const processPayment = async () => {
    if (!booking) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await api.post<Pembayaran>('/pembayaran', {
        id_pemesanan: booking.id_pemesanan,
        metode: method,
      });
      setPayment(response.data);
    } catch (requestError) {
      setError(getApiError(requestError, 'Pembayaran gagal diproses.'));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmPayment = async () => {
    if (!booking) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/pembayaran/${booking.id_pemesanan}/simulasi-berhasil`);
      const bookingResponse = await api.get<Pemesanan>(`/pemesanan/${booking.id_pemesanan}`);
      setBooking(bookingResponse.data);
      setPayment(bookingResponse.data.pembayaran);
    } catch (requestError) {
      setError(getApiError(requestError, 'Simulasi pembayaran gagal.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingState label="Menyiapkan invoice pemesanan..." />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto mt-10">
        <ErrorBanner message={error || 'Pesanan tidak ditemukan.'} />
      </div>
    );
  }

  const isExpired = remaining === '00:00';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <Link 
          className="inline-flex items-center space-x-2 text-xs font-semibold text-gold-400 hover:text-gold-300 transition" 
          to={`/kursi/${booking.jadwal.id_jadwal}`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Denah Kursi</span>
        </Link>
        <div className="text-left sm:text-right">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase block">Tahap 3 dari 3</span>
          <strong className="text-sm font-bold text-text-headline">Pembayaran & F&B Concessions</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 2. KOLOM KIRI (METODE PEMBAYARAN & F&B) */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Header Status & Countdown */}
          <div className="bg-canvas-card border border-border-subtle rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-border-subtle pb-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-widest text-gold-400 uppercase">Proses Check-out</p>
                <h1 className="text-xl sm:text-2xl font-bold text-text-headline tracking-tight">Selesaikan Pembayaran</h1>
                <p className="text-xs text-text-muted">
                  Kode Transaksi: <span className="font-mono text-gold-400 font-bold">{booking.kode_booking}</span>
                </p>
              </div>

              <div className="bg-canvas-base border border-border-subtle rounded-xl px-4 py-2 flex items-center space-x-2.5 shrink-0 w-max">
                <Clock className="w-4 h-4 text-text-muted" />
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Sisa Waktu:</span>
                <strong className={`font-mono text-sm font-bold ${isExpired ? 'text-rose-500 animate-pulse' : 'text-gold-400'}`}>
                  {remaining || '--:--'}
                </strong>
              </div>
            </div>

            {error && <ErrorBanner message={error} />}

            {/* STATUS INVOICE SUDAH TERBIT */}
            {payment ? (
              <div className="bg-canvas-base border border-border-subtle rounded-2xl p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 mx-auto shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                
                <div className="space-y-1 max-w-md mx-auto">
                  <h2 className="text-base font-bold text-text-headline">
                    {payment.status === 'BERHASIL' ? 'Pembayaran Berhasil Dikonfirmasi' : 'Tagihan Pembayaran Diterbitkan'}
                  </h2>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Metode: <strong className="text-gold-400">{payment.metode}</strong> sejumlah{' '}
                    <strong className="text-text-headline font-mono">{formatCurrency(payment.jumlah)}</strong>.
                  </p>
                </div>

                <div className="bg-canvas-card border border-border-subtle rounded-xl px-4 py-2.5 max-w-xs mx-auto flex items-center justify-between text-xs font-semibold">
                  <span className="text-text-muted">Status Pembayaran:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    payment.status === 'BERHASIL' 
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                      : 'bg-gold-500/15 border-gold-500/30 text-gold-400'
                  }`}>
                    {payment.status}
                  </span>
                </div>

                {payment.status === 'PENDING' && (
                  <div className="pt-3 border-t border-border-subtle max-w-md mx-auto space-y-3">
                    <p className="text-[11px] text-text-muted leading-normal">
                      Simulasi Pembayaran: Klik tombol di bawah untuk menyimulasikan konfirmasi pembayaran sukses dan penerbitan tiket via SMTP email.
                    </p>
                    <button 
                      type="button" 
                      disabled={submitting || isExpired} 
                      onClick={confirmPayment}
                      className="w-full bg-gold-500 hover:bg-gold-600 text-text-on-gold font-bold text-xs py-3 px-4 rounded-xl transition shadow-sm shadow-gold-500/20 disabled:opacity-40"
                    >
                      {submitting ? 'Memproses simulasi...' : 'Simulasi Pembayaran Berhasil'}
                    </button>
                  </div>
                )}

                {payment.status === 'BERHASIL' && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 max-w-md mx-auto leading-relaxed">
                    E-tiket resmi beserta QR Code digital telah diterbitkan dan dikirimkan via SMTP ke email akun Anda.
                  </div>
                )}

                <div className="pt-2">
                  <Link 
                    className="inline-flex bg-canvas-elevated hover:bg-canvas-floating text-text-headline font-semibold text-xs py-2.5 px-5 rounded-xl border border-border-elevated transition" 
                    to="/tiket-saya"
                  >
                    Buka E-Tiket Saya
                  </Link>
                </div>
              </div>
            ) : (
              /* PILIHAN METODE PEMBAYARAN */
              <div className="space-y-3">
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Metode Pembayaran Digital</p>
                {paymentChannels.map((item) => {
                  const Icon = item.icon;
                  const isSelected = method === item.id;
                  return (
                    <label 
                      key={item.id}
                      className={`
                        flex items-center justify-between p-3.5 rounded-xl border cursor-pointer select-none transition duration-150
                        ${isSelected 
                          ? 'bg-gold-500/10 border-gold-500/50 text-text-headline' 
                          : 'bg-canvas-base border-border-subtle text-text-body hover:border-border-elevated'}
                      `}
                    >
                      <div className="flex items-center space-x-3.5">
                        <input 
                          type="radio" 
                          name="payment" 
                          value={item.id} 
                          checked={isSelected} 
                          onChange={() => setMethod(item.id)} 
                          className="sr-only" 
                        />
                        <div className="w-8 h-8 bg-canvas-elevated border border-border-elevated flex items-center justify-center rounded-lg text-gold-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="block text-xs font-semibold text-text-headline">{item.label}</strong>
                          <small className="block text-[11px] text-text-muted mt-0.5">{item.description}</small>
                        </div>
                      </div>
                      
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                        isSelected ? 'border-gold-400' : 'border-border-elevated'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-gold-400" />}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* F&B CONCESSIONS ADD-ON SECTION (HANYA MUNCUL SEBELUM PAYMENT SELESAI) */}
          {!payment && concessions.length > 0 && (
            <div className="bg-canvas-card border border-border-subtle rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div className="flex items-center space-x-2">
                  <UtensilsCrossed className="w-4 h-4 text-gold-400" />
                  <div>
                    <h2 className="text-xs font-bold text-text-headline tracking-wide uppercase">CineTix Concessions (F&B)</h2>
                    <p className="text-[11px] text-text-muted">Tambahkan camilan bioskop langsung ke pesanan Anda</p>
                  </div>
                </div>
                <span className="text-[10px] text-text-muted uppercase tracking-widest font-mono">
                  Pick-up di Counter
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {concessions.map((item) => {
                  const qty = cartConcessions[item.id] || 0;
                  return (
                    <div 
                      key={item.id} 
                      className="bg-canvas-elevated border border-border-subtle rounded-2xl p-3 flex flex-col justify-between hover:border-border-elevated transition"
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-xs font-bold text-text-headline">{item.name}</h3>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-canvas-base border border-border-subtle text-text-muted uppercase">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">{item.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-border-subtle">
                        <strong className="text-xs font-bold text-gold-400 font-mono">
                          {formatCurrency(item.price)}
                        </strong>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => updateConcessionQty(item.id, -1)}
                            disabled={qty === 0}
                            className="w-6 h-6 rounded-lg bg-canvas-base border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-headline disabled:opacity-30 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold font-mono text-text-headline">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateConcessionQty(item.id, 1)}
                            className="w-6 h-6 rounded-lg bg-gold-500 hover:bg-gold-600 text-text-on-gold flex items-center justify-center transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </section>

        {/* 3. KOLOM KANAN (RINGKASAN BILLING, PROMO, TOTAL) */}
        <aside className="lg:col-span-4 bg-canvas-card border border-border-subtle rounded-3xl p-6 shadow-xl space-y-6 sticky top-24">
          <div className="border-b border-border-subtle pb-3">
            <p className="text-[10px] font-bold tracking-widest text-gold-400 uppercase">Rincian Tiket</p>
            <h2 className="text-base font-bold text-text-headline truncate mt-0.5">{booking.jadwal.film.judul}</h2>
          </div>

          <dl className="space-y-2.5 text-xs border-b border-border-subtle pb-4">
            <div className="flex justify-between">
              <dt className="text-text-muted">Tanggal</dt>
              <dd className="text-text-body font-medium">
                {formatDate(booking.jadwal.tanggal, { day: 'numeric', month: 'short', year: 'numeric' })}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Jam Tayang</dt>
              <dd className="text-text-headline font-mono font-bold">{booking.jadwal.jam_mulai}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Bioskop</dt>
              <dd className="text-text-body">{booking.jadwal.studio.bioskop.nama_bioskop}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Studio</dt>
              <dd className="text-text-body font-mono">{booking.jadwal.studio.nama_studio}</dd>
            </div>
          </dl>

          {/* Kursi Terpilih */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-medium text-text-muted uppercase tracking-wider">Kursi ({booking.detail.length})</span>
            <div className="flex flex-wrap gap-1">
              {booking.detail.map((detail) => (
                <strong key={detail.id_detail} className="text-xs font-mono font-bold bg-canvas-base border border-border-subtle text-gold-400 px-2 py-0.5 rounded-lg">
                  {detail.slot.kursi.nomor_kursi}
                </strong>
              ))}
            </div>
          </div>

          {/* VOUCHER / PROMO INPUT (HANYA SEBELUM PAYMENT) */}
          {!payment && (
            <div className="space-y-2 pt-2 border-t border-border-subtle">
              <div className="flex items-center space-x-1.5 text-text-muted text-xs font-medium">
                <Tag className="w-3.5 h-3.5 text-gold-400" />
                <span>Kode Voucher / Promo</span>
              </div>
              
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={promoCode} 
                  onChange={(e) => setPromoCode(e.target.value)} 
                  placeholder="Contoh: CINETIX10" 
                  className="w-full bg-canvas-base border border-border-subtle rounded-xl px-3 py-2 text-xs uppercase font-mono text-gold-400 placeholder-text-disabled focus:outline-none focus:border-gold-500 transition"
                />
                <button
                  type="button"
                  disabled={validatingPromo || !promoCode}
                  onClick={handleApplyPromo}
                  className="bg-gold-500 hover:bg-gold-600 text-text-on-gold text-xs font-bold px-3 py-2 rounded-xl transition disabled:opacity-40 shrink-0"
                >
                  {validatingPromo ? 'Cek...' : 'Terapkan'}
                </button>
              </div>

              {promoSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{promoSuccess.message} (-{formatCurrency(discountAmount)})</span>
                </div>
              )}

              {promoError && (
                <p className="text-[11px] text-rose-400">{promoError}</p>
              )}
            </div>
          )}

          {/* RINCIAN HARGA TOTAL */}
          <div className="space-y-2 border-t border-border-subtle pt-4 text-xs">
            <div className="flex justify-between text-text-muted">
              <span>Subtotal Tiket</span>
              <span className="font-mono text-text-headline">{formatCurrency(ticketSubtotal)}</span>
            </div>

            {concessionSubtotal > 0 && (
              <div className="flex justify-between text-text-muted">
                <span>Add-on F&B (Snack & Minum)</span>
                <span className="font-mono text-text-headline">+{formatCurrency(concessionSubtotal)}</span>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Diskon Promo Voucher</span>
                <span className="font-mono">-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-text-muted">
              <span>Biaya Layanan</span>
              <span className="font-mono text-emerald-400 font-semibold">Gratis</span>
            </div>
          </div>

          <div className="border-t border-border-subtle pt-4 flex items-baseline justify-between">
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Total Pembayaran</span>
            <span className="text-xl font-black text-gold-400 font-mono">
              {formatCurrency(payment ? Number(payment.jumlah) : grandTotal)}
            </span>
          </div>

          {!payment ? (
            <button
              type="button"
              disabled={submitting || isExpired}
              onClick={processPayment}
              className="w-full bg-gold-500 hover:bg-gold-600 text-text-on-gold font-bold text-xs py-3.5 px-4 rounded-xl disabled:opacity-50 transition shadow-sm shadow-gold-500/20 flex items-center justify-center space-x-2"
            >
              <span>{submitting ? 'Memproses Pesanan...' : 'Bayar Sekarang'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="bg-canvas-base border border-border-subtle rounded-xl p-3 flex items-center space-x-2.5 text-xs text-text-muted">
              <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
              <span>Transaksi aman terenkripsi 256-bit TLS</span>
            </div>
          )}

        </aside>

      </div>
    </div>
  );
}
