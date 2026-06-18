import { Link } from 'react-router-dom';
import type { Film } from '../types';
import PosterImage from './PosterImage';

export default function FilmCard({ film }: { film: Film }) {
  return (
    <article className="movie-card">
      <Link className="poster-wrap" to={`/jadwal/${film.id_film}`} aria-label={`Lihat jadwal ${film.judul}`}>
        <PosterImage film={film} />
        <span className="rating-badge">{film.rating}</span>
      </Link>
      <div className="movie-card-body">
        <p className="eyebrow">{film.genre}</p>
        <h3><Link to={`/jadwal/${film.id_film}`}>{film.judul}</Link></h3>
        <div className="movie-meta">
          <span>{film.durasi} menit</span>
          <span>{film.bahasa}</span>
        </div>
        <Link className="button button-secondary button-block" to={`/jadwal/${film.id_film}`}>
          Lihat jadwal
        </Link>
      </div>
    </article>
  );
}
