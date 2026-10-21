import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import api, { getApiError } from '../api/axios';
import { EmptyState, ErrorBanner, LoadingState } from '../components/Status';
import PosterImage from '../components/PosterImage';
import { formatCurrency, formatDate } from '../lib/format';
import type { Film, Jadwal as JadwalType } from '../types';

export default function Jadwal() {
  const { id_film } = useParams();
  const [film, setFilm] = useState<Film | null>(null);
  const [schedules, setSchedules] = useState<JadwalType[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('Semua');
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
        // Default to first available date
        if (scheduleResponse.data.length > 0) {
          const firstDate = scheduleResponse.data[0].tanggal.slice(0, 10);
          setSelectedDate(firstDate);
        }
      })
      .catch((requestError: unknown) => setError(getApiError(requestError)))
      .finally(() => setLoading(false));
  }, [id_film]);

  // Unique dates from schedules
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(schedules.map((s) => s.tanggal.slice(0, 10)))).sort();
    return dates;
  }, [schedules]);

  // Available cities from bioskops in schedules
  const cities = useMemo(() => {
    const citySet = new Set(schedules.map((s) => s.studio.bioskop.kota).filter(Boolean));
    return ['Semua', ...Array.from(citySet)];
  }, [schedules]);

  // Filter schedules by selected date & city
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchDate = !selectedDate || s.tanggal.slice(0, 10) === selectedDate;
      const matchCity = selectedCity === 'Semua' || s.studio.bioskop.kota === selectedCity;
      return matchDate && matchCity;
    });
  }, [schedules, selectedDate, selectedCity]);

  // Group schedules by Cinema (Bioskop)
  const groupedByCinema = useMemo(() => {
    const map = new Map<number, { bioskop: JadwalType['studio']['bioskop']; studios: Map<string, JadwalType[]> }>();

    filteredSchedules.forEach((sch) => {
      const bioId = sch.studio.bioskop.id_bioskop;
      if (!map.has(bioId)) {
        map.set(bioId, {
          bioskop: sch.studio.bioskop,
          studios: new Map(),
        });
      }

      const studioGroup = map.get(bioId)!;
      const studioKey = `${sch.studio.nama_studio}__${sch.studio.tipe}__${sch.harga}`;
      if (!studioGroup.studios.has(studioKey)) {
        studioGroup.studios.set(studioKey, []);
      }
      studioGroup.studios.get(studioKey)!.push(sch);
    });

    return Array.from(map.values());
  }, [filteredSchedules]);

  const getRatingBadge = (rating: string) => {
    const r = (rating || 'SU').toUpperCase();
    if (r.includes('21')) return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    if (r.includes('17')) return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    if (r.includes('13')) return 'bg-gold-500/15 text-gold-400 border-gold-500/30';
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingState label="Mencari jadwal tayang bioskop..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-7xl mx-auto">
      
      {/* 1. MOVIE DETAIL HERO */}
      <section className="bg-canvas-card border border-border-subtle rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* POSTER (2:3 RATIO) */}
          <div className="md:col-span-4 lg:col-span-3 max-w-[220px] w-full mx-auto md:mx-0 rounded-2xl overflow-hidden border border-border-subtle shadow-2xl bg-canvas-base aspect-[2/3] relative">
            {film && <PosterImage film={film} className="w-full h-full object-cover object-center" />}
            <span className={`absolute top-2.5 right-2.5 text-[10px] font-black px-2 py-0.5 rounded shadow ${getRatingBadge(film?.rating || 'SU')}`}>
              {film?.rating || 'SU'}
            </span>
          </div>
          
          {/* DETAIL META */}
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            <Link 
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gold-400 hover:text-gold-300 transition" 
              to="/film"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Katalog Film</span>
            </Link>
            
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gold-400 tracking-wider uppercase">{film?.genre}</span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text-headline tracking-tight leading-tight">
                {film?.judul}
              </h1>
            </div>
            
            {/* TAGS */}
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-text-body pt-1">
              <span className="bg-canvas-elevated px-3 py-1 rounded-lg border border-border-elevated text-gold-400">
                {film?.durasi} Menit
              </span>
              <span className="bg-canvas-elevated px-3 py-1 rounded-lg border border-border-elevated capitalize">
                Audio: {film?.bahasa || 'Indonesia'}
              </span>
              <span className="bg-canvas-elevated px-3 py-1 rounded-lg border border-border-elevated">
                Studio 2D / IMAX
              </span>
            </div>
            
            {/* SINOPSIS */}
            <div className="pt-3 border-t border-border-subtle space-y-1.5">
              <h2 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Sinopsis Cerita</h2>
              <p className="text-xs text-text-body leading-relaxed max-w-3xl">
                {film?.sinopsis || 'Sinopsis resmi untuk film ini belum ditambahkan.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DATE SELECTOR PILLS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-headline">Pilih Tanggal Penayangan</h2>
          {cities.length > 1 && (
            <div className="flex items-center space-x-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-canvas-elevated border border-border-elevated text-text-headline text-xs rounded-lg px-2.5 py-1 focus:outline-none"
              >
                {cities.map((city) => (
                  <option key={city} value={city} className="bg-canvas-card">{city}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Horizontal Date Picker */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {availableDates.length > 0 ? (
            availableDates.map((dateStr) => {
              const isSelected = selectedDate === dateStr;
              const dateObj = new Date(dateStr);
              const dayName = formatDate(dateStr, { weekday: 'short' });
              const dayNum = dateObj.getDate();
              const monthName = formatDate(dateStr, { month: 'short' });

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex flex-col items-center justify-center min-w-[85px] py-2.5 px-3 rounded-2xl border transition duration-150 ${
                    isSelected
                      ? 'bg-gold-500 border-gold-400 text-text-on-gold font-bold shadow-md shadow-gold-500/20'
                      : 'bg-canvas-card border-border-subtle text-text-muted hover:text-text-headline hover:border-border-elevated'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider">{dayName}</span>
                  <span className={`text-base font-black ${isSelected ? 'text-text-on-gold' : 'text-text-headline'}`}>{dayNum}</span>
                  <span className="text-[9px] uppercase">{monthName}</span>
                </button>
              );
            })
          ) : (
            <div className="text-xs text-text-muted py-2">Belum ada tanggal tayang tersedia.</div>
          )}
        </div>
      </section>

      {/* 3. CINEMA & SHOWTIME LISTINGS */}
      <section className="space-y-4">
        {error && <ErrorBanner message={error} />}

        {!groupedByCinema.length ? (
          <div className="bg-canvas-card border border-border-subtle rounded-2xl p-12 text-center">
            <EmptyState 
              title="Jadwal Tidak Tersedia" 
              message="Belum ada jadwal tayang untuk tanggal atau kota yang dipilih. Silakan pilih tanggal atau cabang lain." 
            />
          </div>
        ) : (
          <div className="space-y-4">
            {groupedByCinema.map(({ bioskop, studios }) => (
              <div 
                key={bioskop.id_bioskop} 
                className="bg-canvas-card border border-border-subtle rounded-2xl overflow-hidden shadow-md"
              >
                {/* Cinema Header */}
                <div className="p-4 sm:p-5 border-b border-border-subtle bg-canvas-base/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
                      <h3 className="text-sm sm:text-base font-black text-text-headline uppercase tracking-tight">
                        {bioskop.nama_bioskop}
                      </h3>
                    </div>
                    <p className="text-[11px] text-text-muted pl-6">
                      {bioskop.alamat}, {bioskop.kota}
                    </p>
                  </div>

                  <span className="text-[10px] font-bold text-text-muted bg-canvas-elevated px-3 py-1 rounded-full border border-border-subtle self-start sm:self-auto">
                    {bioskop.kota}
                  </span>
                </div>

                {/* Cinema Studios & Showtimes */}
                <div className="p-4 sm:p-5 space-y-5">
                  {Array.from(studios.entries()).map(([studioKey, items]) => {
                    const firstItem = items[0];
                    return (
                      <div key={studioKey} className="space-y-3 pb-4 last:pb-0 border-b last:border-b-0 border-border-subtle">
                        {/* Studio Type & Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-text-headline uppercase">
                              {firstItem.studio.nama_studio}
                            </span>
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-gold-500/15 border border-gold-500/30 text-gold-400">
                              {firstItem.studio.tipe}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-extrabold text-gold-400 font-mono">
                              {formatCurrency(firstItem.harga)}
                            </span>
                            <span className="text-[10px] text-text-muted ml-1">/ tiket</span>
                          </div>
                        </div>

                        {/* Showtime Pills */}
                        <div className="flex flex-wrap gap-2.5">
                          {items.map((sch) => (
                            <Link
                              key={sch.id_jadwal}
                              to={`/kursi/${sch.id_jadwal}`}
                              className="group flex flex-col items-center justify-center min-w-[76px] py-2 px-3 rounded-xl bg-canvas-elevated border border-border-elevated hover:border-gold-500 hover:bg-gold-500 transition duration-150 shadow-sm"
                            >
                              <span className="text-xs font-black font-mono text-text-headline group-hover:text-text-on-gold transition">
                                {sch.jam_mulai}
                              </span>
                              <span className="text-[9px] font-medium text-text-muted group-hover:text-text-on-gold transition">
                                s.d {sch.jam_selesai}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
