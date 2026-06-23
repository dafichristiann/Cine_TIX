import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getApiError } from '../api/axios';
import FilmCard from '../components/FilmCard';
import PosterImage from '../components/PosterImage';
import { ErrorBanner, LoadingState } from '../components/Status';
import type { Film, Jadwal } from '../types';

export default function Home() {
  const [films, setFilms] = useState<Film[]>([]);
  const [scheduleCount, setScheduleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get<Film[]>('/film'), api.get<Jadwal[]>('/jadwal')])
      .then(([filmResponse, scheduleResponse]) => {
        setFilms(filmResponse.data);
        setScheduleCount(scheduleResponse.data.length);
        // PENTING: Cek apakah data film benar-benar masuk dan ada isinya di console browser
        console.log("DATA FILMS DARI BACKEND:", filmResponse.data);
      })
      .catch((requestError: unknown) => setError(getApiError(requestError)))
      .finally(() => setLoading(false));
  }, []);

  const featured = films.slice(0, 4);
  const spotlight = films[0];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingState label="Menyiapkan film terbaik..." />
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-in fade-in duration-700 w-full overflow-hidden">
      
      {/* 1. HERO SECTION WITH FIXED MULTI-FILM BACKDROP COLLAGE */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800/80 p-6 sm:p-10 lg:p-12 w-full shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-sm">
        
        {/* ===== UTK TRACER: JIKA ARRAY ADA ISI, KITA PAKSA MUNCULKAN COLLAGE ===== */}
        {films.length > 0 && (
          <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden rounded-3xl z-0 opacity-[0.20] blur-xl scale-110 transform-gpu">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full h-full absolute inset-0">
              {films.slice(0, 8).map((film, idx) => {
                // Trik Jitu: Jika database kosong/null, kita inject langsung link gambar Unsplash yang valid untuk testing background
                const posterTarget = film.poster_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500&auto=format&fit=crop";
                
                return (
                  <div key={`bg-${film.id_film}-${idx}`} className="w-full h-full relative overflow-hidden bg-slate-900">
                    <img 
                      src={posterTarget} 
                      alt="" 
                      className="w-full h-full object-cover object-center absolute inset-0 block"
                      onError={(e) => {
                        // Jika link gambar dari database-mu corrupt/error, paksa ganti ke gambar bawaan biar ga blank hitam
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500&auto=format&fit=crop";
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="absolute inset-0 bg-slate-950/40" />
          </div>
        )}

        {/* Lapisan Gradasi (Vinyet) Utama untuk Menjaga Keterbacaan Teks Putih */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 z-0" />

        {/* Lapisan Ambient Glow Teal */}
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[5000ms] z-0" />

        {/* KONTEN UTAMA HERO LAYER */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full z-10">
          {/* Hero Copy (Kiri) */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center space-x-2 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full text-xs font-semibold text-teal-400">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span>Pengalaman bioskop dalam genggaman</span>
            </span>
            
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Cerita besar dimulai dari <span className="relative bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent font-extrabold">satu kursi.<span className="absolute left-0 bottom-1 w-full h-[3px] bg-teal-500/20 rounded-full" /></span>
            </h1>
            
            <p className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed">
              Temukan film terbaru, pilih jadwal yang pas, dan amankan kursi favoritmu dalam hitungan menit tanpa antre.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Link 
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all duration-300 transform active:scale-95 hover:scale-[1.03] shadow-lg hover:shadow-teal-500/20 flex items-center space-x-2" 
                to="/film"
              >
                <span>Pesan Tiket Sekarang</span>
                <span className="font-mono text-xs">{"->"}</span>
              </Link>
              <a 
                className="bg-slate-950/60 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all duration-200 transform active:scale-95 hover:border-slate-700" 
                href="#sedang-tayang"
              >
                Lihat Film
              </a>
            </div>
          </div>

          {/* Hero Visual Card Spotlight (Kanan) */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="w-full max-w-sm bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl group transition-all duration-500 hover:border-teal-500/30 hover:shadow-[0_0_30px_rgba(20,184,166,0.15)]">
              <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                {spotlight ? (
                  <div className="w-full h-full transform group-hover:scale-105 group-hover:opacity-90 transition duration-700 ease-out">
                    <PosterImage film={spotlight} className="w-full h-full object-cover object-center" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-800">C</div>
                )}
                <span className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[10px] font-bold tracking-wider uppercase text-teal-400 px-2.5 py-1 rounded-md shadow-md">
                  Pilihan minggu ini
                </span>
              </div>
              
              <div className="p-5 space-y-2.5 bg-gradient-to-b from-slate-950 to-slate-900">
                <p className="text-[9px] font-bold text-teal-400 tracking-widest uppercase">SEGERA DI LAYAR</p>
                <h2 className="text-base font-extrabold text-white truncate group-hover:text-teal-400 transition duration-200">{spotlight?.judul || 'Film pilihan CineTix'}</h2>
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">{spotlight?.genre || 'Beragam genre'}</span>
                  <span>•</span>
                  <span className="font-mono text-[11px]">{spotlight ? `${spotlight.durasi} mnt` : 'Setiap hari'}</span>
                </div>
              </div>
            </div>

            {/* Floating Info Tag */}
            <div className="absolute -bottom-4 -left-4 sm:left-4 lg:-left-6 bg-gradient-to-tr from-slate-900 via-slate-900 to-slate-800 border border-slate-700/60 rounded-xl p-3.5 shadow-2xl flex items-center space-x-3 backdrop-blur-sm transform hover:-translate-y-1 transition duration-300 select-none">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping absolute -top-1 -right-1" />
              <strong className="text-2xl font-black text-white font-mono tracking-tight">{scheduleCount}+</strong>
              <div className="leading-none">
                <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">Jadwal</span>
                <span className="text-[11px] font-semibold text-teal-400 mt-0.5 block">Tersedia Hari Ini</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MOVIE GRID SECTION WITH STYLISH HOVER ELEVATION */}
      <section id="sedang-tayang" className="scroll-mt-24 w-full animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">Pilihan Terbaik</p>
            <h2 className="text-2xl font-extrabold text-white mt-1 tracking-tight">Sedang Tayang di Bioskop</h2>
            <p className="text-sm text-slate-400 mt-0.5">Film seru yang siap menemani waktu santai terbaikmu.</p>
          </div>
          <Link className="text-sm font-semibold text-teal-400 hover:text-teal-300 transition flex items-center space-x-1 shrink-0 group" to="/film">
            <span>Lihat semua film</span>
            <span className="font-mono text-xs transform group-hover:translate-x-1 transition duration-200">{"->"}</span>
          </Link>
        </div>

        {error && <ErrorBanner message={error} />}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
          {featured.map((film) => (
            <div 
              key={film.id_film} 
              className="transform hover:-translate-y-2.5 hover:scale-[1.01] transition-all duration-300 hover:shadow-[0_20px_35px_rgba(0,0,0,0.6)] rounded-2xl border border-transparent hover:border-slate-800"
            >
              <FilmCard film={film} />
            </div>
          ))}
        </div>
      </section>

      {/* 3. STEPS SECTION */}
      <section className="bg-slate-900/30 border border-slate-900/80 rounded-3xl p-6 sm:p-8 lg:p-10 w-full">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">Mudah dan Cepat</p>
          <h2 className="text-2xl font-extrabold text-white mt-1 tracking-tight">Tiga Langkah Menuju Layar Lebar</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative w-full">
          {[
            { step: '01', icon: '🍿', title: 'Pilih Film & Jadwal', desc: 'Temukan film favorit dan waktu tayang yang sesuai dengan harimu.' },
            { step: '02', icon: '💺', title: 'Tentukan Kursi', desc: 'Lihat ketersediaan real-time dan pilih posisi menonton ternyaman.' },
            { step: '03', icon: '💳', title: 'Bayar & Nikmati', desc: 'Selesaikan pembayaran dan tiket digitalmu langsung siap digunakan.' }
          ].map((item, index) => (
            <article key={index} className="bg-slate-950/60 border border-slate-800/40 rounded-2xl p-5 relative group hover:border-slate-700/80 transition duration-300">
              <span className="absolute top-4 right-4 text-xs font-black text-slate-800 font-mono group-hover:text-teal-400/20 transition duration-300">{item.step}</span>
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg shadow-inner">{item.icon}</div>
              <h3 className="text-sm font-bold text-slate-200 mt-4">{item.title}</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}