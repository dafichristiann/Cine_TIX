import { useState } from 'react';
import type { Film } from '../types';

export default function PosterImage({ film, className }: { film: Film; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!film.poster_url || failed) {
    return <div className={`poster-placeholder ${className || ''}`}><span>CT</span><strong>{film.judul}</strong></div>;
  }

  return <img className={className} src={film.poster_url} alt={`Poster ${film.judul}`} loading="lazy" onError={() => setFailed(true)} />;
}
