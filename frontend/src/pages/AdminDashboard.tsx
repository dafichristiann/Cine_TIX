import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import api, { getApiError } from '../api/axios';
import PosterImage from '../components/PosterImage';
import { ErrorBanner, LoadingState } from '../components/Status';
import { useAuth } from '../context/auth';
import { formatCurrency, formatDate, getInitials } from '../lib/format';
import type { Bioskop, Film, Jadwal, Studio } from '../types';
import AdminBookingHistory from './AdminBookingHistory';

type Section = 'dashboard' | 'film' | 'jadwal' | 'users' | 'riwayat';
type EditType = 'film' | 'jadwal' | 'lokasi' | 'studio';
type AdminUser = {
  id_pengguna: number;
  nama: string | null;
  email: string;
  role: string;
  status?: string;
  tanggal_daftar?: string;
};

const newFilm = () => ({
  judul: '',
  genre: '',
  durasi: '120',
  rating: 'R13+',
  sinopsis: '',
  poster_url: '',
  tanggal_rilis: new Date().toISOString().slice(0, 10),
  bahasa: 'Indonesia',
});

const newCinema = () => ({ nama_bioskop: '', kota: '', alamat: '', telepon: '' });
const newStudio = () => ({ id_bioskop: '', nama_studio: '', kapasitas: '50', tipe: 'REGULER', lantai: '1' });
const newSchedule = () => ({
  id_film: '',
  id_studio: '',
  tanggal: new Date().toISOString().slice(0, 10),
  jam_mulai: '13:00',
  jam_selesai: '15:00',
  harga: '50000',
});

const navItems: Array<{ key: Section; label: string; icon: string }> = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'film', label: 'Movies', icon: 'movie' },
  { key: 'jadwal', label: 'Schedule', icon: 'calendar_month' },
  { key: 'users', label: 'Users', icon: 'group' },
  { key: 'riwayat', label: 'Transactions', icon: 'payments' },
];

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [films, setFilms] = useState<Film[]>([]);
  const [schedules, setSchedules] = useState<Jadwal[]>([]);
  const [cinemas, setCinemas] = useState<Bioskop[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [section, setSection] = useState<Section>('dashboard');
  const [filmForm, setFilmForm] = useState(newFilm());
  const [cinemaForm, setCinemaForm] = useState(newCinema());
  const [studioForm, setStudioForm] = useState(newStudio());
  const [scheduleForm, setScheduleForm] = useState(newSchedule());
  const [editing, setEditing] = useState<{ type: EditType; id: number } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [movieSearch, setMovieSearch] = useState('');
  const [movieGenre, setMovieGenre] = useState('ALL');
  const [movieStatus, setMovieStatus] = useState('ALL');
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleMovie, setScheduleMovie] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      const [filmRes, scheduleRes, cinemaRes, studioRes, userRes] = await Promise.all([
        api.get<Film[]>('/film'),
        api.get<Jadwal[]>('/jadwal'),
        api.get<Bioskop[]>('/bioskop'),
        api.get<Studio[]>('/studio'),
        api.get<AdminUser[]>('/pengguna'),
      ]);
      setFilms(filmRes.data);
      setSchedules(scheduleRes.data);
      setCinemas(cinemaRes.data);
      setStudios(studioRes.data);
      setUsers(userRes.data);
      setScheduleForm((value) => ({
        ...value,
        id_film: value.id_film || String(filmRes.data[0]?.id_film || ''),
        id_studio: value.id_studio || String(studioRes.data[0]?.id_studio || ''),
      }));
      setStudioForm((value) => ({
        ...value,
        id_bioskop: value.id_bioskop || String(cinemaRes.data[0]?.id_bioskop || ''),
      }));
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => void loadData());
  }, []);

  const stats = useMemo(() => {
    const averagePrice = schedules.length
      ? schedules.reduce((sum, item) => sum + Number(item.harga), 0) / schedules.length
      : 0;
    return [
      { label: 'Movies', value: films.length, icon: 'movie' },
      { label: 'Schedules', value: schedules.length, icon: 'calendar_month' },
      { label: 'Studios', value: studios.length, icon: 'weekend' },
      { label: 'Avg. Ticket', value: formatCurrency(averagePrice), icon: 'payments' },
    ];
  }, [films.length, schedules, studios.length]);

  const genres = useMemo(() => {
    return Array.from(
      new Set(
        films.flatMap((film) =>
          film.genre
            ?.split(',')
            .map((g) => g.trim())
            .filter(Boolean) || []
        )
      )
    ).sort();
  }, [films]);
  const movieStatuses = useMemo(() => Array.from(new Set(films.map((film) => film.status).filter(Boolean))).sort(), [films]);

  const filteredFilms = useMemo(() => {
    const normalizedSearch = movieSearch.trim().toLowerCase();

    return films.filter((film) => {
      const matchesSearch = !normalizedSearch
        || film.judul.toLowerCase().includes(normalizedSearch)
        || String(film.id_film).includes(normalizedSearch);
      const matchesGenre =
        movieGenre === 'ALL' ||
        film.genre
          .split(',')
          .map((g) => g.trim())
          .includes(movieGenre);
      const matchesStatus = movieStatus === 'ALL' || film.status === movieStatus;

      return matchesSearch && matchesGenre && matchesStatus;
    });
  }, [films, movieGenre, movieSearch, movieStatus]);

  const filteredSchedules = useMemo(() => {
    const normalizedSearch = scheduleSearch.trim().toLowerCase();

    return schedules.filter((item) => {
      const studioName = item.studio.nama_studio.toLowerCase();
      const movieTitle = item.film.judul.toLowerCase();
      const scheduleId = String(item.id_jadwal);
      const matchesSearch = !normalizedSearch
        || movieTitle.includes(normalizedSearch)
        || studioName.includes(normalizedSearch)
        || scheduleId.includes(normalizedSearch);
      const matchesDate = !scheduleDate || item.tanggal.slice(0, 10) === scheduleDate;
      const matchesMovie = scheduleMovie === 'ALL' || String(item.id_film) === scheduleMovie;

      return matchesSearch && matchesDate && matchesMovie;
    });
  }, [scheduleDate, scheduleMovie, scheduleSearch, schedules]);

  const resetForms = () => {
    setEditing(null);
    setShowForm(false);
    setFilmForm(newFilm());
    setCinemaForm(newCinema());
    setStudioForm(newStudio());
    setScheduleForm(newSchedule());
  };

  const switchSection = (next: Section) => {
    setSection(next);
    setSuccess('');
    resetForms();
  };

  const finish = async (message: string) => {
    setSuccess(message);
    setError('');
    resetForms();
    await loadData();
  };

  const submitFilm = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...filmForm,
        durasi: Number(filmForm.durasi),
        poster_url: filmForm.poster_url || undefined,
        tanggal_rilis: new Date(filmForm.tanggal_rilis).toISOString(),
      };
      if (editing?.type === 'film') await api.patch(`/film/${editing.id}`, payload);
      else await api.post('/film', payload);
      await finish(editing ? 'Film berhasil diperbarui.' : 'Film berhasil ditambahkan.');
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setSaving(false);
    }
  };

  const submitCinema = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing?.type === 'lokasi') await api.patch(`/bioskop/${editing.id}`, cinemaForm);
      else await api.post('/bioskop', cinemaForm);
      await finish(editing ? 'Bioskop berhasil diperbarui.' : 'Bioskop berhasil ditambahkan.');
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setSaving(false);
    }
  };

  const submitStudio = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...studioForm,
        id_bioskop: Number(studioForm.id_bioskop),
        kapasitas: Number(studioForm.kapasitas),
        lantai: Number(studioForm.lantai),
      };
      if (editing?.type === 'studio') await api.patch(`/studio/${editing.id}`, payload);
      else await api.post('/studio', payload);
      await finish(editing ? 'Studio berhasil diperbarui.' : 'Studio berhasil dibuat.');
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setSaving(false);
    }
  };

  const submitSchedule = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...scheduleForm,
        id_film: Number(scheduleForm.id_film),
        id_studio: Number(scheduleForm.id_studio),
        tanggal: new Date(scheduleForm.tanggal).toISOString(),
      };
      if (editing?.type === 'jadwal') await api.patch(`/jadwal/${editing.id}`, payload);
      else await api.post('/jadwal', payload);
      await finish(editing ? 'Jadwal berhasil diperbarui.' : 'Jadwal berhasil dibuat.');
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (type: EditType, id: number, label: string) => {
    if (!window.confirm(`Hapus ${label}?`)) return;
    const endpoint = type === 'lokasi' ? 'bioskop' : type;
    try {
      await api.delete(`/${endpoint}/${id}`);
      await finish(`${label} berhasil dihapus.`);
    } catch (requestError) {
      setError(getApiError(requestError));
    }
  };

  const editFilm = (film: Film) => {
    setSection('film');
    setShowForm(true);
    setEditing({ type: 'film', id: film.id_film });
    setFilmForm({
      judul: film.judul,
      genre: film.genre,
      durasi: String(film.durasi),
      rating: film.rating,
      sinopsis: film.sinopsis,
      poster_url: film.poster_url || '',
      tanggal_rilis: film.tanggal_rilis.slice(0, 10),
      bahasa: film.bahasa,
    });
  };

  const editSchedule = (item: Jadwal) => {
    setSection('jadwal');
    setShowForm(true);
    setEditing({ type: 'jadwal', id: item.id_jadwal });
    setScheduleForm({
      id_film: String(item.id_film),
      id_studio: String(item.id_studio),
      tanggal: item.tanggal.slice(0, 10),
      jam_mulai: item.jam_mulai,
      jam_selesai: item.jam_selesai,
      harga: String(item.harga),
    });
  };

  const sectionMeta = {
    dashboard: ['Dashboard', 'Monitor CineTix operations from one focused workspace.'],
    film: ['Movie Management', 'Manage your film catalog, update statuses, and add new releases.'],
    jadwal: ['Schedule Management', 'Manage movie screenings, timings, and studio allocations.'],
    users: ['User Management', 'Manage customer accounts, view registration details, and update statuses.'],
    riwayat: ['Transaction History', 'Review recent customer bookings and payment activity.'],
  }[section];

  if (loading) return <div className="container page-loader"><LoadingState label="Memuat dashboard admin..." /></div>;

  return (
    <div className="admin-shell-v2">
      <aside className="admin-sidebar-v2">
        <div className="admin-brand-v2">
          <span className="admin-brand-icon material-symbols-outlined">movie</span>
          <div>
            <strong>CineTix Admin</strong>
            <small>Management Portal</small>
          </div>
        </div>

        <button className="admin-new-screening" type="button" onClick={() => { setSection('jadwal'); setShowForm(true); setEditing(null); }}>
          <span className="material-symbols-outlined">add</span>
          New Screening
        </button>

        <nav className="admin-side-nav-v2" aria-label="Admin navigation">
          {navItems.map((item) => (
            <button className={section === item.key ? 'active' : ''} key={item.key} type="button" onClick={() => switchSection(item.key)}>
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="logout" type="button" onClick={signOut}><span className="material-symbols-outlined">logout</span>Logout</button>
          <div className="admin-profile-chip">
            <span>{getInitials(user?.nama || user?.email)}</span>
            <div>
              <strong>{user?.nama || 'Admin User'}</strong>
              <small>{user?.email || 'admin@cinetix.com'}</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="admin-main-v2">
        <header className="admin-page-header-v2">
          <div>
            <h1>{sectionMeta[0]}</h1>
            <p>{sectionMeta[1]}</p>
          </div>
          {(section === 'film' || section === 'jadwal') && (
            <button className="admin-primary-action" type="button" onClick={() => { setShowForm(true); setEditing(null); }}>
              <span className="material-symbols-outlined">add</span>
              {section === 'film' ? 'Add New Movie' : 'Add Schedule'}
            </button>
          )}
        </header>

        {error && <ErrorBanner message={error} />}
        {success && <div className="alert alert-success">{success}</div>}

        {section === 'dashboard' && (
          <>
            <div className="admin-stats-v2">
              {stats.map((item) => (
                <article key={item.label}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
            <div className="admin-dashboard-grid">
              <section className="admin-card-v2">
                <h2>Recent Schedules</h2>
                <div className="admin-list-compact">
                  {schedules.slice(0, 5).map((item) => (
                    <article key={item.id_jadwal}>
                      <div>
                        <strong>{item.film.judul}</strong>
                        <span>{formatDate(item.tanggal, { day: 'numeric', month: 'short', year: 'numeric' })} - {item.jam_mulai}</span>
                      </div>
                      <span>{formatCurrency(item.harga)}</span>
                    </article>
                  ))}
                </div>
              </section>
              <section className="admin-card-v2">
                <h2>Studios</h2>
                <div className="admin-list-compact">
                  {studios.slice(0, 5).map((studio) => (
                    <article key={studio.id_studio}>
                      <div>
                        <strong>{studio.nama_studio}</strong>
                        <span>{studio.bioskop.nama_bioskop}</span>
                      </div>
                      <span>{studio.tipe}</span>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}

        {section === 'film' && (
          <>
            <section className="admin-filter-card-v2">
              <label><span className="material-symbols-outlined">search</span><input value={movieSearch} onChange={(event) => setMovieSearch(event.target.value)} placeholder="Search movies by title or ID..." /></label>
              <select value={movieGenre} onChange={(event) => setMovieGenre(event.target.value)}>
                <option value="ALL">All Genres</option>
                {genres.map((genre) => <option value={genre} key={genre}>{genre}</option>)}
              </select>
              <select value={movieStatus} onChange={(event) => setMovieStatus(event.target.value)}>
                <option value="ALL">All Statuses</option>
                {movieStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
              </select>
            </section>

            {showForm && (
              <form className="admin-card-v2 admin-form-v2" onSubmit={submitFilm}>
                <h2>{editing?.type === 'film' ? 'Edit Movie' : 'Add New Movie'}</h2>
                <div className="admin-form-grid">
                  <label>Title<input value={filmForm.judul} onChange={(event) => setFilmForm({ ...filmForm, judul: event.target.value })} required /></label>
                  <label>Genre<input value={filmForm.genre} onChange={(event) => setFilmForm({ ...filmForm, genre: event.target.value })} required /></label>
                  <label>Duration<input type="number" min="1" value={filmForm.durasi} onChange={(event) => setFilmForm({ ...filmForm, durasi: event.target.value })} required /></label>
                  <label>Rating<input value={filmForm.rating} onChange={(event) => setFilmForm({ ...filmForm, rating: event.target.value })} required /></label>
                  <label>Release Date<input type="date" value={filmForm.tanggal_rilis} onChange={(event) => setFilmForm({ ...filmForm, tanggal_rilis: event.target.value })} required /></label>
                  <label>Poster URL<input value={filmForm.poster_url} onChange={(event) => setFilmForm({ ...filmForm, poster_url: event.target.value })} /></label>
                </div>
                <label>Synopsis<textarea value={filmForm.sinopsis} onChange={(event) => setFilmForm({ ...filmForm, sinopsis: event.target.value })} required /></label>
                <div className="admin-form-actions"><button className="button button-primary" disabled={saving}>Save Movie</button><button className="button button-secondary" type="button" onClick={resetForms}>Cancel</button></div>
              </form>
            )}

            <section className="admin-table-card-v2">
              <table className="admin-data-table-v2">
                <thead><tr><th>Poster</th><th>Movie Info</th><th>Genre</th><th>Duration</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredFilms.map((film) => (
                    <tr key={film.id_film}>
                      <td><div className="admin-poster-thumb"><PosterImage film={film} /></div></td>
                      <td><strong>{film.judul}</strong><small>ID: #MOV-{String(film.id_film).padStart(4, '0')}</small></td>
                      <td>{film.genre}</td>
                      <td>{film.durasi} min</td>
                      <td><span className="rating-star">star</span> {film.rating || 'N/A'}</td>
                      <td><span className="admin-status success">Now Showing</span></td>
                      <td><div className="admin-row-actions"><button type="button" onClick={() => editFilm(film)}><span className="material-symbols-outlined">edit</span></button><button type="button" onClick={() => void remove('film', film.id_film, film.judul)}><span className="material-symbols-outlined">delete</span></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination label={`Showing ${filteredFilms.length ? 1 : 0} to ${filteredFilms.length} of ${films.length} entries`} />
            </section>
          </>
        )}

        {section === 'jadwal' && (
          <>
            <section className="admin-filter-card-v2">
              <label><span className="material-symbols-outlined">search</span><input value={scheduleSearch} onChange={(event) => setScheduleSearch(event.target.value)} placeholder="Search by Movie or Studio ID..." /></label>
              <input type="date" value={scheduleDate} onChange={(event) => setScheduleDate(event.target.value)} />
              <select value={scheduleMovie} onChange={(event) => setScheduleMovie(event.target.value)}>
                <option value="ALL">All Movies</option>
                {films.map((film) => <option value={film.id_film} key={film.id_film}>{film.judul}</option>)}
              </select>
              <button type="button" onClick={() => { setScheduleSearch(''); setScheduleDate(''); setScheduleMovie('ALL'); }} aria-label="Reset schedule filters"><span className="material-symbols-outlined">filter_list_off</span></button>
            </section>

            {showForm && (
              <form className="admin-card-v2 admin-form-v2" onSubmit={submitSchedule}>
                <h2>{editing?.type === 'jadwal' ? 'Edit Schedule' : 'Add Schedule'}</h2>
                <div className="admin-form-grid">
                  <label>Movie<select value={scheduleForm.id_film} onChange={(event) => setScheduleForm({ ...scheduleForm, id_film: event.target.value })} required>{films.map((film) => <option value={film.id_film} key={film.id_film}>{film.judul}</option>)}</select></label>
                  <label>Studio<select value={scheduleForm.id_studio} onChange={(event) => setScheduleForm({ ...scheduleForm, id_studio: event.target.value })} required>{studios.map((studio) => <option value={studio.id_studio} key={studio.id_studio}>{studio.bioskop.nama_bioskop} - {studio.nama_studio}</option>)}</select></label>
                  <label>Date<input type="date" value={scheduleForm.tanggal} onChange={(event) => setScheduleForm({ ...scheduleForm, tanggal: event.target.value })} required /></label>
                  <label>Start<input type="time" value={scheduleForm.jam_mulai} onChange={(event) => setScheduleForm({ ...scheduleForm, jam_mulai: event.target.value })} required /></label>
                  <label>End<input type="time" value={scheduleForm.jam_selesai} onChange={(event) => setScheduleForm({ ...scheduleForm, jam_selesai: event.target.value })} required /></label>
                  <label>Price<input value={scheduleForm.harga} onChange={(event) => setScheduleForm({ ...scheduleForm, harga: event.target.value })} required /></label>
                </div>
                <div className="admin-form-actions"><button className="button button-primary" disabled={saving}>Save Schedule</button><button className="button button-secondary" type="button" onClick={resetForms}>Cancel</button></div>
              </form>
            )}

            <section className="admin-table-card-v2">
              <table className="admin-data-table-v2">
                <thead><tr><th>Schedule ID</th><th>Movie</th><th>Date & Time</th><th>Studio</th><th>Ticket Price</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredSchedules.map((item) => (
                    <tr key={item.id_jadwal}>
                      <td><strong>#SCH-{String(item.id_jadwal).padStart(4, '0')}</strong></td>
                      <td><div className="admin-movie-cell"><div className="admin-poster-thumb small"><PosterImage film={item.film} /></div><div><strong>{item.film.judul}</strong><small>{item.film.genre}</small></div></div></td>
                      <td>{formatDate(item.tanggal, { day: 'numeric', month: 'short', year: 'numeric' })}<small>{item.jam_mulai} - {item.jam_selesai}</small></td>
                      <td><span className="studio-pill"><span className="material-symbols-outlined">weekend</span>{item.studio.nama_studio}</span></td>
                      <td>{formatCurrency(item.harga)}</td>
                      <td><span className="admin-status success">Active</span></td>
                      <td><div className="admin-row-actions"><button type="button" onClick={() => editSchedule(item)}><span className="material-symbols-outlined">edit</span></button><button type="button" onClick={() => void remove('jadwal', item.id_jadwal, `jadwal ${item.film.judul}`)}><span className="material-symbols-outlined">delete</span></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination label={`Showing ${filteredSchedules.length ? 1 : 0} to ${filteredSchedules.length} of ${schedules.length} results`} />
            </section>
          </>
        )}

        {section === 'users' && (
          <section className="admin-table-card-v2">
            <table className="admin-data-table-v2">
              <thead><tr><th>User ID</th><th>Full Name</th><th>Email</th><th>Registration Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id_pengguna}>
                    <td><strong>#USR-{String(item.id_pengguna).padStart(4, '0')}</strong></td>
                    <td>{item.nama || '-'}</td>
                    <td>{item.email}</td>
                    <td>{item.tanggal_daftar ? formatDate(item.tanggal_daftar, { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</td>
                    <td><span className={`admin-status ${item.status === 'active' ? 'success' : 'neutral'}`}>{item.status || 'active'}</span></td>
                    <td><span className="admin-muted-action">-</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination label={`Showing 1 to ${users.length} of ${users.length} users`} />
          </section>
        )}

        {section === 'riwayat' && <AdminBookingHistory />}

        {section === 'dashboard' && (
          <section className="admin-card-v2 admin-form-v2">
            <h2>Cinema & Studio Setup</h2>
            <div className="admin-setup-grid">
              <form onSubmit={submitCinema}>
                <h3>{editing?.type === 'lokasi' ? 'Edit Cinema' : 'Add Cinema'}</h3>
                <label>Name<input value={cinemaForm.nama_bioskop} onChange={(event) => setCinemaForm({ ...cinemaForm, nama_bioskop: event.target.value })} required /></label>
                <label>City<input value={cinemaForm.kota} onChange={(event) => setCinemaForm({ ...cinemaForm, kota: event.target.value })} required /></label>
                <label>Address<textarea value={cinemaForm.alamat} onChange={(event) => setCinemaForm({ ...cinemaForm, alamat: event.target.value })} required /></label>
                <label>Phone<input value={cinemaForm.telepon} onChange={(event) => setCinemaForm({ ...cinemaForm, telepon: event.target.value })} required /></label>
                <button className="button button-primary" disabled={saving}>Save Cinema</button>
              </form>
              <form onSubmit={submitStudio}>
                <h3>{editing?.type === 'studio' ? 'Edit Studio' : 'Add Studio'}</h3>
                <label>Cinema<select value={studioForm.id_bioskop} onChange={(event) => setStudioForm({ ...studioForm, id_bioskop: event.target.value })} required>{cinemas.map((item) => <option value={item.id_bioskop} key={item.id_bioskop}>{item.nama_bioskop}</option>)}</select></label>
                <label>Studio Name<input value={studioForm.nama_studio} onChange={(event) => setStudioForm({ ...studioForm, nama_studio: event.target.value })} required /></label>
                <label>Capacity<input type="number" min="1" value={studioForm.kapasitas} onChange={(event) => setStudioForm({ ...studioForm, kapasitas: event.target.value })} required /></label>
                <label>Type<select value={studioForm.tipe} onChange={(event) => setStudioForm({ ...studioForm, tipe: event.target.value })}><option>REGULER</option><option>IMAX</option><option>4DX</option></select></label>
                <button className="button button-primary" disabled={saving}>Save Studio</button>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Pagination({ label }: { label: string }) {
  return (
    <div className="admin-pagination-v2">
      <span>{label}</span>
      <div>
        <button type="button"><span className="material-symbols-outlined">chevron_left</span></button>
        <button className="active" type="button">1</button>
        <button type="button">2</button>
        <button type="button">3</button>
        <button type="button"><span className="material-symbols-outlined">chevron_right</span></button>
      </div>
    </div>
  );
}
