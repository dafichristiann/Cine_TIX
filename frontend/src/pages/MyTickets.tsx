import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getApiError } from '../api/axios';
import { EmptyState, ErrorBanner, LoadingState } from '../components/Status';
import { formatCurrency, formatDate } from '../lib/format';
import type { Pemesanan } from '../types';

export default function MyTickets() {
  const [bookings, setBookings] = useState<Pemesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const fetchBookings = () =>
    api.get<Pemesanan[]>('/pemesanan')
      .then((response) => setBookings(response.data))
      .catch((requestError: unknown) => setError(getApiError(requestError)))
      .finally(() => setLoading(false));

  const loadBookings = () => {
    setLoading(true);
    return fetchBookings();
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (id: number) => {
    setProcessingId(id);
    setError('');
    try {
      await api.post(`/pemesanan/${id}/batal`);
      loadBookings();
    } catch (requestError) {
      setError(getApiError(requestError, 'Pesanan gagal dibatalkan.'));
    } finally {
      setProcessingId(null);
    }
  };

  const confirmPayment = async (id: number) => {
    setProcessingId(id);
    setError('');
    try {
      await api.post(`/pembayaran/${id}/simulasi-berhasil`);
      loadBookings();
    } catch (requestError) {
      setError(getApiError(requestError, 'Simulasi pembayaran gagal.'));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="page-content">
      <section className="page-hero compact-hero">
        <div className="container">
          <p className="eyebrow">Akun penonton</p>
          <h1>Tiket Saya</h1>
          <p>Kelola pesanan, batalkan booking pending, dan lihat tiket yang sudah lunas.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {error && <ErrorBanner message={error} />}
          {loading ? <LoadingState label="Memuat riwayat pesanan..." /> : bookings.length ? (
            <div className="ticket-list">
              {bookings.map((booking) => {
                const isPending = booking.status === 'PENDING';
                const canConfirm = isPending && booking.pembayaran?.status === 'PENDING';

                return (
                  <article className="ticket-item" key={booking.id_pemesanan}>
                    <div className="ticket-main">
                      <span className={`status-pill status-${booking.status.toLowerCase()}`}>{booking.status}</span>
                      <h2>{booking.jadwal.film.judul}</h2>
                      <p>{booking.kode_booking}</p>
                      <dl>
                        <div><dt>Tanggal</dt><dd>{formatDate(booking.jadwal.tanggal, { day: 'numeric', month: 'long', year: 'numeric' })}</dd></div>
                        <div><dt>Waktu</dt><dd>{booking.jadwal.jam_mulai}</dd></div>
                        <div><dt>Bioskop</dt><dd>{booking.jadwal.studio.bioskop.nama_bioskop}</dd></div>
                        <div><dt>Total</dt><dd>{formatCurrency(booking.total_harga)}</dd></div>
                      </dl>
                      <div className="selected-seats ticket-seats">
                        <span>Kursi</span>
                        <div>
                          {[...booking.detail]
                            .sort((a, b) => a.slot.kursi.nomor_kursi.localeCompare(b.slot.kursi.nomor_kursi, undefined, { numeric: true, sensitivity: 'base' }))
                            .map((detail) => <strong key={detail.id_detail}>{detail.slot.kursi.nomor_kursi}</strong>)
                          }
                        </div>
                      </div>
                      {booking.status === 'LUNAS' && (
                        <div className="ticket-codes">
                          {booking.detail.map((detail) => <span key={detail.id_detail}>{detail.kode_tiket}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="ticket-actions">
                      {isPending && !booking.pembayaran && <Link className="button button-primary button-block" to={`/checkout/${booking.id_pemesanan}`}>Lanjut bayar</Link>}
                      {canConfirm && <button className="button button-primary button-block" type="button" disabled={processingId === booking.id_pemesanan} onClick={() => confirmPayment(booking.id_pemesanan)}>{processingId === booking.id_pemesanan ? 'Memproses...' : 'Simulasi bayar berhasil'}</button>}
                      {isPending && <button className="button button-secondary button-block" type="button" disabled={processingId === booking.id_pemesanan} onClick={() => cancelBooking(booking.id_pemesanan)}>Batalkan pesanan</button>}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : <EmptyState title="Belum ada tiket" message="Pesanan yang kamu buat akan muncul di sini." />}
        </div>
      </section>
    </div>
  );
}
