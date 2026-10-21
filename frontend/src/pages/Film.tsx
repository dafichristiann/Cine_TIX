import { useEffect, useMemo, useState } from 'react';
import { Search, Film as FilmIcon, Calendar } from 'lucide-react';
import api, { getApiError } from '../api/axios';
import FilmCard from '../components/FilmCard';
import FilmCardSkeleton from '../components/FilmCardSkeleton';
import { EmptyState, ErrorBanner } from '../components/Status';
import type { Film } from '../types';

export default function FilmList() {
  const [films, setFilms] = useState<Film[]>([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState<'all' | 'tayang' | 'tidak_tayang'>('tayang');
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
    const matchStatus = statusFilter === 'all' || film.status === statusFilter;
    return matchSearch && matchGenre && matchStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full">
      
      {/* 1. CINEMA CATALOG HEADER */}
      <section className="bg-canvas-card border border-border-subtle rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center space-x-2">
            <FilmIcon className="w-4 h-4 text-gold-400" />
            <span className="text-[10px] font-bold tracking-widest text-gold-400 uppercase">
              Katalog Bioskop Indonesia
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-headline">
            Jadwal Tayang & Film Pilihan
          </h1>
          <p className="text-xs text-text-muted leading-relaxed">
            Temukan informasi film box office terkini yang sedang tayang maupun segera hadir di jaringan bioskop CineTix. Cek sinopsis, durasi, klasifikasi usia, dan amankan kursi terbaik.
          </p>
        </div>
      </section>

      {/* 2. FILTER & PENCARIAN */}
      <section className="bg-canvas-card border border-border-subtle p-4 sm:p-5 rounded-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center space-x-1.5 bg-canvas-base p-1 rounded-xl border border-border-subtle w-fit">
            <button
              type="button"
              onClick={() => setStatusFilter('tayang')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                statusFilter === 'tayang' ? 'bg-gold-500 text-text-on-gold shadow-sm' : 'text-text-muted hover:text-text-headline'
              }`}
            >
              <FilmIcon className="w-3.5 h-3.5" />
              <span>Sedang Tayang</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('tidak_tayang')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                statusFilter === 'tidak_tayang' ? 'bg-gold-500 text-text-on-gold shadow-sm' : 'text-text-muted hover:text-text-headline'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Segera Hadir</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                statusFilter === 'all' ? 'bg-canvas-elevated text-text-headline font-bold' : 'text-text-muted hover:text-text-headline'
              }`}
            >
              Semua
            </button>
          </div>

          {/* Search Box */}
          <div className="w-full lg:max-w-xs relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Cari judul film..." 
              className="block w-full rounded-xl bg-canvas-base border border-border-subtle text-text-headline pl-10 pr-3.5 py-2 text-xs placeholder-text-disabled focus:border-gold-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Genre Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-2 border-t border-border-subtle scrollbar-none">
          <span className="text-[11px] font-semibold text-text-muted shrink-0">Genre:</span>
          {genres.map((item) => {
            const isActive = genre === item;
            return (
              <button
                type="button"
                key={item}
                onClick={() => setGenre(item)}
                className={`px-3 py-1 text-xs font-medium rounded-lg border transition shrink-0 ${
                  isActive
                    ? 'bg-gold-500/15 border-gold-500/40 text-gold-400 font-bold'
                    : 'bg-canvas-base border-border-subtle text-text-muted hover:text-text-headline hover:border-border-elevated'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. GRID KATALOG FILM */}
      <section className="relative min-h-[40vh] space-y-4">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Menampilkan <strong className="text-text-headline">{filtered.length}</strong> film</span>
        </div>

        {error && <ErrorBanner message={error} />}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, idx) => (
              <FilmCardSkeleton key={idx} />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filtered.map((film) => (
              <FilmCard key={film.id_film} film={film} />
            ))}
          </div>
        ) : (
          <div className="bg-canvas-card border border-border-subtle rounded-2xl p-12 text-center">
            <EmptyState 
              title="Film Tidak Ditemukan" 
              message="Tidak ada judul film atau filter genre yang cocok dengan kriteria pencarian Anda." 
            />
          </div>
        )}
      </section>

    </div>
  );
}
