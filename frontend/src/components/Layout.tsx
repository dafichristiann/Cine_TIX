import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { getInitials } from '../lib/format';
import { useAuth } from '../context/auth';

export default function Layout() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container nav-wrap">
          <Link className="brand" to="/" onClick={closeMenu}>
            <span className="brand-mark">C</span>
            <span>Cine<span>Tix</span></span>
          </Link>
          <button className="menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Buka menu">
            <span /><span /><span />
          </button>
          <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'}>
            <NavLink to="/" end onClick={closeMenu}>Beranda</NavLink>
            <NavLink to="/film" onClick={closeMenu}>Film</NavLink>
            <a href="/#cara-pesan" onClick={closeMenu}>Cara Pesan</a>
            {isAuthenticated ? (
              <div className="user-menu">
                <span className="avatar">{getInitials(user?.nama)}</span>
                <div><strong>{user?.nama || 'Pengguna'}</strong><small>{user?.email}</small></div>
                <button type="button" className="link-button" onClick={() => { signOut(); closeMenu(); }}>Keluar</button>
              </div>
            ) : (
              <div className="nav-actions">
                <Link className="nav-login" to="/login" onClick={closeMenu}>Masuk</Link>
                <Link className="button button-primary button-small" to="/register" onClick={closeMenu}>Daftar</Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Link className="brand brand-light" to="/"><span className="brand-mark">C</span><span>Cine<span>Tix</span></span></Link>
            <p>Pesan tiket bioskop favoritmu dengan lebih cepat, aman, dan tanpa antre.</p>
          </div>
          <div><strong>Navigasi</strong><Link to="/film">Film</Link><a href="/#cara-pesan">Cara pesan</a></div>
          <div><strong>Bantuan</strong><a href="mailto:support@cinetix.id">support@cinetix.id</a><span>Setiap hari, 09.00 - 22.00</span></div>
        </div>
        <div className="container footer-bottom">© {new Date().getFullYear()} CineTix. Dibuat untuk pengalaman nonton terbaik.</div>
      </footer>
    </div>
  );
}
