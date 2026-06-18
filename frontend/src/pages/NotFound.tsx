import { Link } from 'react-router-dom';

export default function NotFound() {
  return <div className="not-found container"><span>404</span><h1>Halaman tidak ditemukan</h1><p>Sepertinya kamu masuk ke studio yang salah.</p><Link className="button button-primary" to="/">Kembali ke beranda</Link></div>;
}
