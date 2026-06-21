import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getApiError } from '../api/axios';
import { ErrorBanner, LoadingState } from '../components/Status';
import { useAuth } from '../context/auth';

export default function Profile() {
  const navigate = useNavigate();
  const { user, refreshAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    nama: '',
    no_telepon: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        nama: user.nama || '',
        email: user.email || '',
      }));
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pengguna/me');
      setForm((prev) => ({
        ...prev,
        nama: response.data.nama || '',
        email: response.data.email || '',
        no_telepon: response.data.no_telepon || '',
      }));
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container page-loader"><LoadingState label="Memuat profil..." /></div>;

  return (
    <div className="page-content">
      <section className="page-hero compact-hero">
        <div className="container">
          <p className="eyebrow">Akun penonton</p>
          <h1>Profil Saya</h1>
          <p>Kelola informasi pribadi dan keamanan akun Anda.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '600px' }}>
          {error && <ErrorBanner message={error} />}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="admin-form">
            <h2>Edit Profil</h2>

            <label>
              Nama Lengkap
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                disabled
              />
            </label>

            <label>
              Nomor Telepon
              <input
                type="tel"
                name="no_telepon"
                value={form.no_telepon}
                onChange={handleChange}
                placeholder="081234567890"
              />
            </label>

            <hr style={{ margin: '2rem 0' }} />

            <h3>Ubah Password (Opsional)</h3>

            <label>
              Password Baru
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Biarkan kosong jika tidak ingin ubah"
              />
            </label>

            <label>
              Konfirmasi Password
              <input
                type="password"
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
                placeholder="Ketik ulang password baru"
              />
            </label>

            <div className="form-actions">
              <button className="button button-primary" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => navigate('/')}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
