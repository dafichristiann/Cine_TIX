import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Film as FilmIcon, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ShieldCheck,
  UtensilsCrossed,
  Sparkles,
  ChevronRight,
  Search,
  Ticket
} from 'lucide-react';
import api, { getApiError } from '../api/axios';
import FilmCard from '../components/FilmCard';
import { ErrorBanner, LoadingState } from '../components/Status';
import type { Film, Bioskop } from '../types';

const promoBanners = [
  {
    id: 1,
    tag: 'PROMO EKSKLUSIF',
    title: 'Diskon 20% Pemesanan Tiket Pertama',
    desc: 'Gunakan kode voucher CINETIX10 saat checkout untuk potongan harga tiket.',
    bg: 'from-gold-900/30 via-canvas-card to-canvas-base',
    cta: 'Pesan Sekarang',
    link: '/film',
  },
  {
    id: 2,
    tag: 'F&B COMBO DEAL',
    title: 'Paket Popcorn Karamel & 2 Minuman Dingin',
    desc: 'Beli paket combo hemat langsung bersamaan saat memilih kursi bioskop.',
    bg: 'from-canvas-elevated via-canvas-card to-canvas-base',
    cta: 'Lihat Menu',
    link: '/film',
  },
  {
    id: 3,
    tag: 'PENGALAMAN SINEMATIK',
    title: 'Studio IMAX & Dolby Atmos Resmi',
    desc: 'Sensasi suara surround 360 derajat dan layar super lebar di bioskop CineTix.',
    bg: 'from-gold-900/20 via-canvas-card to-canvas-base',
    cta: 'Cari Jadwal',
    link: '/film',
  },
];

const newsArticles = [
  {
    id: 1,
    title: 'Daftar Film Box Office Terlaris Pekan Ini di Seluruh Bioskop Indonesia',
    category: 'Box Office',
    date: '21 Oktober 2026',
    desc: 'Persaingan ketat film laga petualangan dan horor lokal mendominasi perolehan jumlah penonton minggu ini.',
  },
  {
    id: 2,
    title: 'Teknologi Proyeksi Laser 4K Terbaru Hadir di Jaringan Studio CineTix',
    category: 'Teknologi Bioskop',
    date: '19 Oktober 2026',
    desc: 'Kualitas gambar lebih jernih dan kontras warna mendalam memberikan pengalaman menonton tiada tanding.',
  },
  {
    id: 3,
    title: 'Katalog Menu Snack & Minuman Baru XXI Cafe Resmi Tersedia di CineTix',
    category: 'F&B Concession',
    date: '16 Oktober 2026',
    desc: 'Kini Anda dapat memesan popcorn rasa keju gurih dan caramel crunch langsung dari aplikasi tanpa perlu antre di counter.',
  },
];

export default function Home() {
  const [films, setFilms] = useState<Film[]>([]);
  const [bioskops, setBioskops] = useState<Bioskop[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('Semua');
  const [activeTab, setActiveTab] = useState<'tayang' | 'segera'>('tayang');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<Film[]>('/film'),
      api.get<Bioskop[]>('/bioskop'),
    ])
      .then(([filmRes, bioRes]) => {
        setFilms(filmRes.data);
        setBioskops(bioRes.data);
      })
      .catch((requestError: unknown) => setError(getApiError(requestError)))
      .finally(() => setLoading(false));
  }, []);

  // Banner auto-cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % promoBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const cities = ['Semua', ...new Set(bioskops.map((b) => b.kota).filter(Boolean))];

  const filteredFilms = films.filter((film) => {
    const matchesTab = activeTab === 'tayang' ? film.status === 'tayang' : film.status !== 'tayang';
    const matchesSearch = film.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          film.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingState label="Menyiapkan film dan jadwal bioskop..." />
      </div>
    );
  }

  const currentBanner = promoBanners[activeBannerIdx];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 w-full">
      
      {/* 1. TOP PROMO SLIDER / HERO BANNER */}
      <section className="relative overflow-hidden rounded-2xl border border-border-subtle bg-canvas-card shadow-xl">
        <div className={`p-6 sm:p-10 lg:p-12 bg-gradient-to-r ${currentBanner.bg} transition-all duration-700 min-h-[220px] sm:min-h-[260px] flex flex-col justify-center`}>
          <div className="max-w-xl space-y-3">
            <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest bg-gold-500/15 border border-gold-500/30 text-gold-400 uppercase">
              {currentBanner.tag}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text-headline tracking-tight leading-tight">
              {currentBanner.title}
            </h1>
            <p className="text-xs sm:text-sm text-text-body leading-relaxed">
              {currentBanner.desc}
            </p>
            <div className="pt-2">
              <Link
                to={currentBanner.link}
                className="inline-flex items-center space-x-2 bg-gold-500 hover:bg-gold-600 text-text-on-gold font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm shadow-gold-500/15"
              >
                <span>{currentBanner.cta}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-4 right-4 flex space-x-1.5 z-10">
          {promoBanners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveBannerIdx(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeBannerIdx === idx ? 'w-6 bg-gold-400' : 'w-2 bg-border-elevated'
              }`}
              aria-label={`Banner ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. CINEMA FILTER & SEARCH BAR */}
      <section className="bg-canvas-card border border-border-subtle rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* TAB PILIHAN: SEDANG TAYANG VS SEGERA HADIR */}
        <div className="flex items-center space-x-1 bg-canvas-base p-1 rounded-xl border border-border-subtle">
          <button
            type="button"
            onClick={() => setActiveTab('tayang')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'tayang'
                ? 'bg-gold-500 text-text-on-gold shadow-sm'
                : 'text-text-muted hover:text-text-headline'
            }`}
          >
            <FilmIcon className="w-3.5 h-3.5" />
            <span>Sedang Tayang</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('segera')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'segera'
                ? 'bg-gold-500 text-text-on-gold shadow-sm'
                : 'text-text-muted hover:text-text-headline'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Segera Hadir</span>
          </button>
        </div>

        {/* CITY SELECTOR & SEARCH BOX */}
        <div className="flex items-center space-x-3">
          {/* City Chips */}
          <div className="hidden lg:flex items-center space-x-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-text-muted font-medium">Kota:</span>
            {cities.slice(0, 4).map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  selectedCity === city
                    ? 'bg-canvas-elevated text-text-headline font-bold border border-border-elevated'
                    : 'text-text-muted hover:text-text-headline'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul film..."
              className="w-full bg-canvas-base border border-border-subtle text-text-headline pl-9 pr-3 py-2 text-xs rounded-xl focus:border-gold-500 focus:outline-none transition"
            />
          </div>
        </div>
      </section>

      {/* 3. MOVIE CATALOG GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold text-text-headline tracking-tight uppercase">
              {activeTab === 'tayang' ? 'Film Sedang Tayang di Bioskop' : 'Segera Tayang di Bioskop'}
            </h2>
            <p className="text-[11px] text-text-muted">
              Pilih film untuk melihat cabang bioskop dan jam penayangan
            </p>
          </div>

          <Link
            to="/film"
            className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center space-x-1 transition"
          >
            <span>Seluruh Katalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {error && <ErrorBanner message={error} />}

        {filteredFilms.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredFilms.map((film) => (
              <FilmCard key={film.id_film} film={film} />
            ))}
          </div>
        ) : (
          <div className="bg-canvas-card border border-border-subtle rounded-2xl p-12 text-center">
            <p className="text-xs text-text-muted">Tidak ada film yang cocok dengan pencarian.</p>
          </div>
        )}
      </section>

      {/* 4. CONCESSION F&B BANNER */}
      <section className="bg-gradient-to-r from-gold-950/20 via-canvas-card to-canvas-base border border-border-subtle rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2">
            <UtensilsCrossed className="w-4 h-4 text-gold-400" />
            <span className="text-[10px] font-bold tracking-widest text-gold-400 uppercase">
              CineTix Concession & Cafe
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-text-headline tracking-tight">
            Paket Popcorn Karamel, Minuman Segar & Camilan Bioskop
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Lengkapi keseruan menonton film favorit Anda. Pesan snack dan minuman secara praktis saat memilih kursi, langsung ambil di counter bioskop tanpa antre.
          </p>
        </div>

        <Link
          to="/film"
          className="shrink-0 bg-canvas-elevated hover:bg-canvas-floating text-gold-400 border border-gold-500/30 text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center space-x-2"
        >
          <span>Pilih Jadwal & F&B</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      {/* 5. SPOTLIGHT BERITA FILM */}
      <section className="space-y-4">
        <div className="border-b border-border-subtle pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <h2 className="text-base sm:text-lg font-bold text-text-headline tracking-tight uppercase">
              CineTix Spotlight & Berita Bioskop
            </h2>
          </div>
          <p className="text-[11px] text-text-muted mt-0.5">
            Informasi terkini seputar rilisan film layar lebar, ulasan, dan promo tiket bioskop
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {newsArticles.map((article) => (
            <article
              key={article.id}
              className="bg-canvas-card border border-border-subtle rounded-2xl p-5 space-y-3 hover:border-border-elevated transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-gold-400 uppercase tracking-wider">{article.category}</span>
                  <span className="text-text-muted">{article.date}</span>
                </div>
                <h3 className="text-xs font-bold text-text-headline leading-snug hover:text-gold-300 transition">
                  {article.title}
                </h3>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  {article.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-border-subtle">
                <span className="text-[11px] font-semibold text-gold-400 flex items-center space-x-1 cursor-pointer hover:underline">
                  <span>Baca Selengkapnya</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 6. KEUNGGULAN SISTEM */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="bg-canvas-card border border-border-subtle rounded-xl p-4 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-headline">Pembayaran Digital Terverifikasi</h4>
            <p className="text-[10px] text-text-muted">QRIS & Virtual Account otomatis terkonfirmasi</p>
          </div>
        </div>

        <div className="bg-canvas-card border border-border-subtle rounded-xl p-4 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-headline">Penguncian Kursi Otomatis</h4>
            <p className="text-[10px] text-text-muted">Bebas bentrok dengan proteksi sistem real-time</p>
          </div>
        </div>

        <div className="bg-canvas-card border border-border-subtle rounded-xl p-4 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 shrink-0">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-headline">E-Tiket & Boarding Pass Resmi</h4>
            <p className="text-[10px] text-text-muted">QR Code digital langsung siap dipindai di pintu studio</p>
          </div>
        </div>
      </section>

    </div>
  );
}
