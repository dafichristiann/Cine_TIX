import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getApiError } from '../api/axios';
import FilmCard from '../components/FilmCard';
import FilmCardSkeleton from '../components/FilmCardSkeleton';
import { EmptyState, ErrorBanner } from '../components/Status';
import type { Film } from '../types';

export default function FilmList() {
  const [films, setFilms] = useState<Film[]>([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Film[]>('/film')
      .then((response) => setFilms(response.data))
      .catch((requestError: unknown) => setError(getApiError(requestError)))
      .finally(() => setLoading(false));
  }, []);

  const genres = useMemo(() => [
    'Semua', 
    ...new Set(films.flatMap((film) => film.genre.split(',').map((item) => item.trim())).filter(Boolean))
  ], [films]);
  
  const filtered = films.filter((film) => {
    const matchSearch = film.judul.toLowerCase().includes(search.toLowerCase());
    const matchGenre = genre === 'Semua' || film.genre.toLowerCase().includes(genre.toLowerCase());
    return matchSearch && matchGenre;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500 w-full">
      
      {/* 1. HERO PAGE COMPACT */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/60 py-8 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-4xl">
          <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">Pilih ceritamu</p>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 text-white">Jelajahi Katalog Film CineTix</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">Dari aksi yang memicu adrenalin hingga kisah drama romantis yang menghangatkan hati penonton.</p>
        </div>
      </section>

      {/* 2. FILTER & GENRE BAR SECTION */}
      <section className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Input Box Cari Judul */}
          <div className="w-full lg:max-w-xs">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Cari Film
              <input 
                value={search} 
                onChange={(event) => setSearch(event.target.value)} 
                placeholder="Ketik judul film..." 
                className="mt-2 block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 text-sm placeholder-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition"
              />
            </label>
          </div>

          {/* Deretan Tab Filter Genre (Pills Style) */}
          <div className="flex-1 overflow-x-auto pb-2 lg:pb-0">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 lg:hidden">
              Kategori Genre
            </span>
            <div className="flex space-x-2 min-w-max lg:justify-end pt-1">
              {genres.map((item) => {
                const isActive = genre === item;
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setGenre(item)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
                      isActive
                        ? 'bg-teal-500 border-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* 3. CORE DISPLAY MOVIE SYSTEM */}
      <section className="relative min-h-[40vh]">
        {error && <ErrorBanner message={error} />}

        {/* Menerapkan Animasi Grid Premium */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <FilmCardSkeleton key={idx} />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((film) => (
              <div key={film.id_film} className="hover:-translate-y-1 transition duration-300">
                <FilmCard film={film} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-12 shadow-inner">
            <EmptyState 
              title="Film Tidak Ditemukan" 
              message="Maaf, tidak ada film yang sesuai dengan kata kunci atau filter kategori genre yang Anda cari." 
            />
          </div>
        )}
      </section>

    </div>
  );
}