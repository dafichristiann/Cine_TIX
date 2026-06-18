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
      })
      .catch((requestError: unknown) => setError(getApiError(requestError)))
      .finally(() => setLoading(false));
  }, []);

  const featured = films.slice(0, 4);
  const spotlight = films[0];

  return (
    <>
      <section className="hero-section">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="pill"><span /> Pengalaman bioskop dalam genggaman</span>
            <h1>Cerita besar dimulai dari <em>satu kursi.</em></h1>
            <p>Temukan film terbaru, pilih jadwal yang pas, dan amankan kursi favoritmu dalam hitungan menit.</p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/film">Pesan tiket sekarang <span>→</span></Link>
              <a className="button button-ghost" href="#sedang-tayang">Lihat film</a>
            </div>
            <div className="hero-trust"><span>✓ Tanpa biaya tersembunyi</span><span>✓ Kursi real-time</span></div>
          </div>
          <div className="hero-visual">
            <div className="ticket-card">
              <div className="ticket-poster">
                {spotlight ? <PosterImage film={spotlight} /> : <div className="cinema-light">C</div>}
                <span className="ticket-label">Pilihan minggu ini</span>
              </div>
              <div className="ticket-info">
                <p>SEGERA DI LAYAR</p>
                <h2>{spotlight?.judul || 'Film pilihan CineTix'}</h2>
                <div><span>{spotlight?.genre || 'Beragam genre'}</span><span>{spotlight ? `${spotlight.durasi} menit` : 'Setiap hari'}</span></div>
              </div>
            </div>
            <div className="floating-card"><strong>{scheduleCount}+</strong><span>Jadwal tersedia</span></div>
          </div>
        </div>
      </section>

      <section className="section" id="sedang-tayang">
        <div className="container">
          <div className="section-heading">
            <div><p className="eyebrow">Pilihan terbaik</p><h2>Sedang tayang</h2><p>Film yang siap menemani waktu terbaikmu.</p></div>
            <Link className="text-link" to="/film">Lihat semua film →</Link>
          </div>
          {error && <ErrorBanner message={error} />}
          {loading ? <LoadingState label="Menyiapkan film terbaik..." /> : (
            <div className="movie-grid">{featured.map((film) => <FilmCard film={film} key={film.id_film} />)}</div>
          )}
        </div>
      </section>

      <section className="section steps-section" id="cara-pesan">
        <div className="container">
          <div className="center-heading"><p className="eyebrow">Mudah dan cepat</p><h2>Tiga langkah menuju layar lebar</h2></div>
          <div className="steps-grid">
            <article><span className="step-number">01</span><div className="step-icon">⌕</div><h3>Pilih film & jadwal</h3><p>Temukan film favorit dan waktu tayang yang sesuai dengan harimu.</p></article>
            <article><span className="step-number">02</span><div className="step-icon">▦</div><h3>Tentukan kursi</h3><p>Lihat ketersediaan real-time dan pilih posisi menonton ternyaman.</p></article>
            <article><span className="step-number">03</span><div className="step-icon">✓</div><h3>Bayar & nikmati</h3><p>Selesaikan pembayaran dan tiket digitalmu langsung siap digunakan.</p></article>
          </div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container cta-card"><div><p className="eyebrow">Waktunya menikmati cerita</p><h2>Film bagus tidak suka menunggu.</h2><p>Pilih kursimu sebelum diambil penonton lain.</p></div><Link className="button button-light" to="/film">Jelajahi film →</Link></div>
      </section>
    </>
  );
}
