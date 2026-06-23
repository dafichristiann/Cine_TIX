import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getApiError } from '../api/axios';
import { ErrorBanner, LoadingState } from '../components/Status';
import { formatCurrency, formatDate } from '../lib/format';
import type { Pembayaran, Pemesanan } from '../types';

const paymentMethods = [
  { id: 'QRIS', label: 'QRIS', description: 'Scan cepat dengan aplikasi pembayaran digital', icon: '📱' },
  { id: 'VIRTUAL_ACCOUNT', label: 'Virtual Account', description: 'Transfer via Bank BCA, BRI, BNI, atau Mandiri', icon: '🏦' },
  { id: 'E_WALLET', label: 'E-Wallet', description: 'Bayar instan via GoPay, OVO, DANA, ShopeePay', icon: '💳' },
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

  useEffect(() => {
    api.get<Pemesanan>(`/pemesanan/${id_pemesanan}`)
      .then((response) => { setBooking(response.data); setPayment(response.data.pembayaran); })
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

  const createPayment = async () => {
    if (!booking) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await api.post<Pembayaran>('/pembayaran', { id_pemesanan: booking.id_pemesanan, metode: method });
      setPayment(response.data);
      const bookingResponse = await api.get<Pemesanan>(`/pemesanan/${booking.id_pemesanan}`);
      setBooking(bookingResponse.data);
    } catch (requestError) {
      setError(getApiError(requestError, 'Pembayaran gagal dibuat.'));
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

  if (loading) return <div className="min-h-[70vh] flex items-center justify-center"><LoadingState label="Menyiapkan invoice checkout..." /></div>;
  if (!booking) return <div className="max-w-xl mx-auto mt-10"><ErrorBanner message={error || 'Pesanan tidak ditemukan.'} /></div>;

  const isExpired = remaining === '00:00';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER LANGKAH NAVIGASI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <Link className="inline-flex items-center space-x-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition" to={`/kursi/${booking.jadwal.id_jadwal}`}>
          <span>{"<-"}</span> <span>Kembali ke Denah Kursi</span>
        </Link>
        <div className="text-left sm:text-right">
          <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">Langkah 3 dari 3</span>
          <strong className="text-base font-extrabold text-white">Konfirmasi Pembayaran</strong>
        </div>
      </div>

      {/* CORE DISPLAY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PANEL METODE (KILI) */}
        <section className="lg:col-span-8 bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-lg space-y-8">
          
          {/* Header Billing Info */}
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">Selesaikan Pesanan</p>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Pilih Metode Pembayaran</h1>
              <p className="text-xs text-slate-400">Kode Booking: <span className="font-mono text-slate-200 font-bold">{booking.kode_booking}</span></p>
            </div>
            {/* Timer Countdown Panel */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2 flex items-center space-x-2.5 shrink-0 w-max">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sisa Waktu:</span>
              <strong className={`font-mono text-base font-black ${isExpired ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                {remaining || '--:--'}
              </strong>
            </div>
          </div>

          {error && <ErrorBanner message={error} />}

          {/* KONDISI A: JIKA STRUK PEMBAYARAN SUDAH TER-GENERATE */}
          {payment ? (
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto font-black text-lg shadow-md">
                ✓
              </div>
              
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white">
                  {payment.status === 'BERHASIL' ? '🎉 Pembayaran Berhasil Confirmed' : '🧾 Invoice Pembayaran Dibuat'}
                </h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Gunakan jalur transfer <strong className="text-teal-400">{payment.metode}</strong> untuk menyelesaikan tagihan sebesar <strong className="text-white font-mono">{formatCurrency(payment.jumlah)}</strong>.
                </p>
              </div>

              {/* Status Indicator Bar */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-xl px-4 py-3 max-w-xs mx-auto flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Status Gateway:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                  payment.status === 'BERHASIL' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}>
                  {payment.status}
                </span>
              </div>

              {payment.status === 'PENDING' && (
                <div className="pt-2 border-t border-slate-800/60 max-w-md mx-auto space-y-3">
                  <p className="text-[10px] text-slate-500 leading-normal">
                    💡 Mode Pengembangan: Gunakan tombol simulasi bypass di bawah untuk mengubah status transaksi menjadi sukses secara instan.
                  </p>
                  <button 
                    type="button" 
                    disabled={submitting || isExpired} 
                    onClick={confirmPayment}
                    className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs py-3 px-4 rounded-xl transition shadow-lg shadow-teal-500/5 focus:outline-none disabled:opacity-40"
                  >
                    {submitting ? 'Menyelaraskan data...' : 'Simulasi Pembayaran Sukses'}
                  </button>
                </div>
              )}

              <div className="pt-2">
                <Link className="inline-flex bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 px-5 rounded-xl border border-slate-700/60 transition" to="/tiket-saya">
                  Lihat Tiket Saya
                </Link>
              </div>
            </div>
          ) : (
            /* KONDISI B: PILIHAN CHANNEL PAYMENT */
            <div className="space-y-3">
              {paymentMethods.map((item) => {
                const isSelected = method === item.id;
                return (
                  <label 
                    key={item.id}
                    className={`
                      flex items-center justify-between p-4 rounded-xl border cursor-pointer select-none transition duration-150
                      ${isSelected 
                        ? 'bg-gradient-to-r from-teal-500/5 to-transparent border-teal-500 text-white' 
                        : 'bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-700'}
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <input 
                        type="radio" 
                        name="payment" 
                        value={item.id} 
                        checked={isSelected} 
                        onChange={() => setMethod(item.id)} 
                        className="sr-only" // Sembunyikan radio default bawaan HTML
                      />
                      <div className="w-9 h-9 bg-slate-900 border border-slate-800 flex items-center justify-center rounded-lg text-lg shadow-inner">
                        {item.icon}
                      </div>
                      <div>
                        <strong className="block text-sm font-semibold text-slate-200">{item.label}</strong>
                        <small className="block text-xs text-slate-500 mt-0.5">{item.description}</small>
                      </div>
                    </div>
                    {/* Lingkaran Custom Radio */}
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                      isSelected ? 'border-teal-500' : 'border-slate-700'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </section>

        {/* ASIDE PANEL: RINGKASAN DATA TIKET (KANAN) */}
        <aside className="lg:col-span-4 bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-lg space-y-6 sticky top-24">
          <div>
            <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">Detail Tiket</p>
            <h2 className="text-lg font-extrabold text-white truncate mt-0.5">{booking.jadwal.film.judul}</h2>
          </div>

          {/* Rincian Operasional */}
          <dl className="space-y-3 text-xs border-y border-slate-800 py-4">
            <div className="flex justify-between"><dt className="text-slate-500 font-medium">Tanggal</dt><dd className="text-slate-200 font-semibold">{formatDate(booking.jadwal.tanggal, { day: 'numeric', month: 'short', year: 'numeric' })}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 font-medium">Jam Masuk</dt><dd className="text-slate-200 font-semibold font-mono">🕒 {booking.jadwal.jam_mulai}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 font-medium">Bioskop</dt><dd className="text-slate-200 font-semibold">{booking.jadwal.studio.bioskop.nama_bioskop}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 font-medium">Studio</dt><dd className="text-slate-200 font-semibold">{booking.jadwal.studio.nama_studio}</dd></div>
          </dl>

          {/* Kursi Terpilih (Pills Style) */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Nomor Kursi</span>
            <div className="flex flex-wrap gap-1">
              {booking.detail.map((detail) => (
                <strong key={detail.id_detail} className="text-xs font-bold font-mono bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-0.5 rounded-md">
                  {detail.slot.kursi.nomor_kursi}
                </strong>
              ))}
            </div>
          </div>

          {/* Breakdown Perhitungan Tagihan */}
          <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800 pt-4">
            <div className="flex justify-between">
              <span>Subtotal ({booking.jumlah_tiket} tiket)</span>
              <span className="font-mono text-slate-300">{formatCurrency(booking.total_harga)}</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Layanan Aplikasi</span>
              <span className="font-mono text-emerald-400">Rp0 (FREE)</span>
            </div>
          </div>

          {/* Akumulasi Total Pembayaran Akhir */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total Pembayaran</span>
            <strong className="text-xl font-black text-teal-400 font-mono tracking-tight">
              {formatCurrency(booking.total_harga)}
            </strong>
          </div>

          {/* Tombol Eksekusi Post Utama */}
          {!payment && (
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={submitting || isExpired}
                onClick={createPayment}
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm py-3 px-4 rounded-xl disabled:opacity-40 transition shadow-lg shadow-teal-500/5 flex items-center justify-center space-x-2 focus:outline-none"
              >
                <span>{submitting ? 'Membuat Invoice...' : `Bayar ${formatCurrency(booking.total_harga)}`}</span>
              </button>
              <small className="block text-[10px] text-slate-500 leading-normal text-center">
                🔒 Pembayaran diproses menggunakan enkripsi SSL Gateway yang aman.
              </small>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
}