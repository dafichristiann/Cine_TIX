import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getApiError } from '../api/axios';
import { EmptyState, ErrorBanner, LoadingState } from '../components/Status';
import PosterImage from '../components/PosterImage';
import { formatCurrency, formatDate } from '../lib/format';
import type { Film, Jadwal as JadwalType } from '../types';

export default function Jadwal() {
  const { id_film } = useParams();
  const [film, setFilm] = useState<Film | null>(null);
  const [schedules, setSchedules] = useState<JadwalType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get<Film>(`/film/${id_film}`), api.get<JadwalType[]>('/jadwal', { params: { id_film } })])
      .then(([filmResponse, scheduleResponse]) => { setFilm(filmResponse.data); setSchedules(scheduleResponse.data); })
      .catch((requestError: unknown) => setError(getApiError(requestError)))
      .finally(() => setLoading(false));
  }, [id_film]);

  const grouped = useMemo(() => schedules.reduce<Record<string, JadwalType[]>>((result, schedule) => {
    const key = schedule.tanggal.slice(0, 10);
    result[key] = [...(result[key] || []), schedule];
    return result;
  }, {}), [schedules]);

  if (loading) return <div className="container page-loader"><LoadingState label="Mencari jadwal tayang..." /></div>;

  return (
    <div className="page-content">
      <section className="movie-detail-hero">
        <div className="container detail-grid">
          <div className="detail-poster">{film && <PosterImage film={film} />}</div>
          <div><Link className="back-link" to="/film">&lt;- Kembali ke film</Link><p className="eyebrow">{film?.genre}</p><h1>{film?.judul}</h1><div className="detail-meta"><span>{film?.rating}</span><span>{film?.durasi} menit</span><span>{film?.bahasa}</span></div><p className="synopsis">{film?.sinopsis}</p></div>
        </div>
      </section>
      <section className="section schedule-section">
        <div className="container"><div className="section-heading"><div><p className="eyebrow">Pilih waktu</p><h2>Jadwal tayang</h2></div></div>
          {error && <ErrorBanner message={error} />}
          {!schedules.length ? <EmptyState title="Belum ada jadwal" message="Jadwal tayang untuk film ini belum tersedia." /> : Object.entries(grouped).map(([date, items]) => (
            <div className="schedule-day" key={date}>
              <div className="schedule-date"><strong>{formatDate(date, { weekday: 'long' })}</strong><span>{formatDate(date, { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
              <div className="cinema-list">{items.map((schedule) => (
                <article className="cinema-row" key={schedule.id_jadwal}>
                  <div><h3>{schedule.studio.bioskop.nama_bioskop}</h3><p>{schedule.studio.bioskop.kota} / {schedule.studio.nama_studio} / {schedule.studio.tipe}</p></div>
                  <div className="showtime-info"><div><strong>{schedule.jam_mulai}</strong><small>sampai {schedule.jam_selesai}</small></div><span>{formatCurrency(schedule.harga)}</span><Link className="button button-primary button-small" to={`/kursi/${schedule.id_jadwal}`}>Pilih kursi</Link></div>
                </article>
              ))}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
