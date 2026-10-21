import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ShieldCheck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api, { getApiError } from '../api/axios';
import { EmptyState, ErrorBanner, LoadingState } from '../components/Status';
import { formatCurrency, formatDate } from '../lib/format';
import type { Pemesanan } from '../types';

export default function MyTickets() {
  const [bookings, setBookings] = useState<Pemesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LUNAS' | 'PENDING' | 'BATAL'>('ALL');

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

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'ALL') return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingState label="Memuat tiket dan riwayat pesanan..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-7xl mx-auto">
      
      {/* 1. HERO HEADER */}
      <section className="bg-canvas-card border border-border-subtle rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="max-w-2xl space-y-2">
          <p className="text-[10px] font-bold tracking-widest text-gold-400 uppercase">E-Tiket & Boarding Pass</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-headline tracking-tight">Tiket Bioskop Saya</h1>
          <p className="text-xs text-text-muted leading-relaxed">
            Daftar tiket resmi yang Anda miliki. Tunjukkan kode QR digital pada barcode scanner gerbang masuk studio bioskop saat penayangan.
          </p>
        </div>
      </section>

      {/* 2. FILTER STATUS TABS */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-1.5 bg-canvas-card p-1 rounded-xl border border-border-subtle">
          {[
            { id: 'ALL', label: 'Semua Tiket' },
            { id: 'LUNAS', label: 'Aktif / Lunas' },
            { id: 'PENDING', label: 'Menunggu Bayar' },
            { id: 'BATAL', label: 'Dibatalkan' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === tab.id
                  ? 'bg-gold-500 text-text-on-gold shadow-sm'
                  : 'text-text-muted hover:text-text-headline'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-text-muted font-mono">
          Total {filteredBookings.length} tiket ditemukan
        </span>
      </section>

      {/* 3. LIST TIKET */}
      <section className="space-y-6 w-full">
        {error && <ErrorBanner message={error} />}

        {filteredBookings.length ? (
          <div className="space-y-6 w-full">
            {filteredBookings.map((booking) => {
              const isPending = booking.status === 'PENDING';
              const isLunas = booking.status === 'LUNAS';
              const canConfirm = isPending && booking.pembayaran?.status === 'PENDING';
              const qrPayload = JSON.stringify({
                bookingId: booking.kode_booking,
                movie: booking.jadwal.film.judul,
                studio: booking.jadwal.studio.nama_studio,
                cinema: booking.jadwal.studio.bioskop.nama_bioskop,
                seats: booking.detail.map((d) => d.slot.kursi.nomor_kursi),
                date: booking.jadwal.tanggal,
                time: booking.jadwal.jam_mulai,
              });

              return (
                <article 
                  key={booking.id_pemesanan}
                  className="flex flex-col lg:flex-row bg-canvas-card border border-border-subtle rounded-3xl overflow-hidden shadow-xl hover:border-border-elevated transition duration-300 relative w-full"
                >
                  
                  {/* BAGIAN 1: INFORMASI FILM (KIRI) */}
                  <div className="flex-1 p-6 space-y-4 lg:max-w-[45%] flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className={`
                          px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider border uppercase flex items-center space-x-1.5
                          ${isLunas 
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                            : isPending 
                              ? 'bg-gold-500/15 border-gold-500/30 text-gold-400' 
                              : 'bg-rose-500/15 border-rose-500/30 text-rose-400'}
                        `}>
                          {isLunas && <CheckCircle2 className="w-3 h-3" />}
                          {isPending && <AlertCircle className="w-3 h-3" />}
                          {!isLunas && !isPending && <XCircle className="w-3 h-3" />}
                          <span>{booking.status}</span>
                        </span>
                        
                        <span className="text-xs font-mono text-text-muted font-semibold tracking-wider">
                          Kode: <strong className="text-text-headline">{booking.kode_booking}</strong>
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-bold text-text-headline tracking-tight leading-tight">
                        {booking.jadwal.film.judul}
                      </h2>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs pt-4 border-t border-border-subtle">
                      <div>
                        <span className="text-text-muted text-[10px] uppercase font-bold block">Tanggal</span>
                        <strong className="text-text-body font-medium mt-0.5 block whitespace-nowrap">
                          {formatDate(booking.jadwal.tanggal, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </strong>
                      </div>
                      <div>
                        <span className="text-text-muted text-[10px] uppercase font-bold block">Jam Tayang</span>
                        <strong className="text-text-headline font-mono font-bold mt-0.5 block">
                          {booking.jadwal.jam_mulai}
                        </strong>
                      </div>
                      <div>
                        <span className="text-text-muted text-[10px] uppercase font-bold block">Studio</span>
                        <strong className="text-gold-400 font-semibold mt-0.5 block truncate">
                          {booking.jadwal.studio.nama_studio}
                        </strong>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center space-x-2 text-xs text-text-muted">
                      <MapPin className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                      <span className="truncate">{booking.jadwal.studio.bioskop.nama_bioskop} ({booking.jadwal.studio.bioskop.kota})</span>
                    </div>
                  </div>

                  {/* DIVIDER TEPI TIKET (CINEMA TICKET PERFORATION) */}
                  <div className="hidden lg:flex flex-col items-center justify-between py-3 relative w-6">
                    <div className="w-5 h-5 bg-canvas-base rounded-full -mt-5 border-b border-border-subtle" />
                    <div className="w-0.5 flex-1 border-r-2 border-dashed border-border-elevated" />
                    <div className="w-5 h-5 bg-canvas-base rounded-full -mb-5 border-t border-border-subtle" />
                  </div>

                  {/* BAGIAN 2: DETAIL KURSI & TOTAL (TENGAH) */}
                  <div className="p-6 bg-canvas-base/60 border-t lg:border-t-0 border-b lg:border-b-0 border-border-subtle flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                        Kursi Terpilih ({booking.detail.length} Tiket)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {booking.detail.map((detail) => (
                          <div 
                            key={detail.id_detail} 
                            className="bg-canvas-card border border-border-subtle rounded-xl px-3 py-1.5 flex items-center space-x-1.5 shadow-sm"
                          >
                            <span className="text-xs font-mono font-black text-gold-400">
                              {detail.slot.kursi.nomor_kursi}
                            </span>
                            <span className="text-[9px] text-text-muted uppercase">
                              ({detail.slot.kursi.baris})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border-subtle flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-text-muted uppercase font-bold block">Total Harga</span>
                        <span className="text-lg font-black text-gold-400 font-mono">
                          {formatCurrency(booking.pembayaran ? Number(booking.pembayaran.jumlah) : Number(booking.total_harga))}
                        </span>
                      </div>

                      {booking.pembayaran && (
                        <div className="text-right">
                          <span className="text-[10px] text-text-muted uppercase block">Metode</span>
                          <span className="text-xs font-semibold text-text-headline">{booking.pembayaran.metode}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BAGIAN 3: DIGITAL BOARDING PASS / QR CODE SCANNER (KANAN) */}
                  <div className="p-6 bg-canvas-card lg:w-72 flex flex-col items-center justify-center text-center space-y-3">
                    {isLunas ? (
                      <>
                        <div className="p-2.5 bg-white rounded-2xl shadow-xl">
                          <QRCodeSVG 
                            value={qrPayload} 
                            size={120} 
                            level="M" 
                            includeMargin={false}
                          />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono font-bold text-text-headline tracking-widest block">
                            SCAN DI PINTU STUDIO
                          </span>
                          <span className="text-[9px] text-emerald-400 font-medium flex items-center justify-center space-x-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Boarding Pass Valid</span>
                          </span>
                        </div>
                      </>
                    ) : isPending ? (
                      <div className="space-y-3 w-full">
                        <div className="w-12 h-12 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 mx-auto">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xs font-bold text-text-headline">Menunggu Pembayaran</h3>
                          <p className="text-[10px] text-text-muted leading-tight">
                            Selesaikan pembayaran untuk menerbitkan QR Code boarding pass resmi.
                          </p>
                        </div>
                        
                        <div className="space-y-1.5 pt-2">
                          {canConfirm ? (
                            <button
                              type="button"
                              disabled={processingId === booking.id_pemesanan}
                              onClick={() => confirmPayment(booking.id_pemesanan)}
                              className="w-full bg-gold-500 hover:bg-gold-600 text-text-on-gold font-bold text-xs py-2 rounded-xl transition shadow-sm shadow-gold-500/15"
                            >
                              {processingId === booking.id_pemesanan ? 'Memproses...' : 'Simulasi Bayar'}
                            </button>
                          ) : (
                            <Link
                              to={`/checkout/${booking.id_pemesanan}`}
                              className="block w-full bg-gold-500 hover:bg-gold-600 text-text-on-gold font-bold text-xs py-2 rounded-xl transition text-center shadow-sm shadow-gold-500/15"
                            >
                              Lanjut Bayar
                            </Link>
                          )}
                          <button
                            type="button"
                            disabled={processingId === booking.id_pemesanan}
                            onClick={() => cancelBooking(booking.id_pemesanan)}
                            className="w-full bg-canvas-elevated hover:bg-canvas-floating text-rose-400 text-[11px] py-1.5 rounded-xl border border-border-subtle transition"
                          >
                            Batalkan Pesanan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
                          <XCircle className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-rose-400 block">Pesanan Dibatalkan</span>
                        <p className="text-[10px] text-text-muted">Kursi telah dilepaskan kembali ke sistem.</p>
                      </div>
                    )}
                  </div>

                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-canvas-card border border-border-subtle rounded-3xl p-12 text-center">
            <EmptyState 
              title="Belum Ada Tiket" 
              message="Anda belum memiliki pesanan tiket bioskop pada status ini. Pilih film favorit Anda dan pesan kursi sekarang." 
            />
          </div>
        )}
      </section>

    </div>
  );
}
