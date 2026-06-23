import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getApiError } from '../api/axios';
import { EmptyState, ErrorBanner, LoadingState } from '../components/Status';
import { formatCurrency, formatDate } from '../lib/format';
import type { Jadwal, Pemesanan, SlotKursi } from '../types';

export default function Kursi() {
  const { id_jadwal } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<Jadwal | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Jadwal>(`/jadwal/${id_jadwal}`)
      .then((response) => setSchedule(response.data))
      .catch((requestError: unknown) => setError(getApiError(requestError)))
      .finally(() => setLoading(false));
  }, [id_jadwal]);

  // Mengelompokkan berdasarkan field 'baris' sesuai data model Prisma Anda
  const rows = useMemo(() => {
    const grouped = (schedule?.slots || []).reduce<Record<string, SlotKursi[]>>((result, slot) => {
      result[slot.kursi.baris] = [...(result[slot.kursi.baris] || []), slot];
      return result;
    }, {});

    // Mengurutkan nomor_kursi secara numerik di setiap baris agar urutannya pas (A1, A2, ... A10)
    Object.keys(grouped).forEach((row) => {
      grouped[row].sort((a, b) => {
        const numA = parseInt(a.kursi.nomor_kursi.replace(/^\D+/g, ''), 10) || 0;
        const numB = parseInt(b.kursi.nomor_kursi.replace(/^\D+/g, ''), 10) || 0;
        return numA - numB;
      });
    });

    return Object.fromEntries(Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)));
  }, [schedule]);

  const selectedSlots = (schedule?.slots || []).filter((slot) => selected.includes(slot.id_slot));
  const total = Number(schedule?.harga || 0) * selected.length;

  const toggleSeat = (slot: SlotKursi) => {
    if (slot.status !== 'TERSEDIA') return;
    setError('');
    setSelected((current) => current.includes(slot.id_slot)
      ? current.filter((id) => id !== slot.id_slot)
      : [...current, slot.id_slot]);
  };

  const createBooking = async () => {
    if (!schedule || !selected.length) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await api.post<Pemesanan>('/pemesanan', {
        id_jadwal: schedule.id_jadwal,
        id_slots: selected,
      });
      navigate(`/checkout/${response.data.id_pemesanan}`);
    } catch (requestError) {
      setError(getApiError(requestError, 'Kursi gagal dipesan. Silakan pilih kembali.'));
      try {
        const response = await api.get<Jadwal>(`/jadwal/${id_jadwal}`);
        setSchedule(response.data);
        setSelected([]);
      } catch {
        // Error fallback
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingState label="Menyiapkan denah kursi..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER NAVIGASI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <Link className="inline-flex items-center space-x-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition" to={`/jadwal/${schedule?.id_film || ''}`}>
          <span>{"<-"}</span> <span>Ganti Jadwal</span>
        </Link>
        <div className="text-left sm:text-right">
          <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">Langkah 2 dari 3</span>
          <strong className="text-base font-extrabold text-white">Pilih Posisi Kursi</strong>
        </div>
      </div>

      {/* CORE LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PANEL DENAH KURSI (KIRI) */}
        <section className="lg:col-span-8 bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-lg space-y-10 overflow-hidden">
          
          <div className="border-b border-slate-800 pb-4">
            <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">{schedule?.studio.bioskop.nama_bioskop}</p>
            <h1 className="text-2xl font-extrabold text-white mt-0.5 tracking-tight">{schedule?.film.judul}</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {schedule && formatDate(schedule.tanggal)} <span className="text-slate-600">•</span> {schedule?.jam_mulai} <span className="text-slate-600">•</span> <span className="text-teal-400">{schedule?.studio.nama_studio}</span>
            </p>
          </div>

          {error && <ErrorBanner message={error} />}

          {/* LAYAR BIOSKOP DENGAN EFEK AMBIENT GLOW */}
          <div className="w-full flex flex-col items-center justify-center space-y-3 pt-4 select-none">
            <div className="w-4/5 h-2.5 bg-gradient-to-b from-cyan-400/30 via-cyan-400/10 to-transparent rounded-full filter blur-[1px] shadow-[0_-4px_20px_rgba(34,211,238,0.2)]" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-500">Layar Bioskop</span>
          </div>

          {/* AREA DENAH SEAT DENGAN SCROLL HORIZONTAL DAN INTERAKSI PREMIUM */}
          {(schedule?.slots || []).length ? (
            <div className="py-6 overflow-x-auto w-full max-w-full custom-scrollbar">
              <div className="min-w-max space-y-3 px-4 flex flex-col items-center">
                {Object.entries(rows).map(([row, slots]) => (
                  <div className="flex items-center space-x-4 w-full justify-center" key={row}>
                    
                    {/* Indikator Huruf Baris Kiri */}
                    <span className="w-6 text-xs font-black font-mono text-slate-500 text-center select-none">
                      {row}
                    </span>
                    
                    {/* Grid Pembungkus Tombol Kursi */}
                    <div className="flex items-center gap-2 justify-center">
                      {slots.map((slot) => {
                        const isSelected = selected.includes(slot.id_slot);
                        const isAvailable = slot.status === 'TERSEDIA';
                        const seatNumber = slot.kursi.nomor_kursi.replace(/[A-Z]/g, '');

                        return (
                          <button
                            type="button"
                            key={slot.id_slot}
                            disabled={!isAvailable}
                            onClick={() => toggleSeat(slot)}
                            aria-label={`Kursi ${slot.kursi.nomor_kursi}, ${isSelected ? 'dipilih' : slot.status.toLowerCase()}`}
                            className={`
                              w-9 h-9 rounded-lg text-xs font-bold font-mono select-none focus:outline-none
                              flex items-center justify-center border transition-all duration-200
                              
                              /* Efek Taktil Mental saat Ditekan (Bounce Feedback) */
                              active:scale-90 transform-gpu
                              
                              ${isSelected 
                                ? 'bg-teal-500 border-teal-500 text-slate-950 font-black scale-105 shadow-md shadow-teal-500/30' 
                                : isAvailable 
                                  ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-teal-500/50 hover:text-white hover:shadow-[0_0_12px_rgba(20,184,166,0.15)] hover:scale-105' 
                                  : 'bg-slate-850 border-slate-850/60 text-slate-600 cursor-not-allowed opacity-30'}
                            `}
                          >
                            {seatNumber}
                          </button>
                        );
                      })}
                    </div>

                    {/* Indikator Huruf Baris Kanan */}
                    <span className="w-6 text-xs font-black font-mono text-slate-500 text-center select-none">
                      {row}
                    </span>

                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800/60 rounded-2xl p-8 text-center">
              <EmptyState title="Kursi belum tersedia" message="Denah layout kursi belum disiapkan." />
            </div>
          )}

          {/* LEGENDA PETUNJUK */}
          {(schedule?.slots || []).length > 0 && (
            <div className="flex items-center justify-center space-x-6 pt-4 border-t border-slate-800/60 text-xs font-medium text-slate-400">
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded bg-slate-950 border border-slate-800 inline-block" /> <span>Tersedia</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded bg-teal-500 inline-block" /> <span>Dipilih</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded bg-slate-850 opacity-30 inline-block" /> <span>Tidak Tersedia</span>
              </span>
            </div>
          )}
        </section>

        {/* ASIDE PANEL: RINGKASAN PESANAN (KANAN) */}
        <aside className="lg:col-span-4 bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-lg space-y-6 sticky top-24">
          <div>
            <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">Ringkasan Pesanan</p>
            <h2 className="text-lg font-extrabold text-white truncate mt-0.5">{schedule?.film.judul}</h2>
          </div>

          <dl className="space-y-3 text-xs border-y border-slate-800 py-4">
            <div className="flex justify-between"><dt className="text-slate-500 font-medium">Bioskop</dt><dd className="text-slate-200 font-semibold">{schedule?.studio.bioskop.nama_bioskop}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 font-medium">Waktu Mulai</dt><dd className="text-slate-200 font-semibold font-mono">{schedule?.jam_mulai}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 font-medium">Studio</dt><dd className="text-slate-200 font-semibold">{schedule?.studio.nama_studio} ({schedule?.studio.tipe})</dd></div>
          </dl>

          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Kursi Pilihan</span>
            {selectedSlots.length ? (
              <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                {selectedSlots.map((slot) => (
                  <strong key={slot.id_slot} className="text-xs font-bold font-mono bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2.5 py-1 rounded-lg">
                    {slot.kursi.nomor_kursi}
                  </strong>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Belum ada kursi yang dipilih</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="leading-tight">
              <span className="text-[11px] text-slate-500 font-medium block">{selected.length} tiket dipesan</span>
              <span className="text-[10px] text-teal-500 font-mono">{formatCurrency(schedule?.harga || 0)}/tiket</span>
            </div>
            <strong className="text-xl font-black text-white font-mono">{formatCurrency(total)}</strong>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              disabled={!selected.length || submitting}
              onClick={createBooking}
              className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm py-3 px-4 rounded-xl disabled:opacity-40 transition shadow-lg shadow-teal-500/5 flex items-center justify-center space-x-2 focus:outline-none"
            >
              <span>{submitting ? 'Memproses...' : 'Lanjut ke Pembayaran'}</span>
              {!submitting && <span className="font-mono text-xs">{"->"}</span>}
            </button>
            <small className="block text-[10px] text-slate-500 leading-normal text-center">
              🔒 Kursi otomatis dikunci selama 15 menit setelah tombol pembayaran ditekan.
            </small>
          </div>
        </aside>

      </div>
    </div>
  );
}