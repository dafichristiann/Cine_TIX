import { Link } from 'react-router-dom';
import type { Film } from '../types';
import PosterImage from './PosterImage';

export default function FilmCard({ film }: { film: Film }) {
  const getRatingBadge = (rating: string) => {
    const r = (rating || 'SU').toUpperCase();
    if (r.includes('21')) {
      return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    }
    if (r.includes('17')) {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
    if (r.includes('13')) {
      return 'bg-gold-500/15 text-gold-400 border-gold-500/30';
    }
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  };

  return (
    <article className="group bg-canvas-card border border-border-subtle rounded-2xl overflow-hidden hover:border-gold-500/40 hover:shadow-xl hover:shadow-black/60 transition-all duration-300 flex flex-col h-full">
      
      {/* 1. AREA POSTER (2:3 CINEMA STANDARD ASPECT RATIO) */}
      <Link 
        className="relative block w-full aspect-[2/3] bg-canvas-base overflow-hidden" 
        to={`/jadwal/${film.id_film}`} 
        aria-label={`Beli tiket film ${film.judul}`}
      >
        <div className="w-full h-full transform group-hover:scale-105 transition duration-500">
          <PosterImage film={film} className="w-full h-full object-cover object-center" />
        </div>
        
        {/* Badge Rating Usia (21 Cineplex style: top right) */}
        <span className={`absolute top-2.5 right-2.5 backdrop-blur-sm border text-[9px] font-black px-1.5 py-0.5 rounded shadow ${getRatingBadge(film.rating)}`}>
          {film.rating || 'SU'}
        </span>

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas-base/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-3">
          <span className="w-full text-center bg-gold-500 text-text-on-gold text-xs font-black py-2 rounded-xl shadow-lg">
            Beli Tiket
          </span>
        </div>
      </Link>
      
      {/* 2. FILM INFO METADATA */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between space-y-2.5 bg-canvas-card">
        <div className="space-y-1">
          <h3 className="text-xs sm:text-sm font-extrabold text-text-headline tracking-tight uppercase line-clamp-1 group-hover:text-gold-400 transition">
            <Link to={`/jadwal/${film.id_film}`}>
              {film.judul}
            </Link>
          </h3>
          
          <p className="text-[10px] text-text-muted truncate">
            <span>{film.genre}</span>
            <span className="mx-1.5 text-slate-600">•</span>
            <span>{film.durasi} Menit</span>
          </p>
        </div>
        
        {/* 3. BUTTON JADWAL */}
        <div className="pt-1">
          <Link 
            className="block w-full text-center bg-canvas-elevated hover:bg-gold-500 text-text-body hover:text-text-on-gold border border-border-elevated hover:border-gold-500 font-bold text-[11px] sm:text-xs py-2 px-3 rounded-xl transition duration-200" 
            to={`/jadwal/${film.id_film}`}
          >
            Lihat Jadwal
          </Link>
        </div>
      </div>

    </article>
  );
}
