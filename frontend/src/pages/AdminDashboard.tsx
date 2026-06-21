import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import api, { getApiError } from '../api/axios';
import { ErrorBanner, LoadingState } from '../components/Status';
import { formatCurrency, formatDate } from '../lib/format';
import type { Bioskop, Film, Jadwal, Studio } from '../types';
import AdminBookingHistory from './AdminBookingHistory';

type Section = 'film' | 'lokasi' | 'jadwal' | 'riwayat';

const newFilm = () => ({
  judul: '', genre: '', durasi: '120', rating: 'R13+', sinopsis: '', poster_url: '',
  tanggal_rilis: new Date().toISOString().slice(0, 10), bahasa: 'Indonesia',
});
const newCinema = () => ({ nama_bioskop: '', kota: '', alamat: '', telepon: '' });
const newStudio = () => ({ id_bioskop: '', nama_studio: '', kapasitas: '50', tipe: 'REGULER', lantai: '1' });
const newSchedule = () => ({
  id_film: '', id_studio: '', tanggal: new Date().toISOString().slice(0, 10),
  jam_mulai: '13:00', jam_selesai: '15:00', harga: '50000',
});

export default function AdminDashboard() {
  const [films, setFilms] = useState<Film[]>([]);
  const [schedules, setSchedules] = useState<Jadwal[]>([]);
  const [cinemas, setCinemas] = useState<Bioskop[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [section, setSection] = useState<Section>('film');
  const [filmForm, setFilmForm] = useState(newFilm());
  const [cinemaForm, setCinemaForm] = useState(newCinema());
  const [studioForm, setStudioForm] = useState(newStudio());
  const [scheduleForm, setScheduleForm] = useState(newSchedule());
  const [editing, setEditing] = useState<{ type: Section | 'studio'; id: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      const [filmRes, scheduleRes, cinemaRes, studioRes] = await Promise.all([
        api.get<Film[]>('/film'), api.get<Jadwal[]>('/jadwal'),
        api.get<Bioskop[]>('/bioskop'), api.get<Studio[]>('/studio'),
      ]);
      setFilms(filmRes.data); setSchedules(scheduleRes.data);
      setCinemas(cinemaRes.data); setStudios(studioRes.data);
      setScheduleForm((value) => ({ ...value,
        id_film: value.id_film || String(filmRes.data[0]?.id_film || ''),
        id_studio: value.id_studio || String(studioRes.data[0]?.id_studio || ''),
      }));
      setStudioForm((value) => ({ ...value,
        id_bioskop: value.id_bioskop || String(cinemaRes.data[0]?.id_bioskop || ''),
      }));
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    queueMicrotask(() => void loadData());
  }, []);

  const averagePrice = useMemo(() => schedules.length
    ? schedules.reduce((sum, item) => sum + Number(item.harga), 0) / schedules.length : 0, [schedules]);

  const finish = async (message: string) => {
    setEditing(null); setSuccess(message); setError(''); await loadData();
  };

  const submitFilm = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...filmForm, durasi: Number(filmForm.durasi), poster_url: filmForm.poster_url || undefined,
        tanggal_rilis: new Date(filmForm.tanggal_rilis).toISOString() };
      if (editing?.type === 'film') await api.patch(`/film/${editing.id}`, payload);
      else await api.post('/film', payload);
      setFilmForm(newFilm()); await finish(editing ? 'Film berhasil diperbarui.' : 'Film berhasil ditambahkan.');
    } catch (requestError) { setError(getApiError(requestError)); } finally { setSaving(false); }
  };

  const submitCinema = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      if (editing?.type === 'lokasi') await api.patch(`/bioskop/${editing.id}`, cinemaForm);
      else await api.post('/bioskop', cinemaForm);
      setCinemaForm(newCinema()); await finish(editing ? 'Bioskop berhasil diperbarui.' : 'Bioskop berhasil ditambahkan.');
    } catch (requestError) { setError(getApiError(requestError)); } finally { setSaving(false); }
  };

  const submitStudio = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...studioForm, id_bioskop: Number(studioForm.id_bioskop),
        kapasitas: Number(studioForm.kapasitas), lantai: Number(studioForm.lantai) };
      if (editing?.type === 'studio') await api.patch(`/studio/${editing.id}`, payload);
      else await api.post('/studio', payload);
      setStudioForm(newStudio()); await finish(editing ? 'Studio dan kursinya berhasil diperbarui.' : 'Studio beserta kursinya berhasil dibuat.');
    } catch (requestError) { setError(getApiError(requestError)); } finally { setSaving(false); }
  };

  const submitSchedule = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...scheduleForm, id_film: Number(scheduleForm.id_film),
        id_studio: Number(scheduleForm.id_studio), tanggal: new Date(scheduleForm.tanggal).toISOString() };
      if (editing?.type === 'jadwal') await api.patch(`/jadwal/${editing.id}`, payload);
      else await api.post('/jadwal', payload);
      setScheduleForm(newSchedule()); await finish(editing ? 'Jadwal berhasil diperbarui.' : 'Jadwal dan slot kursinya berhasil dibuat.');
    } catch (requestError) { setError(getApiError(requestError)); } finally { setSaving(false); }
  };

  const remove = async (type: Section | 'studio', id: number, label: string) => {
    if (!window.confirm(`Hapus ${label}?`)) return;
    const endpoint = type === 'lokasi' ? 'bioskop' : type;
    try { await api.delete(`/${endpoint}/${id}`); await finish(`${label} berhasil dihapus.`); }
    catch (requestError) { setError(getApiError(requestError)); }
  };

  const cancelEdit = () => {
    setEditing(null); setFilmForm(newFilm()); setCinemaForm(newCinema());
    setStudioForm(newStudio()); setScheduleForm(newSchedule());
  };

  if (loading) return <div className="container page-loader"><LoadingState label="Memuat dashboard admin..." /></div>;

  return <div className="page-content admin-page">
    <section className="page-hero compact-hero"><div className="container"><p className="eyebrow">Panel admin</p><h1>Operasional CineTix</h1><p>Kelola katalog, lokasi, studio, kursi otomatis, dan jadwal tayang.</p></div></section>
    <section className="section"><div className="container">
      {error && <ErrorBanner message={error} />}{success && <div className="alert alert-success">{success}</div>}
      <div className="admin-stats"><article><span>Film</span><strong>{films.length}</strong></article><article><span>Jadwal</span><strong>{schedules.length}</strong></article><article><span>Studio</span><strong>{studios.length}</strong></article><article><span>Rata-rata tiket</span><strong>{formatCurrency(averagePrice)}</strong></article></div>
      <div className="admin-tabs" role="tablist">
        <button className={section === 'film' ? 'active' : ''} onClick={() => { setSection('film'); cancelEdit(); }}>Film</button>
        <button className={section === 'lokasi' ? 'active' : ''} onClick={() => { setSection('lokasi'); cancelEdit(); }}>Bioskop & studio</button>
        <button className={section === 'jadwal' ? 'active' : ''} onClick={() => { setSection('jadwal'); cancelEdit(); }}>Jadwal</button>
        <button className={section === 'riwayat' ? 'active' : ''} onClick={() => setSection('riwayat')}>Riwayat Pemesanan</button>
      </div>

      {section === 'film' && <div className="admin-workspace">
        <form className="admin-panel admin-form" onSubmit={submitFilm}><h2>{editing?.type === 'film' ? 'Ubah film' : 'Tambah film'}</h2>
          <label>Judul<input value={filmForm.judul} onChange={(e) => setFilmForm({ ...filmForm, judul: e.target.value })} required /></label>
          <div className="form-row"><label>Genre<input value={filmForm.genre} onChange={(e) => setFilmForm({ ...filmForm, genre: e.target.value })} required /></label><label>Rating<input value={filmForm.rating} onChange={(e) => setFilmForm({ ...filmForm, rating: e.target.value })} required /></label></div>
          <div className="form-row"><label>Durasi<input type="number" min="1" value={filmForm.durasi} onChange={(e) => setFilmForm({ ...filmForm, durasi: e.target.value })} required /></label><label>Bahasa<input value={filmForm.bahasa} onChange={(e) => setFilmForm({ ...filmForm, bahasa: e.target.value })} required /></label></div>
          <label>Tanggal rilis<input type="date" value={filmForm.tanggal_rilis} onChange={(e) => setFilmForm({ ...filmForm, tanggal_rilis: e.target.value })} required /></label><label>URL poster<input value={filmForm.poster_url} onChange={(e) => setFilmForm({ ...filmForm, poster_url: e.target.value })} /></label><label>Sinopsis<textarea value={filmForm.sinopsis} onChange={(e) => setFilmForm({ ...filmForm, sinopsis: e.target.value })} required /></label>
          <div className="form-actions"><button className="button button-primary" disabled={saving}>Simpan</button>{editing && <button type="button" className="button button-secondary" onClick={cancelEdit}>Batal</button>}</div>
        </form>
        <div className="admin-panel admin-list"><h2>Daftar film</h2>{films.map((film) => <article key={film.id_film}><div><strong>{film.judul}</strong><span>{film.genre} · {film.durasi} menit</span></div><div><button onClick={() => { setEditing({ type: 'film', id: film.id_film }); setFilmForm({ ...film, durasi: String(film.durasi), poster_url: film.poster_url || '', tanggal_rilis: film.tanggal_rilis.slice(0, 10) }); }}>Ubah</button><button className="danger-link" onClick={() => void remove('film', film.id_film, film.judul)}>Hapus</button></div></article>)}</div>
      </div>}

      {section === 'lokasi' && <div className="admin-location-grid">
        <form className="admin-panel admin-form" onSubmit={submitCinema}><h2>{editing?.type === 'lokasi' ? 'Ubah bioskop' : 'Tambah bioskop'}</h2><label>Nama<input value={cinemaForm.nama_bioskop} onChange={(e) => setCinemaForm({ ...cinemaForm, nama_bioskop: e.target.value })} required /></label><label>Kota<input value={cinemaForm.kota} onChange={(e) => setCinemaForm({ ...cinemaForm, kota: e.target.value })} required /></label><label>Alamat<textarea value={cinemaForm.alamat} onChange={(e) => setCinemaForm({ ...cinemaForm, alamat: e.target.value })} required /></label><label>Telepon<input value={cinemaForm.telepon} onChange={(e) => setCinemaForm({ ...cinemaForm, telepon: e.target.value })} required /></label><div className="form-actions"><button className="button button-primary" disabled={saving}>Simpan</button>{editing?.type === 'lokasi' && <button type="button" className="button button-secondary" onClick={cancelEdit}>Batal</button>}</div></form>
        <form className="admin-panel admin-form" onSubmit={submitStudio}><h2>{editing?.type === 'studio' ? 'Ubah studio' : 'Tambah studio'}</h2><label>Bioskop<select value={studioForm.id_bioskop} onChange={(e) => setStudioForm({ ...studioForm, id_bioskop: e.target.value })} required>{cinemas.map((item) => <option value={item.id_bioskop} key={item.id_bioskop}>{item.nama_bioskop}</option>)}</select></label><label>Nama studio<input value={studioForm.nama_studio} onChange={(e) => setStudioForm({ ...studioForm, nama_studio: e.target.value })} required /></label><div className="form-row"><label>Kapasitas<input type="number" min="1" value={studioForm.kapasitas} onChange={(e) => setStudioForm({ ...studioForm, kapasitas: e.target.value })} required /></label><label>Lantai<input type="number" min="1" value={studioForm.lantai} onChange={(e) => setStudioForm({ ...studioForm, lantai: e.target.value })} required /></label></div><label>Tipe<select value={studioForm.tipe} onChange={(e) => setStudioForm({ ...studioForm, tipe: e.target.value })}><option>REGULER</option><option>IMAX</option><option>4DX</option></select></label><p className="form-hint">Kursi dibuat otomatis, 10 kursi per baris.</p><div className="form-actions"><button className="button button-primary" disabled={saving}>Simpan</button>{editing?.type === 'studio' && <button type="button" className="button button-secondary" onClick={cancelEdit}>Batal</button>}</div></form>
        <div className="admin-panel admin-list admin-list-wide"><h2>Lokasi dan studio</h2>{cinemas.map((cinema) => <article key={cinema.id_bioskop}><div><strong>{cinema.nama_bioskop}</strong><span>{cinema.kota} · {cinema.alamat}</span>{studios.filter((studio) => studio.id_bioskop === cinema.id_bioskop).map((studio) => <small key={studio.id_studio}>{studio.nama_studio} · {studio.kapasitas} kursi <button onClick={() => { setEditing({ type: 'studio', id: studio.id_studio }); setStudioForm({ id_bioskop: String(studio.id_bioskop), nama_studio: studio.nama_studio, kapasitas: String(studio.kapasitas), tipe: studio.tipe, lantai: String(studio.lantai) }); }}>Ubah</button> <button className="danger-link" onClick={() => void remove('studio', studio.id_studio, studio.nama_studio)}>Hapus</button></small>)}</div><div><button onClick={() => { setEditing({ type: 'lokasi', id: cinema.id_bioskop }); setCinemaForm({ nama_bioskop: cinema.nama_bioskop, kota: cinema.kota, alamat: cinema.alamat, telepon: cinema.telepon || '' }); }}>Ubah</button><button className="danger-link" onClick={() => void remove('lokasi', cinema.id_bioskop, cinema.nama_bioskop)}>Hapus</button></div></article>)}</div>
      </div>}

      {section === 'jadwal' && <div className="admin-workspace">
        <form className="admin-panel admin-form" onSubmit={submitSchedule}><h2>{editing?.type === 'jadwal' ? 'Ubah jadwal' : 'Tambah jadwal'}</h2><label>Film<select value={scheduleForm.id_film} onChange={(e) => setScheduleForm({ ...scheduleForm, id_film: e.target.value })} required>{films.map((film) => <option value={film.id_film} key={film.id_film}>{film.judul}</option>)}</select></label><label>Studio<select value={scheduleForm.id_studio} onChange={(e) => setScheduleForm({ ...scheduleForm, id_studio: e.target.value })} required>{studios.map((studio) => <option value={studio.id_studio} key={studio.id_studio}>{studio.bioskop.nama_bioskop} - {studio.nama_studio}</option>)}</select></label><div className="form-row"><label>Tanggal<input type="date" value={scheduleForm.tanggal} onChange={(e) => setScheduleForm({ ...scheduleForm, tanggal: e.target.value })} required /></label><label>Harga<input value={scheduleForm.harga} onChange={(e) => setScheduleForm({ ...scheduleForm, harga: e.target.value })} required /></label></div><div className="form-row"><label>Mulai<input type="time" value={scheduleForm.jam_mulai} onChange={(e) => setScheduleForm({ ...scheduleForm, jam_mulai: e.target.value })} required /></label><label>Selesai<input type="time" value={scheduleForm.jam_selesai} onChange={(e) => setScheduleForm({ ...scheduleForm, jam_selesai: e.target.value })} required /></label></div><div className="form-actions"><button className="button button-primary" disabled={saving}>Simpan</button>{editing && <button type="button" className="button button-secondary" onClick={cancelEdit}>Batal</button>}</div></form>
        <div className="admin-panel admin-list"><h2>Daftar jadwal</h2>{schedules.map((item) => <article key={item.id_jadwal}><div><strong>{item.film.judul}</strong><span>{formatDate(item.tanggal)} · {item.jam_mulai}-{item.jam_selesai}</span><small>{item.studio.nama_studio} · {formatCurrency(item.harga)}</small></div><div><button onClick={() => { setEditing({ type: 'jadwal', id: item.id_jadwal }); setScheduleForm({ id_film: String(item.id_film), id_studio: String(item.id_studio), tanggal: item.tanggal.slice(0, 10), jam_mulai: item.jam_mulai, jam_selesai: item.jam_selesai, harga: String(item.harga) }); }}>Ubah</button><button className="danger-link" onClick={() => void remove('jadwal', item.id_jadwal, `jadwal ${item.film.judul}`)}>Hapus</button></div></article>)}</div>
      </div>}

      {section === 'riwayat' && <AdminBookingHistory />}
    </div></section>
  </div>;
}
