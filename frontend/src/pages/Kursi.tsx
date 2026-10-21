import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle2 } from 'lucide-react';
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

  const rows = useMemo(() => {
    const grouped = (schedule?.slots || []).reduce<Record<string, SlotKursi[]>>((result, slot) => {
      const row = slot.kursi.baris;
      result[row] = [...(result[row] || []), slot];
      return result;
    }, {});

    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => 
        a.kursi.nomor_kursi.localeCompare(b.kursi.nomor_kursi, undefined, { numeric: true })
      );
    });

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [schedule]);

  const toggle = (slot: SlotKursi) => {
    if (slot.status !== 'TERSEDIA') return;
    setSelected((prev) =>
      prev.includes(slot.id_slot)
        ? prev.filter((item) => item !== slot.id_slot)
        : [...prev, slot.id_slot],
    );
  };

  const selectedSeats = useMemo(() => {
    if (!schedule?.slots) return [];
    return schedule.slots
      .filter((slot) => selected.includes(slot.id_slot))
      .map((slot) => slot.kursi.nomor_kursi);
  }, [schedule, selected]);

  const total = Number(schedule?.harga || 0) * selected.length;

  const submit = async () => {
    if (!selected.length) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await api.post<Pemesanan>('/pemesanan', {
        id_jadwal: Number(id_jadwal),
        slots: selected,
      });
      navigate(`/checkout/${response.data.id_pemesanan}`);
    } catch (requestError) {
      setError(getApiError(requestError, 'Kursi gagal dikunci. Coba pilih kursi lain.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingState label="Memuat denah kursi bioskop..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-7xl mx-auto">
      
      {/* 1. TOP NAV BREADCRUMB */}
      <div className="flex items-center justify-between">
        <Link 
          to={schedule ? `/jadwal/${schedule.id_film}` : '/film'}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-gold-400 hover:text-gold-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ganti Jadwal / Film</span>
        </Link>
        <span className="text-[11px] text-text-muted font-mono">
          Lock otomatis: 15 menit
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 2. DENAH KURSI (KIRI) */}
        <section className="lg:col-span-8 bg-canvas-card border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-xl space-y-8 overflow-hidden">
          
          <div className="border-b border-border-subtle pb-4">
            <div className="flex items-center space-x-2 text-gold-400">
              <MapPin className="w-3.5 h-3.5" />
              <p className="text-[10px] font-bold tracking-widest uppercase">{schedule?.studio.bioskop.nama_bioskop}</p>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-text-headline mt-1 tracking-tight">{schedule?.film.judul}</h1>
            <p className="text-xs text-text-muted mt-1 flex items-center space-x-2">
              <span>{schedule && formatDate(schedule.tanggal)}</span>
              <span>•</span>
              <span className="text-text-headline font-mono font-bold">{schedule?.jam_mulai}</span>
              <span>•</span>
              <span className="text-gold-400">{schedule?.studio.nama_studio} ({schedule?.studio.tipe})</span>
            </p>
          </div>

          {error && <ErrorBanner message={error} />}

          {/* LAYAR BIOSKOP PROYEKTOR (SATIN GOLD GLOW) */}
          <div className="w-full flex flex-col items-center justify-center space-y-3 pt-2">
            <div className="w-4/5 h-2.5 bg-gradient-to-r from-transparent via-gold-400/40 to-transparent rounded-t-full shadow-[0_-8px_20px_rgba(212,175,55,0.15)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              LAYAR BIOSKOP UTAMA
            </span>
          </div>

          {/* MATRIKS DENAH */}
          {rows.length > 0 ? (
            <div className="overflow-x-auto py-4 flex flex-col items-center space-y-3 scrollbar-thin">
              {rows.map(([rowName, slots]) => (
                <div key={rowName} className="flex items-center space-x-2 sm:space-x-3">
                  <span className="w-5 text-center text-xs font-mono font-bold text-text-muted select-none">
                    {rowName}
                  </span>
                  
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    {slots.map((slot) => {
                      const isSelected = selected.includes(slot.id_slot);
                      const isAvailable = slot.status === 'TERSEDIA';

                      let seatStyle = 'bg-canvas-elevated border-border-elevated text-text-muted hover:border-gold-400/60 hover:text-text-headline cursor-pointer';
                      if (isSelected) {
                        seatStyle = 'bg-gold-500 border-gold-400 text-text-on-gold font-black shadow-md shadow-gold-500/25 scale-105';
                      } else if (!isAvailable) {
                        seatStyle = 'bg-[#0A0E17] border-slate-900/80 text-slate-700 cursor-not-allowed opacity-35';
                      }

                      return (
                        <button
                          key={slot.id_slot}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => toggle(slot)}
                          aria-label={`Kursi ${slot.kursi.nomor_kursi} - ${slot.status}`}
                          className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg border text-[11px] sm:text-xs font-mono font-bold transition duration-150 flex items-center justify-center select-none ${seatStyle}`}
                        >
                          {slot.kursi.nomor_kursi.replace(slot.kursi.baris, '')}
                        </button>
                      );
                    })}
                  </div>

                  <span className="w-5 text-center text-xs font-mono font-bold text-text-muted select-none">
                    {rowName}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Denah Belum Siap" message="Konfigurasi denah kursi belum diatur untuk jadwal ini." />
          )}

          {/* LEGENDA */}
          {rows.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-border-subtle text-xs text-text-muted">
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded bg-canvas-elevated border border-border-elevated inline-block" />
                <span>Tersedia</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded bg-gold-500 border border-gold-400 inline-block" />
                <span className="text-text-headline font-medium">Dipilih</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded bg-[#0A0E17] opacity-40 border border-slate-900 inline-block" />
                <span>Terisi</span>
              </span>
            </div>
          )}
        </section>

        {/* 3. RINGKASAN PESANAN (KANAN) */}
        <aside className="lg:col-span-4 bg-canvas-card border border-border-subtle rounded-3xl p-6 shadow-xl space-y-6 sticky top-24">
          <div className="border-b border-border-subtle pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gold-400">Ringkasan Pemesanan</h2>
            <p className="text-xs text-text-muted mt-0.5">Detail tiket yang dipilih</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-text-muted">
              <span>Film</span>
              <span className="text-text-headline font-semibold text-right truncate max-w-[180px]">{schedule?.film.judul}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Bioskop</span>
              <span className="text-text-body text-right">{schedule?.studio.bioskop.nama_bioskop}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Studio</span>
              <span className="text-text-body font-mono">{schedule?.studio.nama_studio}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Harga Satuan</span>
              <span className="text-text-body font-mono">{formatCurrency(schedule?.harga || 0)}</span>
            </div>
          </div>

          <div className="p-3.5 bg-canvas-base border border-border-subtle rounded-2xl space-y-2">
            <div className="flex justify-between text-xs font-medium text-text-muted">
              <span>Kursi Dipilih ({selected.length})</span>
              <span className="text-gold-400 font-mono font-bold">
                {selectedSeats.length ? selectedSeats.join(', ') : 'Belum dipilih'}
              </span>
            </div>
          </div>

          <div className="border-t border-border-subtle pt-4 flex items-baseline justify-between">
            <span className="text-xs text-text-muted font-semibold uppercase">Total Tiket</span>
            <span className="text-xl font-black text-gold-400 font-mono">{formatCurrency(total)}</span>
          </div>

          <button
            type="button"
            disabled={!selected.length || submitting}
            onClick={submit}
            className="w-full bg-gold-500 hover:bg-gold-600 text-text-on-gold font-bold text-xs py-3.5 px-4 rounded-xl disabled:opacity-50 transition shadow-sm shadow-gold-500/20 flex items-center justify-center space-x-2"
          >
            <span>{submitting ? 'Mengunci Kursi...' : 'Lanjut ke Menu & Pembayaran'}</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-text-disabled text-center leading-normal">
            Setelah klik lanjut, kursi terkunci aman dan Anda dapat memilih paket makanan & minuman bioskop.
          </p>
        </aside>

      </div>
    </div>
  );
}
