import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/auth';
import UserMenu from './UserMenu';

export default function Layout() {
  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCaraPesan, setShowCaraPesan] = useState(false); // State untuk mengontrol Modal Cara Pesan
  
  const closeMenu = () => setSidebarOpen(false);

  // Link Navigasi Dasar
  const navigationLinks = [
    { path: '/', label: 'Beranda', icon: '🏠' },
    { path: '/film', label: 'Film', icon: '🎬' },
  ];

  // Data Langkah Cara Pemesanan Tiket
  const alurPemesanan = [
    { step: '01', title: 'Pilih Film & Jadwal', desc: 'Jelajahi katalog film yang sedang tayang, lalu pilih jadwal bioskop yang Anda inginkan.' },
    { step: '02', title: 'Tentukan Kursi', desc: 'Pilih posisi kursi terbaik Anda langsung melalui peta kursi interaktif yang tersedia.' },
    { step: '03', title: 'Pembayaran Aman', desc: 'Selesaikan transaksi secara instan melalui berbagai metode pembayaran digital pilihan Anda.' },
    { step: '04', title: 'Terima E-Tiket', desc: 'Tiket digital otomatis tersimpan di akun Anda dan siap di-scan saat tiba di bioskop.' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* 1. HEADER KHUSUS MOBILE */}
      <header className="md:hidden w-full bg-slate-900 border-b border-slate-800/80 px-5 py-4 flex items-center justify-between sticky top-0 z-30">
        <Link className="flex items-center space-x-2 font-bold text-white tracking-tight" to="/" onClick={closeMenu}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center font-black text-slate-950 text-sm">C</div>
          <span>Cine<span className="text-teal-400">Tix</span></span>
        </Link>
        <button 
          className="text-slate-400 hover:text-white focus:outline-none p-1" 
          type="button" 
          onClick={() => setSidebarOpen((open) => !open)} 
          aria-label="Toggle menu"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* 2. SIDEBAR UTAMA */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Logo Branding - Desktop */}
          <div className="hidden md:flex p-6 border-b border-slate-800/60 items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center font-black text-slate-950 text-lg shadow-md shadow-teal-500/20">
              C
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">Cine<span className="text-teal-400">Tix</span></span>
          </div>

          {/* List Navigasi Menu */}
          <nav className="p-4 space-y-1 mt-4 md:mt-0">
            {navigationLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={closeMenu}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition
                  ${isActive 
                    ? 'bg-gradient-to-r from-teal-500/10 to-transparent border border-teal-500/20 text-teal-400 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
                `}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}

            {isAuthenticated && (
              <NavLink
                to="/tiket-saya"
                onClick={closeMenu}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition
                  ${isActive 
                    ? 'bg-gradient-to-r from-teal-500/10 to-transparent border border-teal-500/20 text-teal-400 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
                `}
              >
                <span className="text-base">🎟️</span>
                <span>Tiket Saya</span>
              </NavLink>
            )}

            {user?.role?.toLowerCase() === 'admin' && (
              <NavLink
                to="/admin"
                onClick={closeMenu}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition
                  ${isActive 
                    ? 'bg-gradient-to-r from-teal-500/10 to-transparent border border-teal-500/20 text-teal-400 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
                `}
              >
                <span className="text-base">⚡</span>
                <span>Admin Panel</span>
              </NavLink>
            )}

            {/* Tombol Trigger Modal Cara Pesan Modern */}
            <button 
              type="button"
              onClick={() => { setShowCaraPesan(true); closeMenu(); }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition text-left focus:outline-none"
            >
              <span className="text-base">❓</span>
              <span>Cara Pesan</span>
            </button>
          </nav>
        </div>

        {/* Profil & Aksi Autentikasi */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/40">
          {isAuthenticated ? (
            <div className="flex items-center justify-center md:justify-start">
              <UserMenu />
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <Link className="text-center text-sm font-medium text-slate-300 hover:text-white py-2 transition" to="/login" onClick={closeMenu}>Masuk</Link>
              <Link className="text-center text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 py-2.5 px-4 rounded-xl transition shadow-md shadow-teal-500/10" to="/register" onClick={closeMenu}>Daftar Sekarang</Link>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay Background saat Sidebar Mobile Terbuka */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm md:hidden" onClick={closeMenu} />
      )}

      {/* 3. MODAL DIALOG POP-UP: CARA PESAN */}
      {showCaraPesan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl shadow-teal-950/20 animate-in fade-in zoom-in-95 duration-200">
            {/* Tombol Tutup Modal */}
            <button 
              type="button" 
              onClick={() => setShowCaraPesan(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm transition focus:outline-none"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold tracking-widest text-teal-400 uppercase">Panduan Pengguna</span>
              <h2 className="text-2xl font-extrabold text-white mt-1">Langkah Mudah Memesan Tiket</h2>
              <p className="text-sm text-slate-400 mt-1">Ikuti 4 alur sederhana berikut untuk mulai menikmati film pilihan Anda di bioskop CineTix.</p>
            </div>

            {/* Grid Alur Sistem */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {alurPemesanan.map((item, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800/60 rounded-xl p-4 flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-teal-500/30 tracking-wider font-mono">{item.step}</span>
                    <span className="w-2 h-2 rounded-full bg-teal-500/20 border border-teal-500/40" />
                  </div>
                  <strong className="text-sm font-semibold text-slate-200">{item.title}</strong>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowCaraPesan(false)}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm px-5 py-2 rounded-xl transition"
              >
                Mengerti, Siap Pesan!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. KONTEN UTAMA DAN FOOTER */}
      <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto bg-slate-950">
        <main className="flex-grow p-6 sm:p-8 md:p-10">
          <Outlet />
        </main>

        <footer className="bg-slate-900/40 border-t border-slate-900 px-6 py-8 sm:px-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
              <Link className="flex items-center space-x-2 font-bold text-white text-base" to="/">
                <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center font-black text-slate-950 text-xs">C</div>
                <span>Cine<span className="text-teal-400">Tix</span></span>
              </Link>
              <p className="text-slate-400 mt-3 leading-relaxed">Pesan tiket bioskop favoritmu dengan lebih cepat, aman, dan tanpa antre.</p>
            </div>
            <div className="flex flex-col space-y-2">
              <strong className="text-white font-semibold">Navigasi</strong>
              <Link to="/film" className="text-slate-400 hover:text-teal-400 transition w-max">Film Terkini</Link>
              <button onClick={() => setShowCaraPesan(true)} className="text-slate-400 hover:text-teal-400 transition w-max text-left">Cara Pemesanan</button>
            </div>
            <div className="flex flex-col space-y-1">
              <strong className="text-white font-semibold mb-1">Bantuan</strong>
              <a href="mailto:support@cinetix.id" className="text-teal-400 hover:underline font-medium w-max">support@cinetix.id</a>
              <span className="text-slate-500 text-xs">Layanan: Setiap hari, 09.00 - 22.00</span>
            </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-slate-900/60 mt-8 pt-4 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} CineTix. Dibuat untuk pengalaman nonton terbaik.
          </div>
        </footer>
      </div>

    </div>
  );
}