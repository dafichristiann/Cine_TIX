import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import api, { getApiError } from '../api/axios';
import { ErrorBanner, LoadingState } from '../components/Status';
import { formatCurrency, formatDate } from '../lib/format';
import type { Bioskop, Film, Jadwal, Studio } from '../types';

const emptyFilm = {
  judul: '',
  genre: '',
  durasi: '120',
  rating: 'R13+',
  sinopsis: '',
  poster_url: '',
  tanggal_rilis: new Date().toISOString().slice(0, 10),
  bahasa: 'Indonesia',
};

const emptySchedule = {
  id_film: '',
  id_studio: '',
  tanggal: new Date().toISOString().slice(0, 10),
  jam_mulai: '13:00',
  jam_selesai: '15:00',
  harga: '50000',
};

export default function AdminDashboard() {
  const [films, setFilms] = useState<Film[]>([]);
  const [schedules, setSchedules] = useState<Jadwal[]>([]);
  const [bioskops, setBioskops] = useState<Bioskop[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [filmForm, setFilmForm] = useState(emptyFilm);
  const [scheduleForm, setScheduleForm] = useState(emptySchedule);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = () =>
    Promise.all([
      api.get<Film[]>('/film'),
      api.get<Jadwal[]>('/jadwal'),
      api.get<Bioskop[]>('/bioskop'),
      api.get<Studio[]>('/studio'),
    ])
      .then(([filmResponse, scheduleResponse, bioskopResponse, studioResponse]) => {
        setFilms(filmResponse.data);
        setSchedules(scheduleResponse.data);
        setBioskops(bioskopResponse.data);
        setStudios(studioResponse.data);
        setScheduleForm((current) => ({
          ...current,
          id_film: current.id_film || String(filmResponse.data[0]?.id_film || ''),
          id_studio: current.id_studio || String(studioResponse.data[0]?.id_studio || ''),
        }));
      })
      .catch((requestError: unknown) => setError(getApiError(requestError)))
      .finally(() => setLoading(false));

  const loadData = () => {
    setLoading(true);
    return fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const averagePrice = useMemo(() => {
    if (!schedules.length) return 0;
    return schedules.reduce((sum, schedule) => sum + Number(schedule.harga || 0), 0) / schedules.length;
  }, [schedules]);

  const createFilm = async (event: FormEvent) => {
    event.preventDefault();
    setSaving('film');
    setError('');
    setSuccess('');
    try {
      await api.post('/film', {
        ...filmForm,
        durasi: Number(filmForm.durasi),
        poster_url: filmForm.poster_url || undefined,
        tanggal_rilis: new Date(filmForm.tanggal_rilis).toISOString(),
      });
      setFilmForm(emptyFilm);
      setSuccess('Film baru berhasil ditambahkan.');
      loadData();
    } catch (requestError) {
      setError(getApiError(requestError, 'Film gagal ditambahkan.'));
    } finally {
      setSaving('');
    }
  };

  const createSchedule = async (event: FormEvent) => {
    event.preventDefault();
    setSaving('jadwal');
    setError('');
    setSuccess('');
    try {
      await api.post('/jadwal', {
        ...scheduleForm,
        id_film: Number(scheduleForm.id_film),
        id_studio: Number(scheduleForm.id_studio),
        tanggal: new Date(scheduleForm.tanggal).toISOString(),
      });
      setScheduleForm(emptySchedule);
      setSuccess('Jadwal baru berhasil dibuat dan slot kursi otomatis disiapkan.');
      loadData();
    } catch (requestError) {
      setError(getApiError(requestError, 'Jadwal gagal dibuat.'));
    } finally {
      setSaving('');
    }
  };

  if (loading) return <div className="container page-loader"><LoadingState label="Memuat dashboard admin..." /></div>;

  return (
    <div className="page-content admin-page">
      <section className="page-hero compact-hero">
        <div className="container">
          <p className="eyebrow">Panel admin</p>
          <h1>Admin CineTix</h1>
          <p>Kelola film dan jadwal tayang dasar dari satu tempat.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {error && <ErrorBanner message={error} />}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="admin-stats">
            <article><span>Film</span><strong>{films.length}</strong></article>
            <article><span>Jadwal</span><strong>{schedules.length}</strong></article>
            <article><span>Bioskop</span><strong>{bioskops.length}</strong></article>
            <article><span>Rata-rata tiket</span><strong>{formatCurrency(averagePrice)}</strong></article>
          </div>

          <div className="admin-grid">
            <form className="admin-panel admin-form" onSubmit={createFilm}>
              <h2>Tambah film</h2>
              <label>Judul<input value={filmForm.judul} onChange={(event) => setFilmForm((current) => ({ ...current, judul: event.target.value }))} required /></label>
              <div className="form-row">
                <label>Genre<input value={filmForm.genre} onChange={(event) => setFilmForm((current) => ({ ...current, genre: event.target.value }))} required /></label>
                <label>Rating<input value={filmForm.rating} onChange={(event) => setFilmForm((current) => ({ ...current, rating: event.target.value }))} required /></label>
              </div>
              <div className="form-row">
                <label>Durasi<input type="number" min="1" value={filmForm.durasi} onChange={(event) => setFilmForm((current) => ({ ...current, durasi: event.target.value }))} required /></label>
                <label>Bahasa<input value={filmForm.bahasa} onChange={(event) => setFilmForm((current) => ({ ...current, bahasa: event.target.value }))} required /></label>
              </div>
              <label>Tanggal rilis<input type="date" value={filmForm.tanggal_rilis} onChange={(event) => setFilmForm((current) => ({ ...current, tanggal_rilis: event.target.value }))} required /></label>
              <label>URL poster<input value={filmForm.poster_url} onChange={(event) => setFilmForm((current) => ({ ...current, poster_url: event.target.value }))} /></label>
              <label>Sinopsis<textarea value={filmForm.sinopsis} onChange={(event) => setFilmForm((current) => ({ ...current, sinopsis: event.target.value }))} required /></label>
              <button className="button button-primary button-block" disabled={saving === 'film'}>{saving === 'film' ? 'Menyimpan...' : 'Simpan film'}</button>
            </form>

            <form className="admin-panel admin-form" onSubmit={createSchedule}>
              <h2>Tambah jadwal</h2>
              <label>Film<select value={scheduleForm.id_film} onChange={(event) => setScheduleForm((current) => ({ ...current, id_film: event.target.value }))} required>{films.map((film) => <option value={film.id_film} key={film.id_film}>{film.judul}</option>)}</select></label>
              <label>Studio<select value={scheduleForm.id_studio} onChange={(event) => setScheduleForm((current) => ({ ...current, id_studio: event.target.value }))} required>{studios.map((studio) => <option value={studio.id_studio} key={studio.id_studio}>{studio.bioskop.nama_bioskop} - {studio.nama_studio}</option>)}</select></label>
              <div className="form-row">
                <label>Tanggal<input type="date" value={scheduleForm.tanggal} onChange={(event) => setScheduleForm((current) => ({ ...current, tanggal: event.target.value }))} required /></label>
                <label>Harga<input value={scheduleForm.harga} onChange={(event) => setScheduleForm((current) => ({ ...current, harga: event.target.value }))} required /></label>
              </div>
              <div className="form-row">
                <label>Mulai<input type="time" value={scheduleForm.jam_mulai} onChange={(event) => setScheduleForm((current) => ({ ...current, jam_mulai: event.target.value }))} required /></label>
                <label>Selesai<input type="time" value={scheduleForm.jam_selesai} onChange={(event) => setScheduleForm((current) => ({ ...current, jam_selesai: event.target.value }))} required /></label>
              </div>
              <button className="button button-primary button-block" disabled={saving === 'jadwal'}>{saving === 'jadwal' ? 'Menyimpan...' : 'Simpan jadwal'}</button>
            </form>
          </div>

          <div className="admin-panel schedule-table">
            <h2>Jadwal terbaru</h2>
            {schedules.slice(0, 8).map((schedule) => (
              <div className="table-row" key={schedule.id_jadwal}>
                <strong>{schedule.film.judul}</strong>
                <span>{formatDate(schedule.tanggal, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span>{schedule.jam_mulai} - {schedule.jam_selesai}</span>
                <span>{schedule.studio.nama_studio}</span>
                <span>{formatCurrency(schedule.harga)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
