import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  MapPin, 
  Ticket, 
  Shield, 
  Menu, 
  X, 
  LogIn, 
  UserPlus, 
  Info,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/auth';
import UserMenu from './UserMenu';
import api from '../api/axios';
import type { Bioskop } from '../types';

export default function Layout() {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Jakarta');
  const [cities, setCities] = useState<string[]>(['Jakarta', 'Surabaya', 'Bandung', 'Yogyakarta', 'Medan']);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    api.get<Bioskop[]>('/bioskop')
      .then((res) => {
        const uniqueCities = Array.from(new Set(res.data.map((b) => b.kota).filter(Boolean)));
        if (uniqueCities.length) setCities(uniqueCities);
      })
      .catch(() => {});
  }, []);

  // Close menus on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setCityDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: '/', label: 'Beranda' },
    { path: '/film', label: 'Film & Jadwal' },
  ];

  return (
    <div className="min-h-screen bg-canvas-base text-text-body font-sans flex flex-col antialiased selection:bg-gold-500/20 selection:text-gold-300">
      
      {/* 1. TOP HEADER / APP BAR (CINEMA XXI / TIX ID ROYAL MIDNIGHT & SATIN GOLD) */}
      <header className="sticky top-0 z-40 w-full bg-canvas-card/95 backdrop-blur-md border-b border-border-subtle shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* BRAND LOGO & CITY SELECTOR */}
            <div className="flex items-center space-x-6">
              <Link className="flex items-center space-x-2.5 group" to="/">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-gold-600 to-gold-400 flex items-center justify-center font-black text-text-on-gold text-lg shadow-md shadow-gold-500/10 group-hover:scale-105 transition">
                  C
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-text-headline text-xl tracking-tight leading-none group-hover:text-gold-400 transition">
                    Cine<span className="text-gold-400">Tix</span>
                  </span>
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">
                    Cinema Network
                  </span>
                </div>
              </Link>

              {/* CITY PICKER (21 CINEPLEX / TIX ID SIGNATURE) */}
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-canvas-elevated border border-border-elevated hover:border-gold-500/40 text-xs font-semibold text-text-headline transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-gold-400" />
                  <span>{selectedCity}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                </button>

                {cityDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setCityDropdownOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 z-50 w-48 bg-canvas-floating border border-border-elevated rounded-xl shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-subtle">
                        Pilih Kota Bioskop
                      </div>
                      {cities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setSelectedCity(city);
                            setCityDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-medium transition flex items-center justify-between ${
                            selectedCity === city
                              ? 'bg-gold-500/10 text-gold-400 font-bold'
                              : 'text-text-body hover:bg-canvas-elevated'
                          }`}
                        >
                          <span>{city}</span>
                          {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* DESKTOP NAVIGATION LINKS */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) => `
                    px-4 py-2 rounded-xl text-xs font-bold transition
                    ${isActive 
                      ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' 
                      : 'text-text-body hover:text-text-headline hover:bg-canvas-elevated'}
                  `}
                >
                  {link.label}
                </NavLink>
              ))}

              {isAuthenticated && (
                <NavLink
                  to="/tiket-saya"
                  className={({ isActive }) => `
                    flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition
                    ${isActive 
                      ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' 
                      : 'text-text-body hover:text-text-headline hover:bg-canvas-elevated'}
                  `}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Tiket Saya</span>
                </NavLink>
              )}

              {user?.role?.toLowerCase() === 'admin' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `
                    flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition
                    ${isActive 
                      ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' 
                      : 'text-text-body hover:text-text-headline hover:bg-canvas-elevated'}
                  `}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </NavLink>
              )}

              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-text-headline hover:bg-canvas-elevated transition"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Panduan</span>
              </button>
            </nav>

            {/* USER ACTIONS (RIGHT) */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="w-60">
                  <UserMenu />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="flex items-center space-x-1.5 text-xs font-semibold text-text-body hover:text-text-headline px-3.5 py-2 rounded-xl border border-border-elevated hover:bg-canvas-elevated transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Masuk</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center space-x-1.5 text-xs font-bold bg-gold-500 hover:bg-gold-600 text-text-on-gold px-4 py-2 rounded-xl transition shadow-sm shadow-gold-500/15"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Daftar</span>
                  </Link>
                </div>
              )}
            </div>

            {/* MOBILE MENU TOGGLE BUTTON */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-canvas-elevated border border-border-subtle text-text-body hover:text-text-headline focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* MOBILE MENU ACCORDION */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-canvas-card border-b border-border-subtle px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
            {/* Mobile City Selector */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-canvas-elevated border border-border-subtle">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gold-400" />
                <span className="text-xs text-text-muted">Kota Bioskop:</span>
              </div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-xs font-bold text-text-headline border-0 focus:outline-none"
              >
                {cities.map((c) => (
                  <option key={c} value={c} className="bg-canvas-card text-text-headline">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <nav className="space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) => `
                    block px-3 py-2.5 rounded-xl text-xs font-bold transition
                    ${isActive ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' : 'text-text-body hover:bg-canvas-elevated'}
                  `}
                >
                  {link.label}
                </NavLink>
              ))}

              {isAuthenticated && (
                <NavLink
                  to="/tiket-saya"
                  className={({ isActive }) => `
                    flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition
                    ${isActive ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' : 'text-text-body hover:bg-canvas-elevated'}
                  `}
                >
                  <Ticket className="w-4 h-4" />
                  <span>Tiket Saya</span>
                </NavLink>
              )}

              {user?.role?.toLowerCase() === 'admin' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `
                    flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition
                    ${isActive ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' : 'text-text-body hover:bg-canvas-elevated'}
                  `}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </NavLink>
              )}

              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="w-full text-left flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium text-text-muted hover:text-text-headline hover:bg-canvas-elevated transition"
              >
                <Info className="w-4 h-4" />
                <span>Panduan Pemesanan</span>
              </button>
            </nav>

            <div className="pt-2 border-t border-border-subtle">
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    className="text-center py-2 text-xs font-semibold text-text-body bg-canvas-elevated border border-border-subtle rounded-xl"
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    className="text-center py-2 text-xs font-bold text-text-on-gold bg-gold-500 rounded-xl"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. MAIN BODY CONTENT */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* 3. FOOTER */}
      <footer className="w-full bg-[#06090F] border-t border-border-subtle mt-16 text-text-muted text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-border-subtle">
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-gold-500 flex items-center justify-center font-black text-text-on-gold text-sm">
                  C
                </div>
                <span className="font-black text-text-headline text-base tracking-tight">Cine<span className="text-gold-400">Tix</span></span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Platform reservasi tiket bioskop terintegrasi di Indonesia. Pesan tiket, pilih kursi favorit secara real-time, nikmati popcorn khas bioskop, dan dapatkan e-tiket digital instan.
              </p>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-text-headline uppercase tracking-wider">Layanan Penonton</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link to="/film" className="hover:text-gold-400 transition">Film Sedang Tayang</Link></li>
                <li><Link to="/film" className="hover:text-gold-400 transition">Segera Hadir</Link></li>
                <li><Link to="/tiket-saya" className="hover:text-gold-400 transition">E-Tiket & Boarding Pass</Link></li>
                <li><button type="button" onClick={() => setShowGuideModal(true)} className="hover:text-gold-400 transition">Cara Pesan Tiket</button></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-text-headline uppercase tracking-wider">Jaringan Bioskop</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li>Cinema XXI & The Premiere</li>
                <li>CGV Cinemas Indonesia</li>
                <li>Cinépolis Cinema</li>
                <li>Studio IMAX & Dolby Atmos</li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-text-headline uppercase tracking-wider">Keamanan & Pembayaran</h4>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Transaksi dilindungi dengan enkripsi TLS 256-bit dan verifikasi resmi via SMTP Mailer. Mendukung pembayaran QRIS nasional, BCA, Mandiri, BRI, dan Kartu Pembayaran.
              </p>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-text-disabled">
            <p>&copy; 2026 CineTix Cinema Network. Seluruh hak cipta dilindungi.</p>
            <div className="flex items-center space-x-6">
              <span>Syarat & Ketentuan</span>
              <span>Kebijakan Privasi</span>
              <span>Bantuan Penonton</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 4. MODAL CARA PESAN */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas-base/80 backdrop-blur-sm">
          <div className="bg-canvas-card border border-border-elevated rounded-2xl max-w-lg w-full p-6 relative shadow-2xl animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-headline p-1 rounded-lg hover:bg-canvas-elevated"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-text-headline mb-1">Panduan Pemesanan Tiket</h3>
            <p className="text-xs text-text-muted mb-6">Nikmati pengalaman menonton film dalam 4 langkah mudah:</p>

            <div className="space-y-3.5">
              {[
                { step: '01', title: 'Pilih Film & Jadwal', desc: 'Jelajahi film yang sedang tayang, pilih cabang bioskop terdekat dan waktu tayang yang sesuai.' },
                { step: '02', title: 'Tentukan Nomor Kursi', desc: 'Pilih posisi kursi terbaik melalui denah interaktif real-time dengan status terkunci aman.' },
                { step: '03', title: 'Pilih Camilan F&B & Promo', desc: 'Tambahkan paket popcorn atau camilan favorit, lalu masukkan kode voucher diskon bila ada.' },
                { step: '04', title: 'E-Tiket & Boarding Pass', desc: 'Selesaikan transaksi dengan QRIS atau Virtual Account, dapatkan QR Code digital resmi.' },
              ].map((item, idx) => (
                <div key={idx} className="flex space-x-3 bg-canvas-elevated p-3 rounded-xl border border-border-subtle">
                  <span className="font-mono text-xs font-bold text-gold-400 shrink-0">{item.step}</span>
                  <div>
                    <h4 className="text-xs font-bold text-text-headline">{item.title}</h4>
                    <p className="text-[11px] text-text-muted leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border-subtle flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="bg-gold-500 hover:bg-gold-600 text-text-on-gold font-bold text-xs px-5 py-2 rounded-xl transition shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
