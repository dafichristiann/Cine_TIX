import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getApiError } from '../api/axios';
import { EmptyState, ErrorBanner, LoadingState } from '../components/Status';
import PosterImage from '../components/PosterImage';
import { formatCurrency, formatDate } from '../lib/format';
import type { Film, Jadwal as JadwalType } from '../types';

export default function Jadwal() {
  const { id_film } = useParams();
  const [film, setFilm] = useState<Film | null>(null);
  const [schedules, setSchedules] = useState<JadwalType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<Film>(`/film/${id_film}`), 
      api.get<JadwalType[]>('/jadwal', { params: { id_film } })
    ])
      .then(([filmResponse, scheduleResponse]) => { 
        setFilm(filmResponse.data); 
        setSchedules(scheduleResponse.data); 
      })
      .catch((requestError: unknown) => setError(getApiError(requestError)))
      .finally(() => setLoading(false));
  }, [id_film]);

  const grouped = useMemo(() => schedules.reduce<Record<string, JadwalType[]>>((result, schedule) => {
    const key = schedule.tanggal.slice(0, 10);
    result[key] = [...(result[key] || []), schedule];
    return result;
  }, {}), [schedules]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingState label="Mencari jadwal tayang..." />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 w-full">
      
      {/* 1. HERO SECTION: DETAIL FILM */}
      <section className="relative overflow-hidden bg-slate-900 border border-slate-800/60 rounded-3xl p-6 sm:p-8 lg:p-10 w-full">
        {/* Ambient Blur Background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-start w-full">
          {/* Sisi Kiri: Poster Film (Responsive & Proporsional) */}
          <div className="md:col-span-4 lg:col-span-3 max-w-[240px] w-full mx-auto md:mx-0 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center">
            {film && <PosterImage film={film} className="w-full h-auto object-contain object-center" />}
          </div>
          
          {/* Sisi Kanan: Deskripsi & Metadata */}
          <div className="md:col-span-8 lg:col-span-9 space-y-5">
            <Link className="inline-flex items-center space-x-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition" to="/film">
              <span>{"<-"}</span> <span>Kembali ke film</span>
            </Link>
            
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-teal-400 tracking-widest uppercase">{film?.genre}</p>
              <h1 className="text-3xl font-black text-white tracking-tight leading-tight">{film?.judul}</h1>
            </div>
            
            {/* Metadata Badges */}
            <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-300">
              <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-teal-400 font-extrabold">{film?.rating}</span>
              <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 font-mono">{film?.durasi} menit</span>
              <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 capitalize">{film?.bahasa}</span>
            </div>
            
            <div className="pt-4 border-t border-slate-800/60 space-y-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sinopsis</h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-4xl">{film?.sinopsis}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. JADWAL TAYANG SECTION */}
      <section className="space-y-6 w-full">
        <div className="border-b border-slate-800 pb-4">
          <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">Pilih Waktu</p>
          <h2 className="text-xl font-extrabold text-white mt-0.5">Jadwal Tayang Tersedia</h2>
        </div>

        {error && <ErrorBanner message={error} />}

        {!schedules.length ? (
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-12 text-center shadow-inner">
            <EmptyState title="Belum ada jadwal" message="Jadwal tayang untuk film ini belum tersedia di cabang manapun." />
          </div>
        ) : (
          <div className="space-y-8 w-full">
            {Object.entries(grouped).map(([date, items]) => (
              <div className="space-y-4 w-full" key={date}>
                
                {/* Judul Tanggal Hari */}
                <div className="flex items-baseline space-x-2 text-sm">
                  <strong className="text-white font-black capitalize tracking-wide">
                    {formatDate(date, { weekday: 'long' })}
                  </strong>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 font-medium">
                    {formatDate(date, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                {/* Grid Barisan Studio / Bioskop */}
                <div className="grid grid-cols-1 gap-3 w-full">
                  {items.map((schedule) => (
                    <article 
                      className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700/80 transition duration-200 shadow-md w-full" 
                      key={schedule.id_jadwal}
                    >
                      {/* Cabang Bioskop & Info Ruangan */}
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-200">{schedule.studio.bioskop.nama_bioskop}</h3>
                        <p className="text-xs text-slate-400 flex flex-wrap items-center gap-1.5">
                          <span>{schedule.studio.bioskop.kota}</span> 
                          <span className="text-slate-700">/</span> 
                          <span>{schedule.studio.nama_studio}</span> 
                          <span className="text-slate-700">/</span> 
                          <span className="text-teal-400 font-semibold bg-teal-500/5 px-2 py-0.5 rounded border border-teal-500/10 text-[10px] tracking-wide uppercase">
                            {schedule.studio.tipe}
                          </span>
                        </p>
                      </div>

                      {/* Jam Operasional & Aksi Penjualan */}
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/40">
                        <div className="leading-tight">
                          <strong className="block text-base font-black text-white font-mono">{schedule.jam_mulai}</strong>
                          <small className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">s.d {schedule.jam_selesai}</small>
                        </div>
                        
                        <div className="text-left sm:text-right sm:min-w-[100px]">
                          <span className="block text-sm font-black text-teal-400 font-mono">
                            {formatCurrency(schedule.harga)}
                          </span>
                          <span className="text-[9px] text-slate-500 font-semibold block uppercase tracking-wider">per tiket</span>
                        </div>

                        <Link 
                          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs py-2.5 px-5 rounded-xl transition shadow-md shadow-teal-500/5 focus:outline-none focus:ring-2 focus:ring-teal-500/20" 
                          to={`/kursi/${schedule.id_jadwal}`}
                        >
                          Pilih Kursi
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}