import { useEffect, useMemo, useState, useCallback } from 'react';
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

  const inputClass = "mt-2 block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 text-sm placeholder-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition";
  const labelClass = "block text-xs font-semibold text-slate-400 uppercase tracking-wider w-full";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. SECTION FILTER & STATISTIK PENDAPATAN */}
      <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-lg space-y-6">
        <h2 className="text-lg font-bold text-white tracking-tight">Filter Riwayat Pemesanan</h2>

        {error && <ErrorBanner message={error} />}

        {/* Form Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={labelClass}>
            Status Pembayaran
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputClass}
            >
              <option value="ALL">Semua</option>
              <option value="PENDING">Pending</option>
              <option value="LUNAS">Lunas</option>
              <option value="BATAL">Batal</option>
            </select>
          </label>

          <label className={labelClass}>
            Cari Transaksi
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, kode booking, film..."
              className={inputClass}
            />
          </label>
        </div>

        {/* Mini Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800/60">
          {[
            { title: 'Total Pesanan', val: stats.total, color: 'text-white' },
            { title: 'Transaksi Lunas', val: stats.lunas, color: 'text-emerald-400' },
            { title: 'Status Pending', val: stats.pending, color: 'text-amber-400' },
            { title: 'Total Pendapatan', val: formatCurrency(stats.totalRevenue), color: 'text-teal-400' }
          ].map((stat, idx) => (
            <article key={idx} className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{stat.title}</span>
              <strong className={`block text-xl font-black mt-1 ${stat.color}`}>{stat.val}</strong>
            </article>
          ))}
        </div>
      </div>

      {/* 2. SECTION DAFTAR TABEL PEMESANAN */}
      <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg font-bold text-white tracking-tight mb-5">Daftar Pemesanan Masuk</h2>

        {loading ? (
          <LoadingState label="Memuat data riwayat transaksi..." />
        ) : bookings.length ? (
          <div className="overflow-x-auto rounded-xl border border-slate-800 custom-scrollbar">
            <table className="w-full border-collapse text-left table-fixed min-w-[800px]">
              <colgroup>
                <col className="w-[15%]" />
                <col className="w-[22%]" />
                <col className="w-[23%]" />
                <col className="w-[16%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800">
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kode Booking</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pengguna</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Film / Studio</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jadwal Operasional</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Biaya</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 bg-slate-900/40">
                {bookings.map((booking) => (
                  <tr key={booking.id_pemesanan} className="hover:bg-slate-950/20 transition-colors duration-150">
                    {/* Kode Booking */}
                    <td className="p-4 align-top">
                      <strong className="text-xs font-bold font-mono text-slate-300 block break-all">
                        {booking.kode_booking}
                      </strong>
                    </td>
                    
                    {/* Pengguna */}
                    <td className="p-4 align-top space-y-0.5">
                      <strong className="text-xs font-semibold text-slate-200 block truncate">
                        {booking.pengguna?.nama ?? '-'}
                      </strong>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {booking.pengguna?.email ?? '-'}
                      </span>
                    </td>
                    
                    {/* Film & Bioskop */}
                    <td className="p-4 align-top space-y-0.5">
                      <span className="text-xs font-semibold text-slate-200 block truncate">
                        {booking.jadwal?.film?.judul ?? '-'}
                      </span>
                      <span className="text-[11px] text-teal-500 block truncate font-medium">
                        {booking.jadwal?.studio?.bioskop?.nama_bioskop ?? '-'}
                      </span>
                    </td>
                    
                    {/* Tanggal & Waktu */}
                    <td className="p-4 align-top space-y-0.5">
                      <span className="text-xs font-medium text-slate-300 block">
                        {booking.jadwal?.tanggal ? formatDate(booking.jadwal.tanggal) : '-'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono block">
                        🕒 {booking.jadwal?.jam_mulai ?? '-'}
                      </span>
                    </td>
                    
                    {/* Total Harga */}
                    <td className="p-4 align-top">
                      <strong className="text-xs font-black text-white font-mono block">
                        {formatCurrency(booking.total_harga)}
                      </strong>
                    </td>
                    
                    {/* Status Badge */}
                    <td className="p-4 align-top">
                      <span className={`
                        inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider border uppercase
                        ${booking.status === 'LUNAS' 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : booking.status === 'PENDING' 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}
                      `}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-800/60 rounded-xl p-8 text-center shadow-inner">
            <EmptyState title="Tidak ada pemesanan" message="Tidak ada rekaman data pemesanan yang sesuai dengan filter pencarian Anda." />
          </div>
        )}
      </div>

    </div>
  );
}