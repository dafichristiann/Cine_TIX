import { useState } from 'react';
import api, { getApiError } from '../api/axios';
import { useAuth } from '../context/auth';

export default function UserMenu() {
  const { user, signOut, refreshAuth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    nama: user?.nama || '',
    no_telepon: '',
    password: '',
    passwordConfirm: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    if (form.password && form.password !== form.passwordConfirm) {
      setError('Password tidak cocok');
      setSaving(false);
      return;
    }

    try {
      const payload: any = {
        nama: form.nama,
        no_telepon: form.no_telepon,
      };

      if (form.password) {
        payload.password = form.password;
      }

      await api.patch('/pengguna/me/profile', payload);
      setSuccess('Profil berhasil diperbarui!');
      setForm((prev) => ({ ...prev, password: '', passwordConfirm: '' }));
      await refreshAuth();
      setIsEditing(false);

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "mt-1 block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition";
  const labelClass = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3";

  return (
    <div className="relative w-full">
      {/* Pemicu Menu Pengguna (Terintegrasi ke Sidebar Bawah) */}
      <button
        className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-800/40 transition group focus:outline-none"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          <span className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-sm font-bold text-teal-400 flex-shrink-0 group-hover:border-teal-500/40 transition">
            {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
          </span>
          <div className="overflow-hidden">
            <strong className="block text-sm font-medium text-slate-200 truncate group-hover:text-white transition">
              {user?.nama || 'Pengguna'}
            </strong>
            <small className="block text-xs text-slate-500 truncate">{user?.email}</small>
          </div>
        </div>
        <span className="text-slate-500 text-xs ml-2 group-hover:text-slate-400 transition">⚙️</span>
      </button>

      {/* Menu Dropdown / Floating Panel */}
      {isOpen && (
        <>
          {/* Overlay klik-luar untuk menutup dropdown */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute bottom-14 left-0 z-50 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl shadow-slate-950/50 p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {!isEditing ? (
              <>
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-800 mb-2">
                  <span className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-base font-bold text-teal-400">
                    {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <div className="overflow-hidden">
                    <strong className="block text-sm font-semibold text-white truncate">{user?.nama}</strong>
                    <small className="block text-xs text-slate-400 truncate">{user?.email}</small>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full flex items-center space-x-2 text-left text-xs font-semibold text-teal-400 hover:text-teal-300 py-2.5 px-2 rounded-lg hover:bg-teal-500/5 transition"
                  onClick={() => {
                    setIsEditing(true);
                    setForm((prev) => ({ ...prev, nama: user?.nama || '' }));
                    setError('');
                    setSuccess('');
                  }}
                >
                  <span>✎</span> <span>Edit Profil Anda</span>
                </button>

                <hr className="border-slate-800 my-1" />

                <button
                  type="button"
                  className="w-full flex items-center space-x-2 text-left text-xs font-semibold text-rose-400 hover:text-rose-300 py-2.5 px-2 rounded-lg hover:bg-rose-500/5 transition"
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                >
                  <span>🚪</span> <span>Keluar Aplikasi</span>
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white mb-2">⚙️ Ubah Data Akun</h3>

                {error && <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">{error}</div>}
                {success && <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">{success}</div>}

                <label className={labelClass}>Nama
                  <input type="text" name="nama" className={inputClass} value={form.nama} onChange={handleChange} required />
                </label>

                <label className={labelClass}>Telepon
                  <input type="tel" name="no_telepon" className={inputClass} value={form.no_telepon} onChange={handleChange} placeholder="081234567890" />
                </label>

                <label className={labelClass}>Password Baru (opsional)
                  <input type="password" name="password" className={inputClass} value={form.password} onChange={handleChange} placeholder="Lewati jika tetap sama" />
                </label>

                {form.password && (
                  <label className={labelClass}>Konfirmasi Password
                    <input type="password" name="passwordConfirm" className={inputClass} value={form.passwordConfirm} onChange={handleChange} placeholder="Ketik ulang sandi" />
                  </label>
                )}

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs py-2 rounded-lg transition disabled:opacity-55"
                    disabled={saving}
                    onClick={handleSave}
                  >
                    {saving ? 'Proses...' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-lg transition"
                    onClick={() => {
                      setIsEditing(false);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}