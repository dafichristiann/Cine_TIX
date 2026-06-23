import { useState } from 'react';
import type { Film } from '../types';

export default function PosterImage({ film, className }: { film: Film; className?: string }) {
  const [failed, setFailed] = useState(false);

  // Tampilan Placeholder Premium jika Gambar Kosong / Gagal Dimuat
  if (!film.poster_url || failed) {
    return (
      <div className={`w-full h-full min-h-[360px] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800/60 rounded-t-2xl flex flex-col items-center justify-center p-6 text-center select-none ${className || ''}`}>
        <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-black text-xl shadow-md mb-3">
          CT
        </div>
        <strong className="text-sm font-bold text-slate-200 line-clamp-2 px-2">
          {film.judul}
        </strong>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
          Poster tidak tersedia
        </span>
      </div>
    );
  }

  return (
    <img 
      // w-full dan h-auto memastikan gambar fleksibel secara horizontal
      // max-h dan object-contain/cover bisa dikontrol langsung dari komponen ini agar aman
      className={`w-full h-auto object-contain max-h-[380px] rounded-t-2xl ${className || ''}`} 
      src={film.poster_url} 
      alt={`Poster ${film.judul}`} 
      loading="lazy" 
      onError={() => setFailed(true)} 
    />
  );
}