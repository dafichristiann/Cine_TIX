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

  const inputClass = "mt-1.5 block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 text-sm placeholder-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 focus:outline-none transition";
  const labelClass = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4";

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><LoadingState label="Memuat dashboard admin..." /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12 w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/60 py-8 px-6 sm:px-10 w-full">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">Panel Admin</p>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-white">Operasional CineTix</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">Kelola katalog, lokasi, studio, kursi otomatis, dan jadwal tayang dengan presisi tinggi.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 sm:px-10 mt-8 w-full">
        {error && <ErrorBanner message={error} />}
        {success && <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium animate-in fade-in duration-200">✓ {success}</div>}
        
        {/* Admin Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 w-full">
          {[
            { label: 'Total Film', val: films.length },
            { label: 'Jadwal Aktif', val: schedules.length },
            { label: 'Total Studio', val: studios.length },
            { label: 'Rata-rata Tiket', val: formatCurrency(averagePrice) }
          ].map((stat, i) => (
            <article key={i} className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{stat.label}</span>
              <strong className="block text-2xl font-bold text-white mt-1 font-mono">{stat.val}</strong>
            </article>
          ))}
        </div>

        {/* Custom Admin Tabs Navigation */}
        <div className="flex border-b border-slate-800 space-x-2 mb-8 overflow-x-auto pb-px" role="tablist">
          {(['film', 'lokasi', 'jadwal', 'riwayat'] as const).map((tab) => (
            <button
              key={tab}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition capitalize whitespace-nowrap ${
                section === tab 
                  ? 'border-teal-500 text-teal-400 font-semibold' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
              onClick={() => { setSection(tab); if(tab !== 'riwayat') cancelEdit(); }}
            >
              {tab === 'lokasi' ? 'Bioskop & Studio' : tab === 'riwayat' ? 'Riwayat Pemesanan' : tab}
            </button>
          ))}
        </div>

        {/* WORKSPACE: FILM */}
        {section === 'film' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
            {/* FORM ENTRI/EDIT DATA FILM */}
            <form className="lg:col-span-5 bg-slate-900 border border-slate-800/80 p-6 rounded-3xl shadow-xl space-y-4" onSubmit={submitFilm}>
              <h2 className="text-base font-extrabold text-white mb-2 tracking-tight flex items-center gap-2">
                {editing?.type === 'film' ? '⚡ Edit Detail Film' : '🎬 Entri Film Baru'}
              </h2>
              
              <label className={labelClass}>Judul Film<input className={inputClass} placeholder="Contoh: Avengers: Endgame" value={filmForm.judul} onChange={(e) => setFilmForm({ ...filmForm, judul: e.target.value })} required /></label>
              
              <div className="grid grid-cols-2 gap-4">
                <label className={labelClass}>Genre<input className={inputClass} placeholder="Aksi, Petualangan" value={filmForm.genre} onChange={(e) => setFilmForm({ ...filmForm, genre: e.target.value })} required /></label>
                <label className={labelClass}>Rating<input className={inputClass} placeholder="R13+ / SU" value={filmForm.rating} onChange={(e) => setFilmForm({ ...filmForm, rating: e.target.value })} required /></label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <label className={labelClass}>Durasi (Menit)<input type="number" min="1" className={inputClass} value={filmForm.durasi} onChange={(e) => setFilmForm({ ...filmForm, durasi: e.target.value })} required /></label>
                <label className={labelClass}>Bahasa<input className={inputClass} value={filmForm.bahasa} onChange={(e) => setFilmForm({ ...filmForm, bahasa: e.target.value })} required /></label>
              </div>
              
              <label className={labelClass}>Tanggal Rilis Perdana<input type="date" className={inputClass} value={filmForm.tanggal_rilis} onChange={(e) => setFilmForm({ ...filmForm, tanggal_rilis: e.target.value })} required /></label>
              
              {/* INPUT URL POSTER PINTEREST/UNSPLASH */}
              <label className={labelClass}>
                URL Tautan Poster Gambar
                <input 
                  className={inputClass} 
                  placeholder="https://images.unsplash.com/... atau https://i.pinimg.com/..." 
                  value={filmForm.poster_url} 
                  onChange={(e) => setFilmForm({ ...filmForm, poster_url: e.target.value })} 
                />
                <small className="block text-[10px] text-slate-500 font-medium normal-case mt-1.5 leading-normal">
                  💡 Tips: Klik kanan gambar di Pinterest/Unsplash $\rightarrow$ pilih "Copy Image Link" (bukan tautan halaman browser).
                </small>
              </label>

              {/* LIVE POSTER PREVIEW AREA */}
              {filmForm.poster_url && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Pratinjau Gambar Poster:</span>
                  <div className="w-24 aspect-[2/3] mx-auto bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                    <img 
                      src={filmForm.poster_url} 
                      alt="Preview" 
                      className="w-full h-full object-cover object-center"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://i.pinimg.com/1200x/de/56/89/de5689fb82e25e1daebca7a9e1cd6e3f.jpg"; }}
                    />
                  </div>
                </div>
              )}
              
              <label className={labelClass}>Sinopsis Narasi<textarea rows={3} className={inputClass} placeholder="Tulis plot sinopsis ringkas film..." value={filmForm.sinopsis} onChange={(e) => setFilmForm({ ...filmForm, sinopsis: e.target.value })} required /></label>
              
              <div className="flex space-x-3 pt-2">
                <button type="submit" className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs py-3 rounded-xl disabled:opacity-50 transition shadow-lg shadow-teal-500/5 focus:outline-none" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan ke Database'}
                </button>
                {editing && <button type="button" className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-4 rounded-xl transition" onClick={cancelEdit}>Batal</button>}
              </div>
            </form>

            {/* DAFTAR KATALOG FILM KANAN */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800/80 p-6 rounded-3xl shadow-xl">
              <h2 className="text-base font-extrabold text-white mb-5 tracking-tight">Daftar Katalog Film Aktif</h2>
              <div className="space-y-3 max-h-[660px] overflow-y-auto pr-2 custom-scrollbar">
                {films.map((film) => (
                  <article key={film.id_film} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between hover:border-slate-700 transition duration-150 shadow-sm">
                    <div className="flex items-center space-x-4 overflow-hidden">
                      {/* Thumbnail mini */}
                      <div className="w-9 h-12 bg-slate-900 border border-slate-800 rounded overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-black text-slate-600 font-mono">
                        {film.poster_url ? (
                          <img src={film.poster_url} alt="" className="w-full h-full object-cover" />
                        ) : 'NO IM'}
                      </div>
                      <div className="truncate">
                        <strong className="block text-sm font-bold text-slate-200 truncate">{film.judul}</strong>
                        <span className="text-xs text-slate-500 mt-0.5 block truncate">{film.genre} · {film.durasi} menit · <span className="text-teal-400 font-mono font-bold">{film.rating}</span></span>
                      </div>
                    </div>
                    <div className="flex space-x-2 shrink-0">
                      <button className="text-xs font-semibold text-teal-400 hover:text-teal-300 px-3 py-1.5 rounded-lg bg-teal-500/5 hover:bg-teal-500/10 transition border border-teal-500/10" onClick={() => { setEditing({ type: 'film', id: film.id_film }); setFilmForm({ ...film, durasi: String(film.durasi), poster_url: film.poster_url || '', tanggal_rilis: film.tanggal_rilis.slice(0, 10) }); }}>Ubah</button>
                      <button className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 transition border border-rose-500/10" onClick={() => void remove('film', film.id_film, film.judul)}>Hapus</button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE: LOKASI & STUDIO */}
        {section === 'lokasi' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
            <form className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl" onSubmit={submitCinema}>
              <h2 className="text-lg font-bold text-white mb-5">{editing?.type === 'lokasi' ? '⚡ Ubah Bioskop' : '🏢 Tambah Bioskop'}</h2>
              <label className={labelClass}>Nama Bioskop<input className={inputClass} value={cinemaForm.nama_bioskop} onChange={(e) => setCinemaForm({ ...cinemaForm, nama_bioskop: e.target.value })} required /></label>
              <label className={labelClass}>Kota<input className={inputClass} value={cinemaForm.kota} onChange={(e) => setCinemaForm({ ...cinemaForm, town: e.target.value } as any)} required /></label>
              <label className={labelClass}>Alamat Lengkap<textarea rows={2} className={inputClass} value={cinemaForm.alamat} onChange={(e) => setCinemaForm({ ...cinemaForm, alamat: e.target.value })} required /></label>
              <label className={labelClass}>Telepon<input className={inputClass} value={cinemaForm.telepon} onChange={(e) => setCinemaForm({ ...cinemaForm, telepon: e.target.value })} required /></label>
              <div className="flex space-x-2 pt-2"><button className="flex-1 bg-teal-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition" disabled={saving}>Simpan</button>{editing?.type === 'lokasi' && <button type="button" className="bg-slate-800 text-slate-200 text-xs px-4 py-2.5 rounded-xl transition" onClick={cancelEdit}>Batal</button>}</div>
            </form>
            
            <form className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl" onSubmit={submitStudio}>
              <h2 className="text-lg font-bold text-white mb-5">{editing?.type === 'studio' ? '⚡ Ubah Studio' : '🎞️ Tambah Studio'}</h2>
              <label className={labelClass}>Bioskop Induk<select className={inputClass} value={studioForm.id_bioskop} onChange={(e) => setStudioForm({ ...studioForm, id_bioskop: e.target.value })} required>{cinemas.map((item) => <option value={item.id_bioskop} key={item.id_bioskop}>{item.nama_bioskop}</option>)}</select></label>
              <label className={labelClass}>Nama Studio<input className={inputClass} value={studioForm.nama_studio} onChange={(e) => setStudioForm({ ...studioForm, nama_studio: e.target.value })} required /></label>
              <div className="grid grid-cols-2 gap-4"><label className={labelClass}>Kapasitas Kursi<input type="number" min="1" className={inputClass} value={studioForm.kapasitas} onChange={(e) => setStudioForm({ ...studioForm, kapasitas: e.target.value })} required /></label><label className={labelClass}>Lantai<input type="number" min="1" className={inputClass} value={studioForm.lantai} onChange={(e) => setStudioForm({ ...studioForm, lantai: e.target.value })} required /></label></div>
              <label className={labelClass}>Tipe Studio<select className={inputClass} value={studioForm.tipe} onChange={(e) => setStudioForm({ ...studioForm, tipe: e.target.value })}><option>REGULER</option><option>IMAX</option><option>4DX</option></select></label>
              <p className="text-[10px] text-teal-400/80 bg-teal-500/5 border border-teal-500/10 p-2.5 rounded-lg mb-4 leading-normal">✨ Skema Layout: Barisan kursi akan ter-generate otomatis (10 kursi/baris).</p>
              <div className="flex space-x-2"><button className="flex-1 bg-teal-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition" disabled={saving}>Simpan</button>{editing?.type === 'studio' && <button type="button" className="bg-slate-800 text-slate-200 text-xs px-4 py-2.5 rounded-xl transition" onClick={cancelEdit}>Batal</button>}</div>
            </form>

            <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl lg:max-h-[640px] overflow-y-auto">
              <h2 className="text-lg font-bold text-white mb-5">Struktur Cabang & Studio</h2>
              <div className="space-y-4">
                {cinemas.map((cinema) => (
                  <article key={cinema.id_bioskop} className="bg-slate-950 border border-slate-800/60 p-4 rounded-xl">
                    <div className="flex justify-between items-start border-b border-slate-800 pb-2 mb-3">
                      <div><strong className="text-sm font-semibold text-slate-200 block">{cinema.nama_bioskop}</strong><span className="text-xs text-slate-400">{cinema.kota}</span></div>
                      <div className="flex space-x-2"><button className="text-[11px] font-bold text-teal-400 hover:underline" onClick={() => { setEditing({ type: 'lokasi', id: cinema.id_bioskop }); setCinemaForm({ nama_bioskop: cinema.nama_bioskop, kota: cinema.kota, alamat: cinema.alamat, telepon: cinema.telepon || '' }); }}>Edit</button><button className="text-[11px] font-bold text-rose-400 hover:underline" onClick={() => void remove('lokasi', cinema.id_bioskop, cinema.nama_bioskop)}>Hapus</button></div>
                    </div>
                    <div className="space-y-2">
                      {studios.filter((s) => s.id_bioskop === cinema.id_bioskop).map((studio) => (
                        <div key={studio.id_studio} className="flex justify-between items-center bg-slate-900/50 px-2.5 py-1.5 rounded border border-slate-800/40 text-xs text-slate-300">
                          <span>{studio.nama_studio} ({studio.tipe}) · <span className="text-slate-400">{studio.kapasitas} Kursi</span></span>
                          <div className="space-x-2"><button className="text-teal-400 hover:text-teal-300" onClick={() => { setEditing({ type: 'studio', id: studio.id_studio }); setStudioForm({ id_bioskop: String(studio.id_bioskop), nama_studio: studio.nama_studio, kapasitas: String(studio.kapasitas), tipe: studio.tipe, lantai: String(studio.lantai) }); }}>Ubah</button><button className="text-rose-400 hover:text-rose-300" onClick={() => void remove('studio', studio.id_studio, studio.nama_studio)}>Hapus</button></div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE: JADWAL TAYANG */}
        {section === 'jadwal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
            <form className="lg:col-span-5 bg-slate-900 border border-slate-800/80 p-6 rounded-2xl" onSubmit={submitSchedule}>
              <h2 className="text-lg font-bold text-white mb-5">{editing?.type === 'jadwal' ? '⚡ Ubah Jadwal' : '📅 Tambah Jadwal'}</h2>
              <label className={labelClass}>Pilih Film<select className={inputClass} value={scheduleForm.id_film} onChange={(e) => setScheduleForm({ ...scheduleForm, id_film: e.target.value })} required>{films.map((film) => <option value={film.id_film} key={film.id_film}>{film.judul}</option>)}</select></label>
              <label className={labelClass}>Pilih Studio Target<select className={inputClass} value={scheduleForm.id_studio} onChange={(e) => setScheduleForm({ ...scheduleForm, id_studio: e.target.value })} required>{studios.map((studio) => <option value={studio.id_studio} key={studio.id_studio}>{studio.bioskop?.nama_bioskop} - {studio.nama_studio}</option>)}</select></label>
              <div className="grid grid-cols-2 gap-4"><label className={labelClass}>Tanggal Operasional<input type="date" className={inputClass} value={scheduleForm.tanggal} onChange={(e) => setScheduleForm({ ...scheduleForm, tanggal: e.target.value })} required /></label><label className={labelClass}>Harga Tiket (Rp)<input className={inputClass} value={scheduleForm.harga} onChange={(e) => setScheduleForm({ ...scheduleForm, harga: e.target.value })} required /></label></div>
              <div className="grid grid-cols-2 gap-4"><label className={labelClass}>Jam Mulai<input type="time" className={inputClass} value={scheduleForm.jam_mulai} onChange={(e) => setScheduleForm({ ...scheduleForm, jam_mulai: e.target.value })} required /></label><label className={labelClass}>Jam Selesai<input type="time" className={inputClass} value={scheduleForm.jam_selesai} onChange={(e) => setScheduleForm({ ...scheduleForm, jam_selesai: e.target.value })} required /></label></div>
              <div className="flex space-x-3 pt-2"><button className="flex-1 bg-teal-500 text-slate-950 font-bold text-xs py-3 rounded-xl transition" disabled={saving}>Simpan Jadwal</button>{editing && <button type="button" className="bg-slate-800 text-slate-200 text-xs px-4 rounded-xl transition" onClick={cancelEdit}>Batal</button>}</div>
            </form>
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800/80 p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-5">Daftar Slot Jadwal Bioskop</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {schedules.map((item) => (
                  <article key={item.id_jadwal} className="bg-slate-950 border border-slate-800/60 p-4 rounded-xl flex items-center justify-between hover:border-slate-700 transition">
                    <div>
                      <strong className="block text-slate-200 font-medium">{item.film?.judul}</strong>
                      <span className="text-xs text-slate-400 mt-0.5 block">{formatDate(item.tanggal)} · {item.jam_mulai} - {item.jam_selesai}</span>
                      <small className="text-[11px] text-teal-400 bg-teal-500/5 px-2 py-0.5 rounded border border-teal-500/10 mt-1.5 inline-block">{item.studio?.nama_studio} · {formatCurrency(item.harga)}</small>
                    </div>
                    <div className="flex space-x-2"><button className="text-xs font-semibold text-teal-400 hover:text-teal-300 px-3 py-1.5 rounded-lg bg-teal-500/5 hover:bg-teal-500/10 transition border border-teal-500/10" onClick={() => { setEditing({ type: 'jadwal', id: item.id_jadwal }); setScheduleForm({ id_film: String(item.id_film), id_studio: String(item.id_studio), tanggal: item.tanggal.slice(0, 10), jam_mulai: item.jam_mulai, jam_selesai: item.jam_selesai, harga: String(item.harga) }); }}>Ubah</button><button className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 transition border border-rose-500/10" onClick={() => void remove('jadwal', item.id_jadwal, `jadwal ${item.film?.judul}`)}>Hapus</button></div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE: RIWAYAT PEMESANAN */}
        {section === 'riwayat' && <AdminBookingHistory />}
      </section>
    </div>
  );
}