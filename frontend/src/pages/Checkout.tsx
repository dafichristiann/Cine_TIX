import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getApiError } from '../api/axios';
import { ErrorBanner, LoadingState } from '../components/Status';
import { formatCurrency, formatDate } from '../lib/format';
import type { Pembayaran, Pemesanan } from '../types';

const paymentMethods = [
  { id: 'QRIS', label: 'QRIS', description: 'Scan dengan aplikasi pembayaran', icon: 'QR' },
  { id: 'VIRTUAL_ACCOUNT', label: 'Virtual Account', description: 'BCA, BRI, BNI, Mandiri', icon: 'VA' },
  { id: 'E_WALLET', label: 'E-Wallet', description: 'GoPay, OVO, DANA, ShopeePay', icon: 'EW' },
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
    } catch (requestError) {
      setError(getApiError(requestError, 'Pembayaran gagal dibuat.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container page-loader"><LoadingState label="Menyiapkan checkout..." /></div>;
  if (!booking) return <div className="container page-loader"><ErrorBanner message={error || 'Pesanan tidak ditemukan.'} /></div>;

  return (
    <div className="booking-page checkout-page">
      <div className="container booking-header"><Link className="back-link" to={`/kursi/${booking.jadwal.id_jadwal}`}>← Kembali</Link><div><span>Langkah 3 dari 3</span><strong>Pembayaran</strong></div></div>
      <div className="container checkout-layout">
        <section className="payment-panel">
          <div className="checkout-heading"><p className="eyebrow">Selesaikan pesanan</p><h1>Pilih metode pembayaran</h1><p>Pesanan <strong>{booking.kode_booking}</strong> akan kedaluwarsa dalam <span className="countdown">{remaining || '--:--'}</span></p></div>
          {error && <ErrorBanner message={error} />}
          {payment ? (
            <div className="payment-created"><span className="success-mark">✓</span><h2>Pembayaran berhasil dibuat</h2><p>Gunakan metode <strong>{payment.metode}</strong> untuk menyelesaikan pembayaran sebesar <strong>{formatCurrency(payment.jumlah)}</strong>.</p><div className="payment-status">Status pembayaran <span>{payment.status}</span></div><small>Integrasikan payment gateway pada webhook backend untuk mengubah status menjadi BERHASIL secara otomatis.</small><Link className="button button-secondary" to="/film">Cari film lainnya</Link></div>
          ) : (
            <div className="payment-methods">{paymentMethods.map((item) => (
              <label className={method === item.id ? 'payment-option active' : 'payment-option'} key={item.id}><input type="radio" name="payment" value={item.id} checked={method === item.id} onChange={() => setMethod(item.id)} /><span className="payment-icon">{item.icon}</span><span><strong>{item.label}</strong><small>{item.description}</small></span><i /></label>
            ))}</div>
          )}
        </section>
        <aside className="booking-summary checkout-summary">
          <p className="eyebrow">Detail tiket</p><h2>{booking.jadwal.film.judul}</h2><dl><div><dt>Tanggal</dt><dd>{formatDate(booking.jadwal.tanggal, { day: 'numeric', month: 'short', year: 'numeric' })}</dd></div><div><dt>Waktu</dt><dd>{booking.jadwal.jam_mulai}</dd></div><div><dt>Bioskop</dt><dd>{booking.jadwal.studio.bioskop.nama_bioskop}</dd></div><div><dt>Studio</dt><dd>{booking.jadwal.studio.nama_studio}</dd></div></dl>
          <div className="selected-seats"><span>Kursi</span><div>{booking.detail.map((detail) => <strong key={detail.id_detail}>{detail.slot.kursi.nomor_kursi}</strong>)}</div></div>
          <div className="price-breakdown"><div><span>Subtotal ({booking.jumlah_tiket} tiket)</span><strong>{formatCurrency(booking.total_harga)}</strong></div><div><span>Biaya layanan</span><strong>Rp0</strong></div></div><div className="checkout-total"><span>Total pembayaran</span><strong>{formatCurrency(booking.total_harga)}</strong></div>
          {!payment && <button className="button button-primary button-block" type="button" disabled={submitting || remaining === '00:00'} onClick={createPayment}>{submitting ? 'Memproses...' : `Bayar ${formatCurrency(booking.total_harga)}`}</button>}
          <small className="summary-note">Pembayaran diproses dengan koneksi yang aman.</small>
        </aside>
      </div>
    </div>
  );
}
