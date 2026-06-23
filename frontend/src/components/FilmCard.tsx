import { Link } from 'react-router-dom';
import type { Film } from '../types';
import PosterImage from './PosterImage';

export default function FilmCard({ film }: { film: Film }) {
  return (
    <article className="group bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 hover:shadow-2xl hover:shadow-teal-950/10 transition-all duration-300 flex flex-col h-full">
      
      {/* 1. AREA POSTER FILM - DIUBAH AGAR MENGIKUTI TINGGI ASLI GAMBAR */}
      <Link 
        className="relative block w-full bg-slate-950/40" 
        to={`/jadwal/${film.id_film}`} 
        aria-label={`Lihat jadwal ${film.judul}`}
      >
        {/* Hapus aspect-[2/3] dan h-full keras, biarkan gambar mengalir alami */}
        <div className="w-full transform group-hover:scale-[1.02] transition duration-500">
          <PosterImage film={film} />
        </div>
        
        {/* Badge Rating Umur Premium */}
        <span className="absolute bottom-3 right-3 bg-slate-950/75 backdrop-blur-md border border-slate-800 text-[10px] font-bold text-slate-200 px-2 py-0.5 rounded shadow-sm tracking-wide">
          {film.rating}
        </span>
      </Link>
      
      {/* 2. BODY KONTEN INFORMASI FILM */}
      <div className="p-5 flex flex-col flex-grow justify-between space-y-4 bg-gradient-to-b from-slate-900 to-slate-950/40">
        <div className="space-y-1.5">
          {/* Genre Label */}
          <p className="text-[10px] font-bold text-teal-400 tracking-widest uppercase">
            {film.genre}
          </p>
          
          {/* Judul Film */}
          <h3 className="text-base font-bold text-white tracking-tight leading-snug line-clamp-1 group-hover:text-teal-400 transition duration-200">
            <Link to={`/jadwal/${film.id_film}`}>
              {film.judul}
            </Link>
          </h3>
          
          {/* Metadata Film */}
          <div className="flex items-center space-x-2.5 text-xs text-slate-400 font-medium">
            <span>{film.durasi} menit</span>
            <span>•</span>
            <span className="truncate">{film.bahasa}</span>
          </div>
        </div>
        
        {/* 3. TOMBOL CTA */}
        <div className="pt-1">
          <Link 
            className="block w-full text-center bg-slate-800 hover:bg-teal-500 text-slate-200 hover:text-slate-950 border border-slate-700/60 hover:border-teal-500 font-bold text-xs py-2.5 px-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20" 
            to={`/jadwal/${film.id_film}`}
          >
            Lihat Jadwal {"->"}
          </Link>
        </div>
      </div>

    </article>
  );
}