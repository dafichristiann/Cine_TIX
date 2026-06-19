import { useEffect, useMemo, useState } from 'react';
import api, { getApiError } from '../api/axios';
import FilmCard from '../components/FilmCard';
import { EmptyState, ErrorBanner, LoadingState } from '../components/Status';
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

  const genres = useMemo(() => ['Semua', ...new Set(films.flatMap((film) => film.genre.split(',').map((item) => item.trim())).filter(Boolean))], [films]);
  const filtered = films.filter((film) => {
    const matchSearch = film.judul.toLowerCase().includes(search.toLowerCase());
    const matchGenre = genre === 'Semua' || film.genre.toLowerCase().includes(genre.toLowerCase());
    return matchSearch && matchGenre;
  });

  return (
    <div className="page-content">
      <section className="page-hero compact-hero"><div className="container"><p className="eyebrow">Pilih ceritamu</p><h1>Film di CineTix</h1><p>Dari aksi menegangkan hingga drama yang menghangatkan hati.</p></div></section>
      <section className="section">
        <div className="container">
          <div className="filter-bar">
            <label className="search-box"><span>Cari</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari judul film..." /></label>
            <div className="genre-tabs">{genres.map((item) => <button className={genre === item ? 'active' : ''} type="button" onClick={() => setGenre(item)} key={item}>{item}</button>)}</div>
          </div>
          {error && <ErrorBanner message={error} />}
          {loading ? <LoadingState label="Memuat daftar film..." /> : filtered.length ? (
            <div className="movie-grid">{filtered.map((film) => <FilmCard film={film} key={film.id_film} />)}</div>
          ) : <EmptyState title="Film tidak ditemukan" message="Coba kata kunci atau genre yang berbeda." />}
        </div>
      </section>
    </div>
  );
}
