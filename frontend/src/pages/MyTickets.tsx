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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingState label="Memuat riwayat tiket Anda..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full">
      
      {/* 1. HERO HEADER FULL SPACE */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/60 py-8 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="w-full">
          <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">Akun Penonton</p>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-white">Tiket Bioskop Saya</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Kelola pesanan aktif Anda, pantau status pembayaran invoice, dan tunjukkan kode masuk digital saat tiba di teater.
          </p>
        </div>
      </section>

      {/* 2. TICKET LIST FULL STRETCH ZONE */}
      <section className="space-y-6 w-full">
        {error && <ErrorBanner message={error} />}

        {bookings.length ? (
          <div className="space-y-6 w-full">
            {bookings.map((booking) => {
              const isPending = booking.status === 'PENDING';
              const isLunas = booking.status === 'LUNAS';
              const canConfirm = isPending && booking.pembayaran?.status === 'PENDING';

              return (
                <article 
                  key={booking.id_pemesanan}
                  className="flex flex-col lg:flex-row bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700/80 transition duration-300 relative w-full"
                >
                  
                  {/* ZONA 1: INFO INTI FILM & BIOSKOP (KIRI - MEMANJANG) */}
                  <div className="flex-1 p-6 space-y-4 lg:max-w-[45%] flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className={`
                          px-2.5 py-0.5 rounded text-[10px] font-black tracking-wider border uppercase
                          ${isLunas 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : isPending 
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}
                        `}>
                          {booking.status}
                        </span>
                        <span className="text-xs font-mono text-slate-500 font-semibold tracking-wider">
                          ID: {booking.kode_booking}
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-white tracking-tight leading-tight group-hover:text-teal-400 transition">
                        {booking.jadwal.film.judul}
                      </h2>
                    </div>

                    {/* Meta Barisan Jadwal Horisontal */}
                    <div className="grid grid-cols-3 gap-4 text-xs pt-4 border-t border-slate-800/60">
                      <div>
                        <span className="text-slate-500 font-medium block">Tanggal</span>
                        <strong className="text-slate-200 font-semibold mt-0.5 block whitespace-nowrap">
                          {formatDate(booking.jadwal.tanggal, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block">Waktu</span>
                        <strong className="text-slate-200 font-semibold font-mono mt-0.5 block">
                          🕒 {booking.jadwal.jam_mulai}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block">Studio</span>
                        <strong className="text-teal-400 font-semibold mt-0.5 block truncate">
                          {booking.jadwal.studio.nama_studio} <span className="text-slate-500 font-normal text-[10px]">({booking.jadwal.studio.tipe})</span>
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* GARIS PERFORASI POTONGAN TIKET 1 */}
                  <div className="hidden lg:flex flex-col items-center justify-between relative w-4 select-none">
                    <div className="w-4 h-2 bg-slate-950 border-b border-slate-800 rounded-b-full absolute -top-px left-0" />
                    <div className="w-px h-full border-l border-dashed border-slate-800/80 my-3" />
                    <div className="w-4 h-2 bg-slate-950 border-t border-slate-800 rounded-t-full absolute -bottom-px left-0" />
                  </div>

                  {/* ZONA 2: NOMOR KURSI & BARCODE DIGITAL (TENGAH - STRETCH) */}
                  <div className="flex-1 bg-slate-950/20 p-6 flex flex-col justify-between border-t lg:border-t-0 border-slate-800/60 lg:max-w-[35%] space-y-4">
                    <div className="space-y-2">
                      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Lokasi Teater</span>
                      <strong className="text-slate-200 text-sm font-semibold block truncate">
                        🏢 {booking.jadwal.studio.bioskop.nama_bioskop}
                      </strong>
                    </div>

                    {/* Managemen Kursi Penonton */}
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nomor Kursi</span>
                      <div className="flex flex-wrap gap-1.5">
                        {booking.detail.map((detail) => (
                          <strong key={detail.id_detail} className="text-xs font-bold font-mono bg-slate-950 border border-slate-800 text-slate-300 px-3 py-1 rounded-lg shadow-inner">
                            {detail.slot.kursi.nomor_kursi}
                          </strong>
                        ))}
                      </div>
                    </div>

                    {/* Barcode/Token Gate Masuk */}
                    {isLunas ? (
                      <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-xl space-y-1">
                        <span className="text-[9px] font-bold text-teal-400 uppercase tracking-widest block">Digital Ticket Code</span>
                        <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400 font-bold">
                          {booking.detail.map((detail) => (
                            <span key={detail.id_detail} className="bg-teal-500/5 px-2 py-0.5 rounded border border-teal-500/10">
                              🎟️ {detail.kode_tiket}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-amber-500 font-medium bg-amber-500/5 border border-amber-500/10 p-2 rounded-xl">
                        ⚠️ Selesaikan administrasi invoice untuk memunculkan kode tiket masuk digital.
                      </div>
                    )}
                  </div>

                  {/* GARIS PERFORASI POTONGAN TIKET 2 */}
                  <div className="hidden lg:flex flex-col items-center justify-between relative w-4 select-none">
                    <div className="w-4 h-2 bg-slate-950 border-b border-slate-800 rounded-b-full absolute -top-px left-0" />
                    <div className="w-px h-full border-l border-dashed border-slate-800/80 my-3" />
                    <div className="w-4 h-2 bg-slate-950 border-t border-slate-800 rounded-t-full absolute -bottom-px left-0" />
                  </div>

                  {/* ZONA 3: KASIR BILLING & ACTIONS CONTROL (KANAN - COMPACT) */}
                  <div className="w-full lg:w-56 bg-slate-950/40 p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800/40 gap-4 min-h-[160px] lg:min-h-0">
                    <div className="text-left lg:text-right space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Pembayaran</span>
                      <strong className="text-xl font-black text-white font-mono block tracking-tight">
                        {formatCurrency(booking.total_harga)}
                      </strong>
                    </div>

                    {/* Action Panel Buttons */}
                    <div className="space-y-2">
                      {isPending && !booking.pembayaran && (
                        <Link 
                          className="block w-full text-center bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-lg shadow-teal-500/5 focus:outline-none" 
                          to={`/checkout/${booking.id_pemesanan}`}
                        >
                          Lanjut Bayar
                        </Link>
                      )}
                      
                      {canConfirm && (
                        <button 
                          type="button" 
                          disabled={processingId === booking.id_pemesanan} 
                          onClick={() => confirmPayment(booking.id_pemesanan)}
                          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2.5 px-3 rounded-xl transition shadow-md focus:outline-none disabled:opacity-40"
                        >
                          {processingId === booking.id_pemesanan ? 'Memproses...' : 'Simulasi Bayar Berhasil'}
                        </button>
                      )}
                      
                      {isPending && (
                        <button 
                          type="button" 
                          disabled={processingId === booking.id_pemesanan} 
                          onClick={() => cancelBooking(booking.id_pemesanan)}
                          className="w-full bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 font-semibold text-xs py-2.5 px-3 rounded-xl transition focus:outline-none disabled:opacity-40"
                        >
                          Batalkan Pesanan
                        </button>
                      )}

                      {!isPending && !canConfirm && (
                        <div className="text-center py-2 text-slate-700 select-none text-4xl hidden lg:block">
                          {isLunas ? '🍿' : '❌'}
                        </div>
                      )}
                    </div>
                  </div>

                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-12 text-center shadow-inner">
            <EmptyState title="Belum ada tiket" message="Pesanan tiket bioskop digital yang kamu buat akan otomatis terekam di sini." />
          </div>
        )}
      </section>

    </div>
  );
}