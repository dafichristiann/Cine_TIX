import { useState } from 'react';
import { Settings, Edit3, LogOut, Check, ChevronDown } from 'lucide-react';
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

  const inputClass = "mt-1 block w-full rounded-lg bg-canvas-base border border-border-subtle text-text-headline px-3 py-2 text-xs focus:border-gold-500 focus:outline-none transition";
  const labelClass = "block text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2";

  return (
    <div className="relative w-full">
      <button
        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left bg-canvas-elevated border border-border-elevated hover:bg-canvas-floating hover:border-gold-500/30 transition group focus:outline-none"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          <span className="w-8 h-8 rounded-lg bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-xs font-bold text-gold-400 shrink-0">
            {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
          </span>
          <div className="overflow-hidden">
            <strong className="block text-xs font-semibold text-text-headline truncate group-hover:text-gold-400 transition">
              {user?.nama || 'Pengguna'}
            </strong>
            <small className="block text-[11px] text-text-muted truncate">{user?.email}</small>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-text-muted group-hover:text-text-headline transition" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute top-full right-0 mt-2 z-50 w-72 bg-canvas-floating border border-border-elevated rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {!isEditing ? (
              <>
                <div className="flex items-center space-x-3 pb-3 border-b border-border-subtle mb-2">
                  <span className="w-9 h-9 rounded-lg bg-canvas-base border border-border-subtle flex items-center justify-center text-xs font-bold text-gold-400">
                    {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <div className="overflow-hidden">
                    <strong className="block text-xs font-semibold text-text-headline truncate">{user?.nama}</strong>
                    <small className="block text-[11px] text-text-muted truncate">{user?.email}</small>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full flex items-center space-x-2.5 text-left text-xs font-medium text-text-body hover:text-gold-400 py-2.5 px-2.5 rounded-lg hover:bg-canvas-elevated transition"
                  onClick={() => {
                    setIsEditing(true);
                    setForm((prev) => ({ ...prev, nama: user?.nama || '' }));
                    setError('');
                    setSuccess('');
                  }}
                >
                  <Edit3 className="w-3.5 h-3.5 text-text-muted" />
                  <span>Ubah Data Profil</span>
                </button>

                <hr className="border-border-subtle my-1" />

                <button
                  type="button"
                  className="w-full flex items-center space-x-2.5 text-left text-xs font-medium text-rose-400 hover:text-rose-300 py-2.5 px-2.5 rounded-lg hover:bg-rose-500/10 transition"
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Keluar dari Akun</span>
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                  <h3 className="text-xs font-bold text-text-headline flex items-center space-x-1.5">
                    <Settings className="w-3.5 h-3.5 text-gold-400" />
                    <span>Pengaturan Akun</span>
                  </h3>
                  <button
                    type="button"
                    className="text-xs text-text-muted hover:text-text-headline"
                    onClick={() => setIsEditing(false)}
                  >
                    Batal
                  </button>
                </div>

                {error && <div className="p-2 text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg">{error}</div>}
                {success && <div className="p-2 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">{success}</div>}

                <div>
                  <label className={labelClass}>Nama Lengkap</label>
                  <input
                    type="text"
                    name="nama"
                    value={form.nama}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Nama Lengkap"
                  />
                </div>

                <div>
                  <label className={labelClass}>No. Telepon / WhatsApp</label>
                  <input
                    type="tel"
                    name="no_telepon"
                    value={form.no_telepon}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="08123456789"
                  />
                </div>

                <div>
                  <label className={labelClass}>Kata Sandi Baru (Opsional)</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Kosongkan jika tidak diubah"
                  />
                </div>

                {form.password && (
                  <div>
                    <label className={labelClass}>Konfirmasi Kata Sandi Baru</label>
                    <input
                      type="password"
                      name="passwordConfirm"
                      value={form.passwordConfirm}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Ulangi kata sandi baru"
                    />
                  </div>
                )}

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="w-full mt-2 bg-gold-500 hover:bg-gold-600 text-text-on-gold font-bold text-xs py-2 px-3 rounded-lg transition shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
