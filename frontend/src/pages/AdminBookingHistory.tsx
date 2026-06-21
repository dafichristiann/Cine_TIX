import { useEffect, useState, useMemo, useCallback } from 'react';
import api, { getApiError } from '../api/axios';
import { ErrorBanner, LoadingState, EmptyState } from '../components/Status';
import { formatCurrency, formatDate } from '../lib/format';
import type { PemesananAdmin } from '../types';

const SEARCH_DEBOUNCE_MS = 400;

export default function AdminBookingHistory() {
  const [bookings, setBookings] = useState<PemesananAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadBookings = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'ALL') params.append('status', statusFilter);
        if (searchQuery) params.append('search', searchQuery);

        const response = await api.get<PemesananAdmin[]>(
          `/pemesanan/admin/all?${params.toString()}`,
          { signal }
        );
        setBookings(response.data);
      } catch (requestError) {
        // Abaikan error akibat request yang sengaja dibatalkan (request lama
        // yang ditimpa oleh request baru saat user masih mengetik)
        if (signal?.aborted) return;
        setError(getApiError(requestError));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [statusFilter, searchQuery]
  );

  useEffect(() => {
    const controller = new AbortController();

    // Debounce: tunggu user berhenti mengetik sebelum menembak request,
    // supaya tidak ada request baru untuk tiap huruf yang diketik
    const timer = setTimeout(() => {
      loadBookings(controller.signal);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadBookings]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const lunas = bookings.filter((b) => b.status === 'LUNAS').length;
    const pending = bookings.filter((b) => b.status === 'PENDING').length;
    const batal = bookings.filter((b) => b.status === 'BATAL').length;
    const totalRevenue = bookings
      .filter((b) => b.status === 'LUNAS')
      .reduce((sum, b) => sum + Number(b.total_harga), 0);

    return { total, lunas, pending, batal, totalRevenue };
  }, [bookings]);

  return (
    <div className="admin-workspace-stacked">
      <div className="admin-panel admin-form">
        <h2>Filter Riwayat Pemesanan</h2>

        {error && <ErrorBanner message={error} />}

        <label>
          Status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">Semua</option>
            <option value="PENDING">Pending</option>
            <option value="LUNAS">Lunas</option>
            <option value="BATAL">Batal</option>
          </select>
        </label>

        <label>
          Cari (nama, email, kode booking, film)
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik untuk cari..."
          />
        </label>

        <div className="admin-stats" style={{ marginTop: '20px' }}>
          <article>
            <span>Total Pesanan</span>
            <strong>{stats.total}</strong>
          </article>
          <article>
            <span>Lunas</span>
            <strong>{stats.lunas}</strong>
          </article>
          <article>
            <span>Pending</span>
            <strong>{stats.pending}</strong>
          </article>
          <article>
            <span>Total Pendapatan</span>
            <strong>{formatCurrency(stats.totalRevenue)}</strong>
          </article>
        </div>
      </div>

      <div className="admin-panel admin-list">
        <h2>Daftar Pemesanan</h2>

        {loading ? (
          <LoadingState label="Memuat riwayat pemesanan..." />
        ) : bookings.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '16%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '13%' }} />
              </colgroup>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '12px 10px', fontSize: '0.85rem' }}>Kode Booking</th>
                  <th style={{ textAlign: 'left', padding: '12px 10px', fontSize: '0.85rem' }}>Pengguna</th>
                  <th style={{ textAlign: 'left', padding: '12px 10px', fontSize: '0.85rem' }}>Film</th>
                  <th style={{ textAlign: 'left', padding: '12px 10px', fontSize: '0.85rem' }}>Tanggal</th>
                  <th style={{ textAlign: 'left', padding: '12px 10px', fontSize: '0.85rem' }}>Total</th>
                  <th style={{ textAlign: 'left', padding: '12px 10px', fontSize: '0.85rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id_pemesanan} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                      <strong style={{ fontSize: '0.85rem', wordBreak: 'break-word' }}>
                        {booking.kode_booking}
                      </strong>
                    </td>
                    <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                      <div>
                        <strong style={{ fontSize: '0.85rem' }}>
                          {booking.pengguna?.nama ?? '-'}
                        </strong>
                        <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '2px' }}>
                          {booking.pengguna?.email ?? '-'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', fontSize: '0.85rem', verticalAlign: 'top' }}>
                      {booking.jadwal?.film?.judul ?? '-'}
                      <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '2px' }}>
                        {booking.jadwal?.studio?.bioskop?.nama_bioskop ?? '-'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', fontSize: '0.85rem', verticalAlign: 'top' }}>
                      {booking.jadwal?.tanggal ? formatDate(booking.jadwal.tanggal) : '-'}
                      <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '2px' }}>
                        {booking.jadwal?.jam_mulai ?? '-'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: 'bold', fontSize: '0.85rem', verticalAlign: 'top' }}>
                      {formatCurrency(booking.total_harga)}
                    </td>
                    <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                      <span
                        className={`status-pill status-${booking.status.toLowerCase()}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Tidak ada pemesanan" message="Tidak ada pemesanan yang sesuai filter." />
        )}
      </div>
    </div>
  );
}