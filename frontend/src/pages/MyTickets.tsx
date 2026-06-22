import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getApiError } from '../api/axios';
import PosterImage from '../components/PosterImage';
import { EmptyState, ErrorBanner, LoadingState } from '../components/Status';
import { formatDate } from '../lib/format';
import type { Pemesanan } from '../types';

const statusLabels: Record<Pemesanan['status'], string> = {
  PENDING: 'Upcoming',
  LUNAS: 'Completed',
  BATAL: 'Cancelled',
};

const paymentLabels: Record<string, string> = {
  PENDING: 'Menunggu pembayaran',
  BERHASIL: 'Pembayaran berhasil',
  GAGAL: 'Pembayaran gagal',
};

export default function MyTickets() {
  const [bookings, setBookings] = useState<Pemesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Pemesanan['status']>('ALL');

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

  const filteredBookings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return bookings.filter((booking) => {
      const title = booking.jadwal.film.judul.toLowerCase();
      const bookingCode = booking.kode_booking.toLowerCase();
      const bookingDate = booking.jadwal.tanggal.slice(0, 10);
      const matchesQuery = !normalizedQuery || title.includes(normalizedQuery) || bookingCode.includes(normalizedQuery);
      const matchesDate = !selectedDate || bookingDate === selectedDate;
      const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;

      return matchesQuery && matchesDate && matchesStatus;
    });
  }, [bookings, query, selectedDate, statusFilter]);

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
    <div className="booking-history-page">
      <main className="booking-history-main container">
        <div className="booking-history-heading">
          <div>
            <h1>Transaction History</h1>
            <p>View and manage your past and upcoming bookings.</p>
          </div>
          <Link className="button button-primary booking-history-cta" to="/film">
            <span className="material-symbols-outlined">movie</span>
            Pesan tiket
          </Link>
        </div>

        {error && <ErrorBanner message={error} />}

        <section className="booking-history-filters" aria-label="Filter riwayat transaksi">
          <label className="history-search">
            <span className="material-symbols-outlined">search</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by Booking ID or Movie..."
            />
          </label>
          <div className="history-filter-actions">
            <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
            <div className="history-status-tabs" role="group" aria-label="Filter status booking">
              {[
                ['ALL', 'All'],
                ['LUNAS', 'Completed'],
                ['PENDING', 'Upcoming'],
                ['BATAL', 'Cancelled'],
              ].map(([value, label]) => (
                <button
                  className={statusFilter === value ? 'active' : ''}
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value as 'ALL' | Pemesanan['status'])}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading ? <LoadingState label="Memuat riwayat pesanan..." /> : bookings.length ? (
          filteredBookings.length ? (
            <section className="booking-table-card" aria-label="Daftar transaksi">
              <div className="booking-table-scroll">
                <table className="booking-history-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Movie Title</th>
                      <th>Date &amp; Time</th>
                      <th>Status</th>
                      <th className="align-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => {
                      const isPending = booking.status === 'PENDING';
                      const canConfirm = isPending && booking.pembayaran?.status === 'PENDING';
                      const sortedDetails = [...booking.detail].sort((a, b) => (
                        a.slot.kursi.nomor_kursi.localeCompare(b.slot.kursi.nomor_kursi, undefined, { numeric: true, sensitivity: 'base' })
                      ));

                      return (
                        <tr key={booking.id_pemesanan}>
                          <td className="booking-code">{booking.kode_booking}</td>
                          <td>
                            <div className="history-movie">
                              <div className="history-poster">
                                <PosterImage film={booking.jadwal.film} />
                              </div>
                              <div>
                                <strong>{booking.jadwal.film.judul}</strong>
                                <span>{booking.jadwal.studio.bioskop.nama_bioskop}</span>
                              </div>
                            </div>
                          </td>
                          <td className="muted-cell">
                            {formatDate(booking.jadwal.tanggal, { day: 'numeric', month: 'short', year: 'numeric' })}
                            <br />
                            <span>{booking.jadwal.jam_mulai}</span>
                          </td>
                          <td>
                            <span className={`history-status status-${booking.status.toLowerCase()}`}>
                              {statusLabels[booking.status]}
                            </span>
                            {booking.pembayaran && <small className="payment-note">{paymentLabels[booking.pembayaran.status]}</small>}
                          </td>
                          <td className="align-right">
                            <div className="history-actions">
                              {isPending && !booking.pembayaran && (
                                <Link className="history-detail-link" to={`/checkout/${booking.id_pemesanan}`}>
                                  Lanjut bayar <span className="material-symbols-outlined">chevron_right</span>
                                </Link>
                              )}
                              {canConfirm && (
                                <button className="history-detail-link" type="button" disabled={processingId === booking.id_pemesanan} onClick={() => confirmPayment(booking.id_pemesanan)}>
                                  {processingId === booking.id_pemesanan ? 'Memproses...' : 'Konfirmasi'} <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                              )}
                              {isPending && (
                                <button className="history-detail-link danger" type="button" disabled={processingId === booking.id_pemesanan} onClick={() => cancelBooking(booking.id_pemesanan)}>
                                  Batalkan <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                              )}
                              {booking.status === 'LUNAS' && (
                                <details className="ticket-code-menu">
                                  <summary className="history-detail-link" title="Lihat kode tiket" aria-label="Lihat kode tiket">
                                    View Detail <span className="material-symbols-outlined">chevron_right</span>
                                  </summary>
                                  <div>
                                    {sortedDetails.map((detail) => <span key={detail.id_detail}>{detail.kode_tiket}</span>)}
                                  </div>
                                </details>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="history-pagination">
                <span>Showing 1 to {filteredBookings.length} of {bookings.length} results</span>
                <div>
                  <button type="button" disabled aria-label="Halaman sebelumnya"><span className="material-symbols-outlined">chevron_left</span></button>
                  <button className="active" type="button">1</button>
                  <button type="button" aria-label="Halaman berikutnya"><span className="material-symbols-outlined">chevron_right</span></button>
                </div>
              </div>
            </section>
          ) : <EmptyState title="Tidak ada hasil" message="Coba ubah kata kunci, tanggal, atau status filter." />
        ) : <EmptyState title="Belum ada tiket" message="Pesanan yang kamu buat akan muncul di sini." />}
      </main>

      <nav className="booking-bottom-nav" aria-label="Navigasi cepat">
        <Link to="/"><span className="material-symbols-outlined">home</span><small>Home</small></Link>
        <Link to="/film"><span className="material-symbols-outlined">movie</span><small>Movies</small></Link>
        <Link className="active" to="/tiket-saya"><span className="material-symbols-outlined">confirmation_number</span><small>Bookings</small></Link>
        <Link to="/#cara-pesan"><span className="material-symbols-outlined">help</span><small>Help</small></Link>
      </nav>
    </div>
  );
}
