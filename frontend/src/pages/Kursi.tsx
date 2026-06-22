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

  const rows = useMemo(() => {
    const grouped = (schedule?.slots || []).reduce<Record<string, SlotKursi[]>>((result, slot) => {
      result[slot.kursi.baris] = [...(result[slot.kursi.baris] || []), slot];
      return result;
    }, {});
    const sortedEntries = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([row, slots]) => {
        const sortedSlots = [...slots].sort((a, b) =>
          a.kursi.nomor_kursi.localeCompare(b.kursi.nomor_kursi, undefined, { numeric: true, sensitivity: 'base' })
        );
        return [row, sortedSlots] as [string, SlotKursi[]];
      });
    return Object.fromEntries(sortedEntries);
  }, [schedule]);

  const selectedSlots = useMemo(() => {
    return (schedule?.slots || [])
      .filter((slot) => selected.includes(slot.id_slot))
      .sort((a, b) =>
        a.kursi.nomor_kursi.localeCompare(b.kursi.nomor_kursi, undefined, { numeric: true, sensitivity: 'base' })
      );
  }, [schedule, selected]);

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
        // Error utama sudah ditampilkan di atas.
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container page-loader"><LoadingState label="Menyiapkan denah kursi..." /></div>;

  return (
    <div className="booking-page">
      <div className="container booking-header"><Link className="back-link" to={`/jadwal/${schedule?.id_film || ''}`}>&lt;- Ganti jadwal</Link><div><span>Langkah 2 dari 3</span><strong>Pilih kursi</strong></div></div>
      <div className="container seat-layout">
        <section className="seat-panel">
          <div className="seat-title"><div><p className="eyebrow">{schedule?.studio.bioskop.nama_bioskop}</p><h1>{schedule?.film.judul}</h1><p>{schedule && formatDate(schedule.tanggal)} / {schedule?.jam_mulai} / {schedule?.studio.nama_studio}</p></div></div>
          {error && <ErrorBanner message={error} />}
          <div className="screen-wrap"><div className="screen" /><span>LAYAR BIOSKOP</span></div>
          {(schedule?.slots || []).length ? <div className="seats-area">
            {Object.entries(rows).map(([row, slots]) => (
              <div className="seat-row" key={row}><span className="row-label">{row}</span><div className="seat-list">{slots.map((slot) => {
                const isSelected = selected.includes(slot.id_slot);
                return <button type="button" className={`seat seat-${slot.status.toLowerCase()} ${isSelected ? 'is-selected' : ''}`} disabled={slot.status !== 'TERSEDIA'} onClick={() => toggleSeat(slot)} aria-label={`Kursi ${slot.kursi.nomor_kursi}, ${isSelected ? 'dipilih' : slot.status.toLowerCase()}`} key={slot.id_slot}>{slot.kursi.nomor_kursi}</button>;
              })}</div><span className="row-label">{row}</span></div>
            ))}
          </div> : <EmptyState title="Kursi belum tersedia" message="Denah kursi untuk jadwal ini belum disiapkan oleh bioskop." />}
          {(schedule?.slots || []).length > 0 && <div className="seat-legend"><span><i className="seat-demo available" />Tersedia</span><span><i className="seat-demo selected" />Dipilih</span><span><i className="seat-demo unavailable" />Tidak tersedia</span></div>}
        </section>

        <aside className="booking-summary">
          <p className="eyebrow">Ringkasan pesanan</p><h2>{schedule?.film.judul}</h2>
          <dl><div><dt>Bioskop</dt><dd>{schedule?.studio.bioskop.nama_bioskop}</dd></div><div><dt>Jadwal</dt><dd>{schedule?.jam_mulai}</dd></div><div><dt>Studio</dt><dd>{schedule?.studio.nama_studio}</dd></div></dl>
          <div className="selected-seats"><span>Kursi pilihan</span>{selectedSlots.length ? <div>{selectedSlots.map((slot) => <strong key={slot.id_slot}>{slot.kursi.nomor_kursi}</strong>)}</div> : <p>Belum ada kursi dipilih</p>}</div>
          <div className="price-line"><span>{selected.length} tiket x {formatCurrency(schedule?.harga || 0)}</span><strong>{formatCurrency(total)}</strong></div>
          <button className="button button-primary button-block" type="button" disabled={!selected.length || submitting} onClick={createBooking}>{submitting ? 'Memproses...' : 'Lanjut ke pembayaran'} <span>-&gt;</span></button>
          <small className="summary-note">Kursi akan dikunci selama 15 menit setelah pesanan dibuat.</small>
        </aside>
      </div>
    </div>
  );
}
