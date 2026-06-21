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

  return (
    <div className="user-menu-wrapper">
      <button
        className="user-menu-toggle"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <span className="avatar">{user?.nama?.charAt(0)?.toUpperCase() || 'U'}</span>
        <div className="user-info-brief">
          <strong>{user?.nama || 'Pengguna'}</strong>
          <small>{user?.email}</small>
        </div>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          {!isEditing ? (
            <>
              <div className="user-profile-view">
                <span className="avatar-large">{user?.nama?.charAt(0)?.toUpperCase() || 'U'}</span>
                <div>
                  <strong>{user?.nama}</strong>
                  <small>{user?.email}</small>
                </div>
              </div>

              <button
                type="button"
                className="dropdown-link dropdown-edit"
                onClick={() => {
                  setIsEditing(true);
                  setForm((prev) => ({ ...prev, nama: user?.nama || '' }));
                  setError('');
                  setSuccess('');
                }}
              >
                ✎ Edit Profil
              </button>

              <hr />

              <button
                type="button"
                className="dropdown-link dropdown-logout"
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <h3>Edit Profil</h3>

              {error && <div className="alert alert-error" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</div>}
              {success && <div className="alert alert-success" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{success}</div>}

              <div className="form-group">
                <label>
                  <span>Nama</span>
                  <input
                    type="text"
                    name="nama"
                    value={form.nama}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="form-group">
                <label>
                  <span>Telepon</span>
                  <input
                    type="tel"
                    name="no_telepon"
                    value={form.no_telepon}
                    onChange={handleChange}
                    placeholder="081234567890"
                  />
                </label>
              </div>

              <div className="form-group">
                <label>
                  <span>Password Baru (opsional)</span>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Kosongkan jika tidak ingin ubah"
                  />
                </label>
              </div>

              {form.password && (
                <div className="form-group">
                  <label>
                    <span>Konfirmasi Password</span>
                    <input
                      type="password"
                      name="passwordConfirm"
                      value={form.passwordConfirm}
                      onChange={handleChange}
                      placeholder="Ketik ulang password"
                    />
                  </label>
                </div>
              )}

              <div className="dropdown-actions">
                <button
                  type="button"
                  className="button button-primary button-small"
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  className="button button-secondary button-small"
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                    setSuccess('');
                  }}
                >
                  Batal
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
